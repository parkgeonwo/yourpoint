import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({
          user: session.user,
          session,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({ loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session) {
          set({
            user: session.user,
            session,
            isAuthenticated: true,
          });
          await AsyncStorage.setItem('session', JSON.stringify(session));
        } else {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
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
}));