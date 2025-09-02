import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import EventModal from '../../components/EventModal';
import EventDetailModal from '../../components/EventDetailModal';
import MonthYearPicker from '../../components/MonthYearPicker';

const eventColors = [
  '#6366f1', // Primary - 내 일정
  '#f59e0b', // Amber - 다른 사용자 1
  '#10b981', // Green - 다른 사용자 2
  '#ef4444', // Red - 다른 사용자 3
  '#8b5cf6', // Purple - 다른 사용자 4
  '#06b6d4', // Cyan - 다른 사용자 5
];

export default function CalendarScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState('');
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: '웨비나',
      description: '프로젝트 진행 상황 논의',
      time: '오후 2:00',
      date: '2025-09-02',
      userId: 'user1',
      userName: '내가',
    },
    {
      id: '2',
      title: '텍스토어 업무',
      description: '친구들과 만남',
      time: '오후 6:00',
      date: '2025-09-02',
      userId: 'user1',
      userName: '내가',
    },
    {
      id: '3',
      title: '새일즈',
      description: '영업팀 회의',
      time: '오전 10:00',
      date: '2025-09-03',
      userId: 'user2',
      userName: '김철수',
    },
    {
      id: '4',
      title: '저과',
      description: '저녁 식사',
      time: '오후 7:00',
      date: '2025-09-03',
      userId: 'user1',
      userName: '내가',
    },
    {
      id: '5',
      title: '두더지',
      description: '게임',
      time: '오후 8:00',
      date: '2025-09-05',
      userId: 'user3',
      userName: '이영희',
    },
  ]);

  const handleSaveEvent = (eventData: any) => {
    const newEvent = {
      id: Date.now().toString(),
      userId: user?.id || 'user1',
      userName: user?.user_metadata?.name || '내가',
      ...eventData,
    };
    setEvents([...events, newEvent]);
    console.log('Event saved:', newEvent);
  };

  const handleMonthYearSelect = (year: number, month: number) => {
    const newDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    setCurrentMonth(newDate);
    setSelectedDate('');
  };

  const today = new Date().toISOString().split('T')[0];

  // 사용자별 색상 할당
  const getUserColor = (userId: string) => {
    const userIds = [...new Set(events.map(e => e.userId))];
    const index = userIds.indexOf(userId);
    return eventColors[index % eventColors.length];
  };

  // 각 날짜별 일정들을 그룹화
  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };


  // 마크된 날짜 생성 (이벤트가 있는 날짜 표시)
  const markedDates = events.reduce((marked: any, event) => {
    const dateEvents = getEventsForDate(event.date);
    if (!marked[event.date]) {
      marked[event.date] = {
        marked: true,
        dots: [],
      };
    }
    
    // 각 사용자별로 하나의 점만 표시
    const userIds = [...new Set(dateEvents.map(e => e.userId))];
    marked[event.date].dots = userIds.map(userId => ({
      color: getUserColor(userId),
    }));
    
    return marked;
  }, {});

  // 선택된 날짜 추가
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: lightTheme.colors.primary,
    };
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.calendarContainer}>
        <Calendar
          key={currentMonth}
          current={currentMonth}
          markedDates={markedDates}
          markingType="multi-dot"
          onDayPress={(day) => {
            console.log('Selected date:', day.dateString);
            setSelectedDate(day.dateString);
          }}
          monthFormat={'yyyy년 M월'}
          onPressArrowLeft={(subtractMonth) => {
            subtractMonth();
            const currentDate = new Date(currentMonth);
            currentDate.setMonth(currentDate.getMonth() - 1);
            setCurrentMonth(currentDate.toISOString().split('T')[0]);
          }}
          onPressArrowRight={(addMonth) => {
            addMonth();
            const currentDate = new Date(currentMonth);
            currentDate.setMonth(currentDate.getMonth() + 1);
            setCurrentMonth(currentDate.toISOString().split('T')[0]);
          }}
          renderHeader={(date) => {
            const currentDate = new Date(currentMonth);
            const monthYear = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
            return (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowMonthYearPicker(true)}
              >
                <Text style={styles.headerText}>{monthYear}</Text>
              </TouchableOpacity>
            );
          }}
          theme={{
            backgroundColor: lightTheme.colors.background,
            calendarBackground: lightTheme.colors.surface,
            textSectionTitleColor: lightTheme.colors.textSecondary,
            selectedDayBackgroundColor: lightTheme.colors.primary,
            selectedDayTextColor: 'white',
            todayTextColor: lightTheme.colors.primary,
            dayTextColor: lightTheme.colors.text,
            textDisabledColor: lightTheme.colors.textSecondary,
            dotColor: lightTheme.colors.accent,
            selectedDotColor: 'white',
            arrowColor: lightTheme.colors.primary,
            monthTextColor: lightTheme.colors.text,
            indicatorColor: lightTheme.colors.primary,
            'stylesheet.calendar.main': {
              week: {
                marginTop: 0,
                marginBottom: 0,
                flexDirection: 'row',
                justifyContent: 'space-around',
              },
            },
          }}
          style={styles.calendar}
          dayComponent={({date, state}) => {
            const dateString = date?.dateString || '';
            const dayEvents = getEventsForDate(dateString);
            const isSelected = selectedDate === dateString;
            const isToday = dateString === today;
            
            return (
              <TouchableOpacity
                style={styles.dayContainer}
                onPress={() => {
                  console.log('Selected date:', dateString);
                  setSelectedDate(dateString);
                  if (dayEvents.length > 0) {
                    setShowEventDetail(true);
                  }
                }}
              >
                <View style={[
                  styles.dayNumberContainer,
                  isSelected && styles.selectedDay,
                  isToday && styles.todayDay,
                ]}>
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayDayText,
                    state === 'disabled' && styles.disabledDayText,
                  ]}>
                    {date?.day}
                  </Text>
                </View>
                {dayEvents.slice(0, 3).map((event, index) => (
                  <View
                    key={event.id}
                    style={[
                      styles.eventIndicator,
                      { backgroundColor: getUserColor(event.userId) },
                      { top: 26 + index * 15 }
                    ]}
                  >
                    <Text style={styles.eventIndicatorText} numberOfLines={1} ellipsizeMode="clip">
                      {event.title}
                    </Text>
                  </View>
                ))}
                {dayEvents.length > 3 && (
                  <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>


      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowEventModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <EventModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        selectedDate={selectedDate || today}
        onSave={handleSaveEvent}
      />

      <EventDetailModal
        visible={showEventDetail}
        onClose={() => setShowEventDetail(false)}
        selectedDate={selectedDate}
        events={getEventsForDate(selectedDate)}
        getUserColor={getUserColor}
      />

      <MonthYearPicker
        visible={showMonthYearPicker}
        onClose={() => setShowMonthYearPicker(false)}
        currentDate={currentMonth}
        onSelect={handleMonthYearSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: lightTheme.colors.surface,
    marginTop: lightTheme.spacing.sm,
  },
  calendar: {
    borderRadius: lightTheme.borderRadius.lg,
  },
  headerButton: {
    paddingVertical: lightTheme.spacing.sm,
    paddingHorizontal: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
  },
  headerText: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  dayContainer: {
    width: 50.5,
    height: 91,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 4,
    paddingLeft: 0,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
    marginLeft: -0.25,
    marginTop: -0.25,
  },
  dayNumberContainer: {
    width: 42,
    height: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 1,
  },
  dayText: {
    fontSize: 16,
    color: lightTheme.colors.text,
    fontWeight: '400',
  },
  selectedDay: {
    backgroundColor: lightTheme.colors.primary,
    borderRadius: 4,
    width: 42,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  todayDay: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    width: 46,
    height: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  todayDayText: {
    color: lightTheme.colors.text,
    fontWeight: '600',
  },
  disabledDayText: {
    color: lightTheme.colors.textSecondary,
  },
  eventIndicator: {
    position: 'absolute',
    left: 0,
    right: 2,
    height: 14,
    borderRadius: 2,
    marginHorizontal: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 1,
    paddingLeft: 4,
  },
  eventIndicatorText: {
    fontSize: 10,
    color: 'white',
    textAlign: 'left',
    fontWeight: '600',
  },
  moreEventsText: {
    position: 'absolute',
    bottom: 2,
    fontSize: 8,
    color: lightTheme.colors.textSecondary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: lightTheme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});