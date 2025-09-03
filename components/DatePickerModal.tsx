import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { lightTheme } from '../theme';

const { width } = Dimensions.get('window');

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentDate: string;
  onSelect: (date: string) => void;
  title: string;
}

export default function DatePickerModal({
  visible,
  onClose,
  currentDate,
  onSelect,
  title,
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleConfirm = () => {
    onSelect(selectedDate);
    onClose();
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: lightTheme.colors.primary,
    },
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            monthFormat={'yyyy년 M월'}
            theme={{
              backgroundColor: lightTheme.colors.surface,
              calendarBackground: lightTheme.colors.surface,
              textSectionTitleColor: lightTheme.colors.textSecondary,
              selectedDayBackgroundColor: lightTheme.colors.primary,
              selectedDayTextColor: 'white',
              todayTextColor: lightTheme.colors.primary,
              dayTextColor: lightTheme.colors.text,
              textDisabledColor: lightTheme.colors.textSecondary,
              arrowColor: lightTheme.colors.primary,
              monthTextColor: lightTheme.colors.text,
              indicatorColor: lightTheme.colors.primary,
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  container: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.xl,
    width: width - 40,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  cancelText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.textSecondary,
    fontWeight: '500',
  },
  confirmText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.primary,
    fontWeight: '600',
  },
  calendarContainer: {
    padding: lightTheme.spacing.md,
  },
});