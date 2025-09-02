import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { lightTheme } from '../theme';

interface EventDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  events: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    userId: string;
    userName: string;
  }>;
  getUserColor: (userId: string) => string;
}

export default function EventDetailModal({
  visible,
  onClose,
  selectedDate,
  events,
  getUserColor,
}: EventDetailModalProps) {
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
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedDate}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {events.map(event => (
            <View 
              key={event.id} 
              style={[
                styles.eventCard,
                { borderLeftColor: getUserColor(event.userId) }
              ]}
            >
              <View style={styles.eventHeader}>
                <Text style={styles.eventTime}>{event.time}</Text>
                <Text style={styles.eventUser}>{event.userName}</Text>
              </View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
          ))}
          {events.length === 0 && (
            <Text style={styles.noEventsText}>이 날에는 일정이 없습니다</Text>
          )}
        </ScrollView>
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
    backgroundColor: lightTheme.colors.surface,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: '600',
    color: lightTheme.colors.text,
  },
  closeText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.primary,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: lightTheme.spacing.lg,
  },
  eventCard: {
    backgroundColor: lightTheme.colors.surface,
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.lg,
    marginBottom: lightTheme.spacing.sm,
    borderLeftWidth: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xs,
  },
  eventTime: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.primary,
    fontWeight: '600',
  },
  eventUser: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.textSecondary,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  eventDescription: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
  },
  noEventsText: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: lightTheme.spacing.lg,
  },
});