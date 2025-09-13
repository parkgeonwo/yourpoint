import { supabase } from '../lib/supabase';
import type { Event } from '../lib/supabase';
import { logger } from '../lib/logger';

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  eventType: '나' | '상대' | '우리';
  spaceId: string;
}

export class EventService {
  /**
   * 새 일정을 생성합니다
   */
  static async createEvent(eventData: CreateEventData): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('사용자 인증이 필요합니다');
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        space_id: eventData.spaceId,
        user_id: user.id,
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.startDate,
        start_time: eventData.startTime,
        end_date: eventData.endDate,
        end_time: eventData.endTime,
        event_type: eventData.eventType,
      })
      .select()
      .single();

    if (error) {
      logger.error('일정 생성 실패:', error);
      throw new Error(`일정 생성 중 오류가 발생했습니다: ${error.message}`);
    }

    return data;
  }

  /**
   * 특정 스페이스의 모든 일정을 가져옵니다
   */
  static async getEventsForSpace(spaceId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        users:user_id(name)
      `)
      .eq('space_id', spaceId)
      .order('start_date', { ascending: true });

    if (error) {
      logger.error('일정 조회 실패:', error);
      throw new Error(`일정을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 특정 날짜 범위의 일정들을 가져옵니다
   */
  static async getEventsForDateRange(
    spaceId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        users:user_id(name)
      `)
      .eq('space_id', spaceId)
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .order('start_date', { ascending: true });

    if (error) {
      logger.error('일정 조회 실패:', error);
      throw new Error(`일정을 불러오는 중 오류가 발생했습니다: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 일정을 수정합니다
   */
  static async updateEvent(eventId: string, updates: Partial<CreateEventData>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update({
        title: updates.title,
        description: updates.description,
        start_date: updates.startDate,
        start_time: updates.startTime,
        end_date: updates.endDate,
        end_time: updates.endTime,
        event_type: updates.eventType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      logger.error('일정 수정 실패:', error);
      throw new Error(`일정 수정 중 오류가 발생했습니다: ${error.message}`);
    }

    return data;
  }

  /**
   * 일정을 삭제합니다
   */
  static async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      logger.error('일정 삭제 실패:', error);
      throw new Error(`일정 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 사용자의 기본 스페이스 ID를 가져옵니다 (개인 스페이스 우선)
   */
  static async getDefaultSpaceId(): Promise<string | null> {
    logger.debug('getDefaultSpaceId 호출됨');

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      logger.error('Auth 에러:', authError);
      return null;
    }

    if (!user) {
      logger.debug('로그인된 사용자 없음');
      return null;
    }

    logger.debug('현재 사용자:', user.email);

    // 개인 스페이스를 직접 spaces 테이블에서 찾기 (순환 참조 방지)
    const { data, error } = await supabase
      .from('spaces')
      .select('id')
      .eq('owner_id', user.id)
      .eq('space_type', 'personal')
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.warn('개인 스페이스 조회 에러:', error.message, error.code);

      // 개인 스페이스가 없으면 소유한 첫 번째 스페이스 사용 (폴백)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('spaces')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();

      if (fallbackError) {
        logger.error('폴백 스페이스 조회도 실패:', fallbackError);
        return null;
      }

      logger.debug('폴백 스페이스 사용');
      return fallbackData?.id || null;
    }

    logger.debug('개인 스페이스 찾음');
    return data?.id || null;
  }
}