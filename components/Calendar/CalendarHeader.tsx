import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../../theme';

interface CalendarHeaderProps {
  currentMonth: string;
  onPress: () => void;
}

export default function CalendarHeader({ currentMonth, onPress }: CalendarHeaderProps) {
  const currentDate = new Date(currentMonth);
  const monthYear = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

  return (
    <TouchableOpacity style={styles.headerButton} onPress={onPress}>
      <Text style={styles.headerText}>{monthYear}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});