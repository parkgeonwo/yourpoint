import { useState } from 'react';

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

export function useCalendarData() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const addEvent = (eventData: any, userId: string, userName: string) => {
    const newEvent: CalendarEvent = {
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
      // 기존 호환성을 위해 유지
      date: eventData.startDate,
      time: eventData.startTime,
    };
    setEvents(prev => [...prev, newEvent]);
    console.log('Event saved:', newEvent);
    return newEvent;
  };

  // 사용자별 색상 할당
  const getUserColor = (userId: string) => {
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
        const color = getUserColor(event.userId);
        
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

  // 새로고침 함수 - 실제로는 서버에서 데이터를 다시 가져올 것
  const refreshEvents = async () => {
    setIsRefreshing(true);
    
    try {
      console.log('캘린더 새로고침 시작...');
      
      // 시뮬레이션: 1.5초 후 새로고침 완료
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 실제 구현 시에는 여기서 서버에서 이벤트를 다시 가져옴
      // const freshEvents = await fetchEventsFromServer();
      // setEvents(freshEvents);
      
      // 예시: 마지막 동기화 시간 업데이트
      const lastSyncTime = new Date().toLocaleTimeString('ko-KR');
      console.log(`캘린더 새로고침 완료 - ${lastSyncTime}`);
      
    } catch (error) {
      console.error('캘린더 새로고침 실패:', error);
      // 실제로는 사용자에게 에러 토스트 메시지 표시
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    events,
    isRefreshing,
    addEvent,
    refreshEvents,
    getUserColor,
    getEventsForDate,
    getMarkedDates,
  };
}