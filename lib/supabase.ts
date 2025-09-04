import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from './config';

export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (to be updated based on actual schema)
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  space_type: 'personal' | 'shared';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
}

export interface Event {
  id: string;
  space_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  start_time?: string;
  end_date: string;
  end_time?: string;
  event_type: '나' | '상대' | '우리';
  created_at: string;
  updated_at: string;
}