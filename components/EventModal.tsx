import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { lightTheme } from '../theme';
import DatePickerModal from './DatePickerModal';
import TimePickerModal from './TimePickerModal';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string;
  onSave: (event: {
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  }) => void;
}

export default function EventModal({
  visible,
  onClose,
  selectedDate,
  onSave,
}: EventModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(selectedDate || today);
  const [startTime, setStartTime] = useState('15:00');
  const [endDate, setEndDate] = useState(selectedDate || today);
  const [endTime, setEndTime] = useState('16:00');
  const [selectedType, setSelectedType] = useState('나');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // selectedDate가 변경될 때마다 시작/종료 날짜 업데이트
  useEffect(() => {
    if (selectedDate) {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    }
  }, [selectedDate]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('알림', '일정 제목을 입력해주세요.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      startDate: startDate,
      startTime: startTime,
      endDate: endDate,
      endTime: endTime,
      selectedType: selectedType,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStartDate(selectedDate || today);
    setStartTime('15:00');
    setEndDate(selectedDate || today);
    setEndTime('16:00');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>새 일정</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>저장</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="일정 제목을 입력하세요"
              placeholderTextColor={lightTheme.colors.textSecondary}
            />
          </View>

          <View style={styles.nicknameButtonGroup}>
            <TouchableOpacity 
              style={[styles.nicknameButton, selectedType === '나' && styles.nicknameButtonSelected]}
              onPress={() => setSelectedType('나')}
            >
              <Text style={[styles.nicknameButtonText, selectedType === '나' && styles.nicknameButtonTextSelected]}>나</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.nicknameButton, selectedType === '상대' && styles.nicknameButtonSelected]}
              onPress={() => setSelectedType('상대')}
            >
              <Text style={[styles.nicknameButtonText, selectedType === '상대' && styles.nicknameButtonTextSelected]}>상대</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.nicknameButton, selectedType === '우리' && styles.nicknameButtonSelected]}
              onPress={() => setSelectedType('우리')}
            >
              <Text style={[styles.nicknameButtonText, selectedType === '우리' && styles.nicknameButtonTextSelected]}>우리</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>시작</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity 
                style={[styles.dateTimeSelector, styles.dateSelector]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateTimeSelectorText}>
                  {startDate}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateTimeSelector, styles.timeSelector]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.dateTimeSelectorText}>
                  {startTime}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>종료</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity 
                style={[styles.dateTimeSelector, styles.dateSelector]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateTimeSelectorText}>
                  {endDate}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateTimeSelector, styles.timeSelector]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.dateTimeSelectorText}>
                  {endTime}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>설명</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="일정에 대한 추가 정보를 입력하세요"
              placeholderTextColor={lightTheme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </View>

      <DatePickerModal
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        currentDate={startDate}
        title="시작 날짜"
        onSelect={(date) => {
          setStartDate(date);
        }}
      />

      <TimePickerModal
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        currentTime={startTime}
        title="시작 시간"
        onSelect={(time) => {
          setStartTime(time);
        }}
      />

      <DatePickerModal
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        currentDate={endDate}
        title="종료 날짜"
        onSelect={(date) => {
          setEndDate(date);
        }}
      />

      <TimePickerModal
        visible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        currentTime={endTime}
        title="종료 시간"
        onSelect={(time) => {
          setEndTime(time);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing['2xl'],
    paddingBottom: lightTheme.spacing.lg,
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
  },
  saveText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: lightTheme.spacing.lg,
  },
  inputGroup: {
    marginBottom: lightTheme.spacing.lg,
  },
  label: {
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: lightTheme.borderRadius.lg,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text,
    backgroundColor: lightTheme.colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text,
    padding: lightTheme.spacing.md,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  nicknameButtonGroup: {
    flexDirection: 'row',
    gap: lightTheme.spacing.sm,
    marginBottom: lightTheme.spacing.lg,
  },
  nicknameButton: {
    flex: 1,
    paddingVertical: lightTheme.spacing.sm,
    paddingHorizontal: lightTheme.spacing.md,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    alignItems: 'center',
  },
  nicknameButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  nicknameButtonText: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  nicknameButtonTextSelected: {
    color: '#FFFFFF',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: lightTheme.spacing.sm,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  dateTimeSelector: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: lightTheme.borderRadius.lg,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    backgroundColor: lightTheme.colors.surface,
  },
  dateTimeSelectorText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text,
  },
  dateSelector: {
    flex: 2,
  },
  timeSelector: {
    flex: 1,
  },
});