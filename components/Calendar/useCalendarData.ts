import { useState, useEffect } from 'react';
import { EventService, CreateEventData } from '../../services/eventService';
import { useAuthStore } from '../../stores/authStore';
import type { Event } from '../../lib/supabase';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  eventType: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
}

// 이벤트 타입별 색상
export const eventTypeColors = {
  '나': '#6366f1',     // 보라색 - 내 일정
  '상대': '#f59e0b',   // 주황색 - 상대방 일정
  '우리': '#ec4899',   // 핑크색 - 함께하는 일정
};

// 사용자별 색상 (eventType이 없는 경우를 위한 fallback)
export const eventColors = [
  '#6366f1', // Primary - 내 일정
  '#f59e0b', // Amber - 다른 사용자 1
  '#10b981', // Green - 다른 사용자 2
  '#ef4444', // Red - 다른 사용자 3
  '#8b5cf6', // Purple - 다른 사용자 4
  '#06b6d4', // Cyan - 다른 사용자 5
];

const mockEvents: CalendarEvent[] = [
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
];

// 서버의 Event를 클라이언트 CalendarEvent로 변환
const transformServerEvent = (serverEvent: Event, userName?: string): CalendarEvent => ({
  id: serverEvent.id,
  userId: serverEvent.user_id,
  userName: userName || '알 수 없음',
  title: serverEvent.title,
  description: serverEvent.description || '',
  startDate: serverEvent.start_date,
  startTime: serverEvent.start_time || '',
  endDate: serverEvent.end_date,
  endTime: serverEvent.end_time || '',
  eventType: serverEvent.event_type,
  // 기존 호환성을 위해 유지
  date: serverEvent.start_date,
  time: serverEvent.start_time || '',
});

