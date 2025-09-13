import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { SpaceService } from '../services/spaceService';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  ensurePersonalSpace: () => Promise<void>;
}

let spaceInitializationPromise: Promise<void> | null = null; // Promise로 동시 실행 방지

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      // 먼저 저장된 세션 정리 (새로운 SDK 버전으로 인한 토큰 무효화 처리)
      const storedSession = await AsyncStorage.getItem('session');
      if (storedSession) {
        try {
          // 기존 세션 데이터 정리
          await AsyncStorage.removeItem('session');
        } catch (err) {
          console.log('Clearing old session data');
        }
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error && error.message.includes('Refresh Token')) {
        console.log('Refresh token invalid, clearing session');
        await AsyncStorage.removeItem('session');
        set({ loading: false });
        return;
      }

      if (session) {
        set({
          user: session.user,
          session,
          isAuthenticated: true,
          loading: false,
        });

        // 초기화 시에는 개인 스페이스 생성하지 않음 (onAuthStateChange에서 처리)
      } else {
        set({ loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);

        if (session) {
          // 로그인 성공 시 개인 스페이스를 먼저 확인/생성 (SIGNED_IN 이벤트일 때만, 한 번만)
          if (event === 'SIGNED_IN') {
            // 이미 초기화 중이면 기존 Promise 반환
            if (!spaceInitializationPromise) {
              console.log('새로운 로그인 감지 - 개인 스페이스 확인/생성 중...');

              // Promise를 저장하여 동시 실행 방지
              spaceInitializationPromise = (async () => {
                try {
                  const userName = session.user.user_metadata?.display_name ||
                                 session.user.user_metadata?.name ||
                                 session.user.email?.split('@')[0] ||
                                 '사용자';
                  await SpaceService.ensurePersonalSpace(session.user.id, userName);
                  console.log('개인 스페이스 설정 완료');
                } catch (error) {
                  console.error('개인 스페이스 설정 실패:', error);
                }
              })();
            } else {
              console.log('이미 스페이스 초기화 진행 중, 스킵');
            }
          }

          // 즉시 상태 업데이트
          set({
            user: session.user,
            session,
            isAuthenticated: true,
            loading: false,
          });
          await AsyncStorage.setItem('session', JSON.stringify(session));
        } else {
          // 로그아웃 시 Promise 리셋
          spaceInitializationPromise = null;
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            loading: false,
          });
          await AsyncStorage.removeItem('session');
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  signInWithApple: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      console.log('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        console.log('Session refreshed, user:', session.user.email);
        set({
          user: session.user,
          session,
          isAuthenticated: true,
        });
        await AsyncStorage.setItem('session', JSON.stringify(session));
      } else {
        console.log('No session found after refresh');
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  },

  ensurePersonalSpace: async () => {
    try {
      const { user } = get();
      if (!user) {
        console.log('사용자가 없어 개인 스페이스 생성을 건너뜁니다');
        return;
      }

      const userName = user.user_metadata?.name || user.email?.split('@')[0] || '사용자';
      await SpaceService.ensurePersonalSpace(user.id, userName);
      console.log('개인 스페이스 확인/생성 완료');
    } catch (error) {
      console.error('개인 스페이스 생성 실패:', error);
      // 개인 스페이스 생성 실패해도 앱은 계속 동작하도록 함
    }
  },
}));