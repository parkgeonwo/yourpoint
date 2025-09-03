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
      startDate: '2025-09-02',
      startTime: '14:00',
      endDate: '2025-09-02',
      endTime: '15:00',
      eventType: '나',
      date: '2025-09-02',
      time: '14:00',
      userId: 'user1',
      userName: '내가',
    },
    {
      id: '2',
      title: '텍스토어 업무',
      description: '친구들과 만남',
      startDate: '2025-09-02',
      startTime: '18:00',
      endDate: '2025-09-02',
      endTime: '20:00',
      eventType: '나',
      date: '2025-09-02',
      time: '18:00',
      userId: 'user1',
      userName: '내가',
    },
    {
      id: '3',
      title: '새일즈',
      description: '영업팀 회의',
      startDate: '2025-09-03',
      startTime: '10:00',
      endDate: '2025-09-03',
      endTime: '11:30',
      eventType: '상대',
      date: '2025-09-03',
      time: '10:00',
      userId: 'user2',
      userName: '김철수',
    },
    {
      id: '4',
      title: '저과',
      description: '저녁 식사',
      startDate: '2025-09-03',
      startTime: '19:00',
      endDate: '2025-09-03',
      endTime: '21:00',
      eventType: '우리',
      date: '2025-09-03',
      time: '19:00',
      userId: 'user1',
      userName: '내가',
    },
    {
      id: '5',
      title: '두더지',
      description: '게임',
      startDate: '2025-09-05',
      startTime: '20:00',
      endDate: '2025-09-05',
      endTime: '22:00',
      eventType: '나',
      date: '2025-09-05',
      time: '20:00',
      userId: 'user3',
      userName: '이영희',
    },
    {
      id: '6',
      title: '휴가',
      description: '여행',
      startDate: '2025-09-12',
      startTime: '09:00',
      endDate: '2025-09-15',
      endTime: '18:00',
      eventType: '우리',
      date: '2025-09-12',
      time: '09:00',
      userId: 'user1',
      userName: '내가',
    },
  ]);

  const handleSaveEvent = (eventData: any) => {
    const newEvent = {
      id: Date.now().toString(),
      userId: user?.id || 'user1',
      userName: user?.user_metadata?.name || '내가',
      title: eventData.title,
      description: eventData.description,
      startDate: eventData.startDate,
      startTime: eventData.startTime,
      endDate: eventData.endDate,
      endTime: eventData.endTime,
      eventType: eventData.selectedType || '나',
      // 기존 호환성을 위해 유지
      date: eventData.startDate,
      time: eventData.startTime,
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
    return events.filter(event => {
      // 시작날짜와 종료날짜 사이에 있는 모든 날짜의 이벤트 포함
      if (event.startDate && event.endDate) {
        return date >= event.startDate && date <= event.endDate;
      }
      // 기존 호환성
      return event.date === date;
    });
  };

  // 날짜 범위 생성 함수
  const getDateRange = (startDate: string, endDate: string) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  // 마크된 날짜 생성 (period marking 사용)
  const markedDates = {};
  
  events.forEach((event) => {
    if (event.startDate && event.endDate) {
      const dateRange = getDateRange(event.startDate, event.endDate);
      const isMultiDay = event.startDate !== event.endDate;
      const color = getUserColor(event.userId);
      
      if (isMultiDay) {
        // 멀티데이 이벤트는 period로 표시
        dateRange.forEach((date, index) => {
          const isStarting = index === 0;
          const isEnding = index === dateRange.length - 1;
          
          markedDates[date] = {
            startingDay: isStarting,
            endingDay: isEnding,
            color: color,
            textColor: 'white',
          };
        });
      } else {
        // 단일 날짜 이벤트는 marked로 표시
        const date = event.startDate;
        markedDates[date] = {
          marked: true,
          dotColor: color,
        };
      }
    }
  });


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.calendarContainer}>
        <Calendar
          key={currentMonth}
          current={currentMonth}
          markedDates={markedDates}
          markingType="period"
          onDayPress={(day) => {
            console.log('Selected date:', day.dateString);
            setSelectedDate(day.dateString);
            setShowEventDetail(true);
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
            const isToday = dateString === today;
            
            return (
              <TouchableOpacity
                style={styles.dayContainer}
                onPress={() => {
                  console.log('Selected date:', dateString);
                  setSelectedDate(dateString);
                  setShowEventDetail(true);
                }}
              >
                <View style={[
                  styles.dayNumberContainer,
                  isToday && styles.todayDay,
                ]}>
                  <Text style={[
                    styles.dayText,
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
        onPress={() => {
          setSelectedDate(today);
          setShowEventModal(true);
        }}
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
        onAddEvent={() => setShowEventModal(true)}
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