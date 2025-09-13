import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

export const userService = {
  async createUserProfile(userId: string, email: string, name?: string) {
    try {
      logger.info('Creating user profile in public.users table');

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          name: name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // If user already exists, update the profile
        if (error.code === '23505') { // Unique violation
          logger.info('User profile already exists, updating...');
          return await this.updateUserProfile(userId, { name });
        }
        throw error;
      }

      logger.info('User profile created successfully:', data);
      return { data, error: null };
    } catch (error) {
      logger.error('Create user profile error:', error);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId: string, updates: { name?: string; avatar_url?: string }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      logger.info('User profile updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      logger.error('Update user profile error:', error);
      return { data: null, error };
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      logger.error('Get user profile error:', error);
      return { data: null, error };
    }
  },

  async checkUserExists(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned
        return { exists: false, error: null };
      }

      if (error) throw error;

      return { exists: !!data, error: null };
    } catch (error) {
      logger.error('Check user exists error:', error);
      return { exists: false, error };
    }
  },
};