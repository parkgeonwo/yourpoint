import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '../../theme';

interface CalendarEvent {
  id: string;
  title: string;
  userId: string;
}

interface CalendarDayProps {
  date: any;
  state: string;
  events: CalendarEvent[];
  isToday: boolean;
  getUserColor: (userId: string) => string;
  onPress: (dateString: string) => void;
  currentCalendarMonth: number;
}

export default function CalendarDay({
  date,
  state,
  events,
  isToday,
  getUserColor,
  onPress,
  currentCalendarMonth,
}: CalendarDayProps) {
  const dateString = date?.dateString || '';
  
  // 각 월의 1일은 월.일 형식으로 표시
  const getDisplayText = () => {
    if (date?.day === 1) {
      const month = date?.month;
      return `${month}.1`;
    }
    return date?.day?.toString() || '';
  };

  // 다른 달의 날짜인지 확인 (현재 달력과 날짜의 월이 다른 경우)
  const isOtherMonth = () => {
    if (!date?.dateString) return false;
    const dateMonth = new Date(date.dateString).getMonth() + 1;
    console.log('Debug:', {
      dateString: date?.dateString,
      dateMonth,
      currentCalendarMonth,
      isOther: dateMonth !== currentCalendarMonth
    });
    return dateMonth !== currentCalendarMonth;
  };

  const shouldShowDisabled = isOtherMonth();

  return (
    <TouchableOpacity
      style={[
        styles.dayContainer,
        shouldShowDisabled && styles.disabledDayContainer,
      ]}
      onPress={() => onPress(dateString)}
    >
      <View style={[
        styles.dayNumberContainer,
        isToday && styles.todayDay,
      ]}>
        <Text style={[
          styles.dayText,
          isToday && styles.todayDayText,
          shouldShowDisabled && styles.disabledDayText,
        ]}>
          {getDisplayText()}
        </Text>
      </View>
      {events.slice(0, 3).map((event, index) => (
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
      {events.length > 3 && (
        <Text style={styles.moreEventsText}>+{events.length - 3}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  disabledDayContainer: {
    backgroundColor: '#F2F2F2',
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
});