export function useCalendarData() {
  const { user, isAuthenticated, loading } = useAuthStore();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 로그인 상태 변화 감지하여 데이터 로딩
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, userId: user?.id, loading, isInitialized });
    
    // 로딩 중이면 대기
    if (loading) {
      console.log('Auth 로딩 중... 대기');
      return;
    }
    
    if (isAuthenticated && user) {
      // 로그인 상태이고 아직 초기화되지 않았을 때만 로드
      if (!isInitialized) {
        console.log('로그인 확인 - 초기 데이터 로딩 시작');
        setIsInitialized(true);
        // 약간의 지연을 주어 스페이스 생성이 완료되도록 함
        setTimeout(() => {
          loadInitialData();
        }, 500);
      }
    } else if (!isAuthenticated) {
      console.log('로그아웃 감지 - 데이터 초기화');
      setEvents([]);
      setCurrentSpaceId(null);
      setIsInitialized(false);
    }
  }, [isAuthenticated, user?.id, loading, isInitialized]);

  const loadInitialData = async () => {
    try {
      console.log('초기 데이터 로딩 시작...');
      
      // 기본 스페이스 ID 가져오기
      const spaceId = await EventService.getDefaultSpaceId();
      console.log('가져온 스페이스 ID:', spaceId);
      
      if (spaceId) {
        setCurrentSpaceId(spaceId);
        await loadEventsForSpace(spaceId);
        console.log('스페이스 데이터 로딩 완료');
      } else {
        // 스페이스가 없으면 mock 데이터 사용
        console.log('스페이스를 찾을 수 없어 mock 데이터를 사용합니다');
        setEvents(mockEvents);
      }
    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
      // 에러 발생 시 mock 데이터로 폴백
      console.log('에러로 인해 mock 데이터로 폴백');
      setEvents(mockEvents);
    }
  };

  const loadEventsForSpace = async (spaceId: string) => {
    try {
      console.log('스페이스별 이벤트 로딩 시작:', spaceId);
      const serverEvents = await EventService.getEventsForSpace(spaceId);
      console.log('서버에서 가져온 이벤트 수:', serverEvents.length);
      
      const transformedEvents = serverEvents.map(event => 
        transformServerEvent(event, event.users?.name)
      );
      
      console.log('변환된 이벤트들:', transformedEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date
      })));
      
      setEvents(transformedEvents);
    } catch (error) {
      console.error('일정 로딩 실패:', error);
      throw error;
    }
  };

  const addEvent = async (eventData: any, userId: string, userName: string) => {
    try {
      if (!currentSpaceId) {
        throw new Error('스페이스가 설정되지 않았습니다');
      }

      const createEventData: CreateEventData = {
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        startTime: eventData.startTime,
        endDate: eventData.endDate,
        endTime: eventData.endTime,
        eventType: eventData.selectedType || '나',
        spaceId: currentSpaceId,
      };

      const serverEvent = await EventService.createEvent(createEventData);
      const newEvent = transformServerEvent(serverEvent, userName);
      
      setEvents(prev => [...prev, newEvent]);
      console.log('Event saved to database:', newEvent);
      return newEvent;
    } catch (error) {
      console.error('일정 생성 실패:', error);
      
      // 에러 발생 시 로컬에서만 추가 (임시 방편)
      const fallbackEvent: CalendarEvent = {
        id: Date.now().toString(),
        userId: userId || 'user1',
        userName: userName || '내가',
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        startTime: eventData.startTime,
        endDate: eventData.endDate,
        endTime: eventData.endTime,
        eventType: eventData.selectedType || '나',
        date: eventData.startDate,
        time: eventData.startTime,
      };
      
      setEvents(prev => [...prev, fallbackEvent]);
      console.log('Event saved locally (fallback):', fallbackEvent);
      return fallbackEvent;
    }
  };

  // 이벤트 타입 또는 사용자별 색상 할당
  const getUserColor = (userId: string, eventType?: string) => {
    // eventType이 있으면 타입별 색상 사용
    if (eventType && eventType in eventTypeColors) {
      return eventTypeColors[eventType as keyof typeof eventTypeColors];
    }

    // eventType이 없으면 사용자별 색상 사용 (fallback)
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
  const getMarkedDates = () => {
    const markedDates = {};

    events.forEach((event) => {
      if (event.startDate && event.endDate) {
        const dateRange = getDateRange(event.startDate, event.endDate);
        const isMultiDay = event.startDate !== event.endDate;
        const color = getUserColor(event.userId, event.eventType);

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

    return markedDates;
  };

  // 새로고침 함수 - 서버에서 데이터를 다시 가져옴
  const refreshEvents = async () => {
    setIsRefreshing(true);
    
    try {
      console.log('캘린더 새로고침 시작...');
      
      if (currentSpaceId) {
        await loadEventsForSpace(currentSpaceId);
        console.log('캘린더 새로고침 완료 - 서버에서 데이터 로딩');
      } else {
        // 스페이스가 없으면 초기 데이터 다시 로딩
        await loadInitialData();
        console.log('캘린더 새로고침 완료 - 초기 데이터 로딩');
      }
      
    } catch (error) {
      console.error('캘린더 새로고침 실패:', error);
      // 에러 발생 시 mock 데이터로 폴백
      setEvents(mockEvents);
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    try {
      if (!currentSpaceId) {
        throw new Error('스페이스가 설정되지 않았습니다');
      }

      const updateEventData = {
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        startTime: eventData.startTime + ':00', // HH:MM -> HH:MM:SS
        endDate: eventData.endDate,
        endTime: eventData.endTime + ':00', // HH:MM -> HH:MM:SS
        eventType: eventData.eventType,
        spaceId: currentSpaceId,
      };

      const serverEvent = await EventService.updateEvent(eventId, updateEventData);

      // 로컬 상태 업데이트
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? transformServerEvent(serverEvent, event.userName)
          : event
      ));

      console.log('Event updated in database:', serverEvent);
      return serverEvent;
    } catch (error) {
      console.error('일정 수정 실패:', error);

      // 에러 발생 시 로컬에서만 업데이트 (임시 방편)
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              title: eventData.title,
              description: eventData.description,
              startDate: eventData.startDate,
              startTime: eventData.startTime,
              endDate: eventData.endDate,
              endTime: eventData.endTime,
              eventType: eventData.eventType,
              date: eventData.startDate,
              time: eventData.startTime,
            }
          : event
      ));
      console.log('Event updated locally (fallback)');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      // Supabase에서 삭제
      await EventService.deleteEvent(eventId);

      // 로컬 상태에서 제거
      setEvents(prev => prev.filter(event => event.id !== eventId));

      console.log('Event deleted from database:', eventId);
    } catch (error) {
      console.error('일정 삭제 실패:', error);

      // 에러 발생 시에도 로컬에서는 삭제 (임시 방편)
      setEvents(prev => prev.filter(event => event.id !== eventId));
      console.log('Event deleted locally (fallback)');
    }
  };

  return {
    events,
    isRefreshing,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
    getUserColor,
    getEventsForDate,
    getMarkedDates,
  };
}