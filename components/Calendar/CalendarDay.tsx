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
}

export default function CalendarDay({
  date,
  state,
  events,
  isToday,
  getUserColor,
  onPress,
}: CalendarDayProps) {
  const dateString = date?.dateString || '';

  return (
    <TouchableOpacity
      style={styles.dayContainer}
      onPress={() => onPress(dateString)}
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