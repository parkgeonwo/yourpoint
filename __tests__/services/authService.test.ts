import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Mock the Supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      setSession: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

// Mock WebBrowser
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

// Mock AuthSession
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'yourpoint://auth'),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should successfully sign in with Google', async () => {
      const mockOAuthResponse = {
        data: {
          url: 'https://supabase.co/auth/google',
        },
        error: null,
      };

      const mockWebBrowserResult = {
        type: 'success',
        url: 'yourpoint://auth#access_token=test_token&refresh_token=test_refresh',
      };

      const mockSessionData = {
        data: {
          session: {
            access_token: 'test_token',
            refresh_token: 'test_refresh',
          },
          user: {
            email: 'test@example.com',
          },
        },
        error: null,
      };

      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue(mockOAuthResponse);
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue(mockWebBrowserResult);
      (supabase.auth.setSession as jest.Mock).mockResolvedValue(mockSessionData);
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSessionData.data.session },
      });

      const result = await authService.signInWithGoogle();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'yourpoint://auth',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
        'https://supabase.co/auth/google',
        'yourpoint://auth'
      );

      expect(result).toEqual(mockOAuthResponse.data);
    });

    it('should handle OAuth errors gracefully', async () => {
      const mockError = new Error('OAuth failed');
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(authService.signInWithGoogle()).rejects.toThrow('OAuth failed');
    });

    it('should handle WebBrowser cancellation', async () => {
      const mockOAuthResponse = {
        data: {
          url: 'https://supabase.co/auth/google',
        },
        error: null,
      };

      const mockWebBrowserResult = {
        type: 'cancel',
      };

      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue(mockOAuthResponse);
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue(mockWebBrowserResult);

      const result = await authService.signInWithGoogle();

      expect(result).toEqual(mockOAuthResponse.data);
      expect(supabase.auth.setSession).not.toHaveBeenCalled();
    });
  });

  describe('signInWithApple', () => {
    it('should successfully sign in with Apple', async () => {
      const mockOAuthResponse = {
        data: {
          url: 'https://supabase.co/auth/apple',
        },
        error: null,
      };

      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue(mockOAuthResponse);

      const result = await authService.signInWithApple();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: 'yourpoint://auth',
        },
      });

      expect(result).toEqual(mockOAuthResponse.data);
    });

    it('should handle Apple sign in errors', async () => {
      const mockError = new Error('Apple sign in failed');
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(authService.signInWithApple()).rejects.toThrow('Apple sign in failed');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      await expect(authService.signOut()).resolves.not.toThrow();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const mockError = new Error('Sign out failed');
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError,
      });

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should handle get user errors', async () => {
      const mockError = new Error('Failed to get user');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get user');
    });

    it('should return null when no user is logged in', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });
});