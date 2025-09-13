import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { lightTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import EventModal from './EventModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EventDetailModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  events: Array<{
    id: string;
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    eventType: string;
    time: string;
    userId: string;
    userName: string;
  }>;
  getUserColor: (userId: string) => string;
  onAddEvent: () => void;
  onUpdateEvent?: (eventId: string, event: {
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    eventType: string;
  }) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export default function EventDetailModal({
  visible,
  onClose,
  selectedDate,
  events,
  getUserColor,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: EventDetailModalProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);


  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  // 날짜 포맷팅 함수
  const formatDate = (date: string) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[d.getDay()];
    return `${month}월 ${day}일 (${weekday})`;
  };

  // 시간 포맷팅 함수 (HH:MM:SS -> HH:MM)
  const formatTime = (time: string) => {
    if (!time) return '';
    // "10:00:00" -> "10:00"
    return time.split(':').slice(0, 2).join(':');
  };

  // 시간 범위 포맷팅 함수
  const formatTimeRange = (startDate: string, startTime: string, endDate: string, endTime: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();

    // 같은 날인 경우
    if (startDate === endDate) {
      if (formattedStartTime && formattedEndTime) {
        return `${startMonth}/${startDay} ${formattedStartTime} ~ ${formattedEndTime}`;
      } else if (formattedStartTime) {
        return `${startMonth}/${startDay} ${formattedStartTime}`;
      }
      return `${startMonth}/${startDay} 종일`;
    }

    // 다른 날인 경우
    const startStr = formattedStartTime ? `${startMonth}/${startDay} ${formattedStartTime}` : `${startMonth}/${startDay}`;
    const endStr = formattedEndTime ? `${endMonth}/${endDay} ${formattedEndTime}` : `${endMonth}/${endDay}`;

    return `${startStr} ~ ${endStr}`;
  };

  // 이벤트 타입에 따른 아이콘 반환
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case '나':
        return 'person-outline';
      case '상대':
        return 'people-outline';
      case '우리':
        return 'heart-outline';
      default:
        return 'calendar-outline';
    }
  };

  // 설명 텍스트 줄임 처리
  const truncateDescription = (description: string, maxLines: number = 2) => {
    if (!description) return '';

    // 대략적으로 한 줄에 20-25자 정도로 계산 (폰트 크기와 패딩 고려)
    const maxLength = maxLines * 23;
    if (description.length > maxLength) {
      return description.substring(0, maxLength - 3) + '...';
    }
    return description;
  };

  const handleEventPress = (event: any) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleUpdateEvent = (eventId: string, updatedEvent: any) => {
    if (onUpdateEvent) {
      onUpdateEvent(eventId, updatedEvent);
    }
    setShowEditModal(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (event: any) => {
    Alert.alert(
      '일정 삭제',
      `${event.title} 일정을 삭제하시겠습니까?`,
      [
        {
          text: '아니요',
          style: 'cancel'
        },
        {
          text: '네',
          style: 'destructive',
          onPress: () => {
            if (onDeleteEvent) {
              onDeleteEvent(event.id);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{formatDate(selectedDate)}</Text>
            <TouchableOpacity onPress={() => {
              onClose();
              onAddEvent();
            }}>
              <Ionicons name="add" size={24} color={lightTheme.colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
          {events && events.length > 0 ? (
            events.map(event => {
              const eventColor = getUserColor(event.userId, event.eventType);
              return (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => handleEventPress(event)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: eventColor,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={getEventTypeIcon(event.eventType || '나')}
                        size={16}
                        color={eventColor}
                      />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: eventColor, marginLeft: 6 }}>
                        {event.eventType || '나'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event);
                      }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ff4444"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                    {event.title || '제목 없음'}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={{ fontSize: 14, color: '#666', marginLeft: 6 }}>
                      {formatTimeRange(
                        event.startDate || event.date || selectedDate,
                        event.startTime || event.time || '',
                        event.endDate || event.date || selectedDate,
                        event.endTime || event.time || ''
                      )}
                    </Text>
                  </View>

                  {event.description ? (
                    <Text
                      style={{ fontSize: 14, color: '#666', marginTop: 8, lineHeight: 20 }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {event.description}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })
          ) : null}
          {(!events || events.length === 0) && (
            <View style={styles.emptyState}>
              <Text style={styles.noEventsText}>이 날에는 일정이 없습니다</Text>
              <TouchableOpacity
                style={styles.addEventButton}
                onPress={() => {
                  onClose();
                  onAddEvent();
                }}
              >
                <Text style={styles.addEventButtonText}>일정 추가하기</Text>
              </TouchableOpacity>
            </View>
          )}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>

      {selectedEvent && (
        <EventModal
          visible={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          mode="edit"
          editEvent={selectedEvent}
          onUpdate={handleUpdateEvent}
          onSave={() => {}} // 수정 모드에서는 사용하지 않음
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: lightTheme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.9,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: lightTheme.colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.sm,
    paddingBottom: lightTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.border,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: lightTheme.spacing.lg,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#f5f5f5',
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.lg,
    marginBottom: lightTheme.spacing.sm,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.sm,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventType: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: '600',
  },
  eventUser: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.textSecondary,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.sm,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xs,
  },
  eventTime: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    lineHeight: 20,
    marginTop: lightTheme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xl,
  },
  noEventsText: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  addEventButton: {
    backgroundColor: lightTheme.colors.primary,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.lg,
  },
  addEventButtonText: {
    color: 'white',
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: '600',
  },
});