import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

WebBrowser.maybeCompleteAuthSession();

// For development without Expo account
const redirectTo = __DEV__ 
  ? 'yourpoint://auth' // Custom scheme for development
  : AuthSession.makeRedirectUri({
      scheme: 'yourpoint',
    });

logger.debug('Redirect URI:', redirectTo);

export const authService = {
  async signInWithGoogle() {
    try {
      logger.info('Starting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      logger.debug('OAuth response:', { hasData: !!data, error });

      if (error) throw error;

      // Manually open the OAuth URL if it exists
      if (data?.url) {
        logger.debug('Opening OAuth URL');
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );
        logger.debug('WebBrowser result type:', result.type);
        
        if (result.type === 'success' && result.url) {
          logger.debug('Auth success, processing response');
          
          // Parse fragment (hash) part of URL  
          const urlParts = result.url.split('#');
          logger.debug('Processing auth callback');
          
          if (urlParts.length > 1) {
            const fragmentString = urlParts[1];
            // Parse authentication response
            
            const params = new URLSearchParams(fragmentString);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            logger.debug('Auth tokens received:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
            });
            
            if (accessToken && refreshToken) {
              logger.debug('Setting session...');
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              logger.debug('Session result:', {
                userEmail: sessionData?.user?.email,
                error: sessionError,
              });

              if (sessionData?.session) {
                logger.info('Login successful for user:', sessionData.user?.email);

                // Force trigger auth state change
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  logger.debug('Session confirmed, refreshing...');
                  // Trigger a manual session refresh to ensure auth state updates
                  await supabase.auth.refreshSession();
                }

                return data;
              }
            }
          }
          
          logger.error('Failed to parse authentication tokens');
        }
      }

      return data;
    } catch (error) {
      logger.error('Google sign in error:', error);
      throw error;
    }
  },

  async signInWithApple() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Apple sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logger.error('Sign out error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  },
};