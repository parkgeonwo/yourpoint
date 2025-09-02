import React, { useState } from 'react';
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

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string;
  onSave: (event: {
    title: string;
    description: string;
    date: string;
    time: string;
  }) => void;
}

export default function EventModal({
  visible,
  onClose,
  selectedDate,
  onSave,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('알림', '일정 제목을 입력해주세요.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      date: selectedDate || new Date().toISOString().split('T')[0],
      time: time.trim(),
    });

    // Reset form
    setTitle('');
    setDescription('');
    setTime('');
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>시간</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="예: 오후 2:00"
              placeholderTextColor={lightTheme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>날짜</Text>
            <Text style={styles.dateText}>
              {selectedDate || new Date().toISOString().split('T')[0]}
            </Text>
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
});