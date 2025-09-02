import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// For development without Expo account
const redirectTo = __DEV__ 
  ? 'yourpoint://auth' // Custom scheme for development
  : AuthSession.makeRedirectUri({
      scheme: 'yourpoint',
    });

console.log('Redirect URI:', redirectTo);

export const authService = {
  async signInWithGoogle() {
    try {
      console.log('Starting Google OAuth...');
      
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

      console.log('OAuth response:', { data, error });

      if (error) throw error;

      // Manually open the OAuth URL if it exists
      if (data?.url) {
        console.log('Opening OAuth URL:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        );
        console.log('WebBrowser result:', result);
        
        if (result.type === 'success' && result.url) {
          console.log('Auth success, returned URL:', result.url);
          
          // Parse fragment (hash) part of URL  
          const urlParts = result.url.split('#');
          console.log('URL parts:', urlParts);
          
          if (urlParts.length > 1) {
            const fragmentString = urlParts[1];
            console.log('Fragment string:', fragmentString);
            
            const params = new URLSearchParams(fragmentString);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            console.log('Parsed tokens:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
              accessTokenLength: accessToken?.length,
              refreshTokenLength: refreshToken?.length,
            });
            
            if (accessToken && refreshToken) {
              console.log('Setting session with tokens...');
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              console.log('Session set result:', {
                user: sessionData?.user?.email,
                error: sessionError,
              });
              
              if (sessionData?.session) {
                console.log('✅ Login successful!');
                return data;
              }
            }
          }
          
          console.log('❌ Failed to parse tokens from URL');
        }
      }

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
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
      console.error('Apple sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
};