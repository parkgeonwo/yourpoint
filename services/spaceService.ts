import { supabase } from '../lib/supabase';
import type { Space, SpaceMember } from '../lib/supabase';

export class SpaceService {
  /**
   * 사용자의 개인 스페이스를 생성합니다
   */
  static async createPersonalSpace(userId: string, userName: string): Promise<Space> {
    try {
      // 개인 스페이스 생성
      const { data: space, error: spaceError } = await supabase
        .from('spaces')
        .insert({
          name: `${userName}의 개인 캘린더`,
          description: '개인 일정 관리용 스페이스',
          space_type: 'personal',
          owner_id: userId,
        })
        .select()
        .single();

      if (spaceError) {
        console.error('개인 스페이스 생성 실패:', spaceError);
        throw new Error(`개인 스페이스 생성 중 오류: ${spaceError.message}`);
      }

      // 스페이스 멤버로 자동 등록
      const { error: memberError } = await supabase
        .from('space_members')
        .insert({
          space_id: space.id,
          user_id: userId,
          role: 'owner',
        });

      if (memberError) {
        console.error('스페이스 멤버 등록 실패:', memberError);
        // 스페이스는 생성되었지만 멤버 등록 실패 - 스페이스 삭제
        await supabase.from('spaces').delete().eq('id', space.id);
        throw new Error(`스페이스 멤버 등록 중 오류: ${memberError.message}`);
      }

      console.log('개인 스페이스 생성 완료:', space);
      return space;
    } catch (error) {
      console.error('개인 스페이스 생성 전체 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자의 개인 스페이스를 조회합니다
   */
  static async getPersonalSpace(userId: string): Promise<Space | null> {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('owner_id', userId)
      .eq('space_type', 'personal')
      .single();

    if (error) {
      console.log('개인 스페이스 조회 실패:', error.message);
      return null;
    }

    return data;
  }

  /**
   * 사용자의 모든 스페이스를 조회합니다 (개인 + 공유)
   */
  static async getUserSpaces(userId: string): Promise<Space[]> {
    const { data, error } = await supabase
      .from('space_members')
      .select(`
        spaces (
          id,
          name,
          description,
          space_type,
          owner_id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('사용자 스페이스 조회 실패:', error);
      return [];
    }

    return data?.map(item => item.spaces).filter(Boolean) || [];
  }

  /**
   * 개인 스페이스가 없으면 생성하고, 있으면 반환합니다
   */
  static async ensurePersonalSpace(userId: string, userName: string): Promise<Space> {
    // 기존 개인 스페이스 확인
    let personalSpace = await this.getPersonalSpace(userId);
    
    if (!personalSpace) {
      console.log('개인 스페이스가 없어 새로 생성합니다');
      personalSpace = await this.createPersonalSpace(userId, userName);
    } else {
      console.log('기존 개인 스페이스 사용:', personalSpace.name);
    }

    return personalSpace;
  }
}