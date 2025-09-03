import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, PanResponder } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lightTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import EventModal from '../../components/EventModal';
import EventDetailModal from '../../components/EventDetailModal';
import MonthYearPicker from '../../components/MonthYearPicker';
import CalendarHeader from '../../components/Calendar/CalendarHeader';
import CalendarDay from '../../components/Calendar/CalendarDay';
import FloatingActionButton from '../../components/Calendar/FloatingActionButton';
import { useCalendarData } from '../../components/Calendar/useCalendarData';

export default function CalendarScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState('');
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  
  const { events, isRefreshing, addEvent, refreshEvents, getUserColor, getEventsForDate, getMarkedDates } = useCalendarData();

  const handleSaveEvent = (eventData: any) => {
    addEvent(
      eventData,
      user?.id || 'user1',
      user?.user_metadata?.name || '내가'
    );
  };

  const handleMonthYearSelect = (year: number, month: number) => {
    const newDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    setCurrentMonth(newDate);
    setSelectedDate('');
  };

  const today = new Date().toISOString().split('T')[0];
  const markedDates = getMarkedDates();

  const handleDatePress = (dateString: string) => {
    console.log('Selected date:', dateString);
    setSelectedDate(dateString);
    setShowEventDetail(true);
  };

  // 월 변경 함수들
  const goToPreviousMonth = () => {
    const currentDate = new Date(currentMonth);
    currentDate.setMonth(currentDate.getMonth() - 1);
    const newMonth = currentDate.toISOString().split('T')[0];
    setCurrentMonth(newMonth);
    setSelectedDate('');
  };

  const goToNextMonth = () => {
    const currentDate = new Date(currentMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);
    const newMonth = currentDate.toISOString().split('T')[0];
    setCurrentMonth(newMonth);
    setSelectedDate('');
  };

  // PanResponder로 스와이프 제스처 구현
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // 수평 스와이프를 감지 (수직 스크롤과 구분하기 위해)
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderGrant: () => {
      // 제스처 시작
    },
    onPanResponderMove: () => {
      // 제스처 진행 중 (필요시 피드백 추가 가능)
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      const minSwipeDistance = 50;
      const minVelocity = 0.5;
      
      // 충분한 거리나 속도로 스와이프했을 때만 반응
      if (Math.abs(dx) > minSwipeDistance || Math.abs(vx) > minVelocity) {
        if (dx > 0) {
          // 오른쪽 스와이프 - 이전 월
          console.log('이전 월로 이동');
          goToPreviousMonth();
        } else {
          // 왼쪽 스와이프 - 다음 월
          console.log('다음 월로 이동');
          goToNextMonth();
        }
      }
    },
    onPanResponderTerminate: () => {
      // 제스처가 다른 컴포넌트에 의해 중단됨
    },
  });


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshEvents}
            tintColor={lightTheme.colors.primary}
            colors={[lightTheme.colors.primary]}
            progressBackgroundColor={lightTheme.colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer} {...panResponder.panHandlers}>
          <Calendar
            key={currentMonth}
            current={currentMonth}
            markedDates={markedDates}
            markingType="period"
            onDayPress={(day) => handleDatePress(day.dateString)}
            monthFormat={'yyyy년 M월'}
            onPressArrowLeft={(subtractMonth) => {
              subtractMonth();
              goToPreviousMonth();
            }}
            onPressArrowRight={(addMonth) => {
              addMonth();
              goToNextMonth();
            }}
            renderHeader={(date) => (
              <CalendarHeader 
                currentMonth={currentMonth}
                onPress={() => setShowMonthYearPicker(true)}
              />
            )}
            theme={{
              backgroundColor: lightTheme.colors.surface,
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
            dayComponent={({date, state}) => (
              <CalendarDay
                date={date}
                state={state}
                events={getEventsForDate(date?.dateString || '')}
                isToday={(date?.dateString || '') === today}
                getUserColor={getUserColor}
                onPress={handleDatePress}
                currentCalendarMonth={new Date(currentMonth).getMonth() + 1}
              />
            )}
          />
        </View>
      </ScrollView>

      <FloatingActionButton 
        onPress={() => {
          setSelectedDate(today);
          setShowEventModal(true);
        }}
      />

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
    backgroundColor: lightTheme.colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // FAB 공간 확보
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: lightTheme.colors.surface,
    marginTop: lightTheme.spacing.sm,
    marginHorizontal: lightTheme.spacing.sm,
    borderRadius: lightTheme.borderRadius.lg,
    paddingBottom: lightTheme.spacing.md,
  },
  calendar: {
    borderRadius: lightTheme.borderRadius.lg,
  },
});