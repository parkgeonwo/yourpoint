import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

WebBrowser.maybeCompleteAuthSession();

// For development without Expo account
// Expo Go에서는 https://auth.expo.io 프록시를 사용
const redirectTo = AuthSession.makeRedirectUri({
  useProxy: __DEV__  // 개발 환경에서만 proxy 사용
});

logger.info('Redirect URI:', redirectTo);
logger.info('Development mode:', __DEV__);

// Expo Go에서 사용할 수 있는 대체 방법
const createSessionFromUrl = (url: string) => {
  const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    expires_in: params.get('expires_in'),
    token_type: params.get('token_type'),
    provider_token: params.get('provider_token'),
    provider_refresh_token: params.get('provider_refresh_token'),
  };
};

export const authService = {
  async signInWithGoogle() {
    try {
      logger.info('Starting Google OAuth...');

      // 개발 환경에서는 Supabase의 기본 동작 사용 (브라우저에서 로그인 후 세션 확인)
      if (__DEV__) {
        logger.info('Development mode: Using simplified OAuth flow');

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: false,  // 브라우저 리다이렉트 허용
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) throw error;

        // OAuth URL이 있으면 브라우저에서 열기
        if (data?.url) {
          logger.info('Opening Google OAuth in external browser');

          // 사용자에게 안내 메시지 표시
          Alert.alert(
            'Google 로그인',
            '브라우저에서 로그인을 완료한 후 앱으로 돌아와주세요.',
            [
              {
                text: '확인',
                onPress: async () => {
                  await Linking.openURL(data.url);
                }
              }
            ]
          );

          // 세션이 설정될 때까지 대기 (authStore가 처리)
          return data;
        }
      } else {
        // 프로덕션 환경에서는 WebBrowser 사용
        logger.info('Using redirect URI:', redirectTo);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            skipBrowserRedirect: true,
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
          logger.info('Opening Google OAuth URL:', data.url);

          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo,
            {
              showInRecents: true
            }
          );

          logger.info('WebBrowser result:', {
            type: result.type,
            url: result.type === 'success' ? result.url : undefined
          });
        
        if (result.type === 'success' && result.url) {
          logger.info('Google auth success, processing callback URL:', result.url);

          // Parse both fragment (#) and query (?) parameters
          let params: URLSearchParams | null = null;

          // Try fragment first
          if (result.url.includes('#')) {
            const fragmentString = result.url.split('#')[1]?.split('&')[0] || result.url.split('#')[1];
            params = new URLSearchParams(fragmentString);
            logger.info('Parsing fragment parameters');
          }
          // Then try query parameters
          else if (result.url.includes('?')) {
            const queryString = result.url.split('?')[1]?.split('#')[0] || result.url.split('?')[1];
            params = new URLSearchParams(queryString);
            logger.info('Parsing query parameters');
          }

          if (params) {
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const error = params.get('error');
            const errorDescription = params.get('error_description');

            if (error) {
              logger.error('Google OAuth error:', { error, errorDescription });
              throw new Error(errorDescription || error);
            }

            logger.info('Auth tokens status:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
            });

            if (accessToken && refreshToken) {
              logger.info('Setting Google session...');
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                logger.error('Failed to set session:', sessionError);
                throw sessionError;
              }

              if (sessionData?.session) {
                logger.info('Google login successful for user:', sessionData.user?.email);

                // Force trigger auth state change
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  logger.info('Session confirmed');
                  await supabase.auth.refreshSession();
                }

                return data;
              }
            } else {
              logger.warn('No tokens found in callback URL');
            }
          }

          logger.error('Failed to parse Google authentication response');
          }
          else if (result.type === 'cancel') {
            logger.info('User canceled Google sign in');
            throw new Error('Sign in canceled');
          }
          else if (result.type === 'dismiss') {
            logger.info('Google sign in dismissed');
            throw new Error('Sign in dismissed');
          }
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
      logger.info('Starting Apple OAuth...');

      // iOS에서는 네이티브 Apple 로그인 사용 (단, Expo Go에서는 OAuth 사용)
      // Expo Go에서는 host.exp.Exponent를 사용하므로 네이티브 로그인이 작동하지 않음
      // Constants.appOwnership가 'expo'이면 Expo Go 앱임
      const isExpoGo = __DEV__; // 개발 환경에서는 항상 OAuth 사용

      if (Platform.OS === 'ios' && !isExpoGo) {
        const isAvailable = await AppleAuthentication.isAvailableAsync();

        if (isAvailable) {
          logger.debug('Using native Apple authentication');

          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });

            logger.debug('Apple credential received:', {
              hasIdentityToken: !!credential.identityToken,
              hasAuthorizationCode: !!credential.authorizationCode,
              user: credential.user,
            });

            if (credential.identityToken) {
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'apple',
                token: credential.identityToken,
                nonce: credential.nonce || undefined,
              });

              if (error) {
                logger.error('Apple ID token sign in error:', error);
                throw error;
              }

              if (data?.session) {
                logger.info('Apple login successful for user:', data.user?.email);
                await supabase.auth.refreshSession();
                return data;
              }
            }
          } catch (error: any) {
            if (error.code === 'ERR_REQUEST_CANCELED') {
              logger.info('Apple sign in canceled by user');
              throw new Error('Sign in canceled');
            }
            throw error;
          }
        }
      }

      // 웹이나 Android, Expo Go에서는 OAuth 플로우 사용
      logger.info('Using OAuth flow for Apple sign in (Development/Web mode)');

      // 개발 환경에서는 웹 플로우 사용
      if (__DEV__) {
        logger.info('Development mode: Using web-based Apple sign in');

        // Supabase 대시보드의 URL을 직접 사용
        const supabaseUrl = 'https://rvokurohcuoimkxnwbjm.supabase.co';
        const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=apple`;

        logger.info('Opening Apple auth URL in browser');

        // 브라우저에서 로그인 페이지 열기
        const result = await WebBrowser.openBrowserAsync(authUrl);

        logger.info('Browser closed, checking session...');

        // 브라우저가 닫힌 후 세션 확인
        // 사용자가 로그인을 완료했다면 Supabase가 세션을 설정했을 것
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session) {
          logger.info('Apple login successful via web flow');
          await supabase.auth.refreshSession();
          return { session, user: session.user };
        } else {
          logger.info('No session found after browser close');
          throw new Error('Apple sign in was not completed');
        }
      }

      // 프로덕션에서는 정상적인 OAuth 플로우 사용
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectTo,
          skipBrowserRedirect: true,
        },
      });

      logger.debug('Apple OAuth response:', { hasData: !!data, error });

      if (error) throw error;

      // Manually open the OAuth URL if it exists
      if (data?.url) {
        logger.info('Opening Apple OAuth URL:', data.url);
        logger.info('Expecting redirect to:', redirectTo);

        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo,
          {
            showInRecents: true
          }
        );

        logger.info('WebBrowser result:', {
          type: result.type,
          url: result.type === 'success' ? result.url : undefined
        });

        if (result.type === 'success' && result.url) {
          logger.info('Apple auth callback received, processing URL:', result.url);

          // Try to parse both fragment (#) and query (?) parameters
          let params: URLSearchParams | null = null;

          // First try fragment
          if (result.url.includes('#')) {
            const fragmentString = result.url.split('#')[1];
            params = new URLSearchParams(fragmentString);
            logger.info('Parsing fragment parameters');
          }
          // Then try query parameters
          else if (result.url.includes('?')) {
            const queryString = result.url.split('?')[1];
            params = new URLSearchParams(queryString);
            logger.info('Parsing query parameters');
          }

          if (params) {
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const errorDescription = params.get('error_description');
            const error = params.get('error');

            if (error) {
              logger.error('Apple OAuth error:', { error, errorDescription });
              throw new Error(errorDescription || error);
            }

            logger.info('Apple auth tokens status:', {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!refreshToken,
            });

            if (accessToken && refreshToken) {
              logger.info('Setting Apple session...');
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                logger.error('Failed to set session:', sessionError);
                throw sessionError;
              }

              if (sessionData?.session) {
                logger.info('Apple login successful for user:', sessionData.user?.email);

                // Force trigger auth state change
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  logger.info('Apple session confirmed');
                  await supabase.auth.refreshSession();
                }

                return data;
              }
            } else {
              logger.warn('No tokens found in callback URL');
            }
          }

          logger.error('Failed to parse Apple authentication response from URL');
        }
        else if (result.type === 'cancel') {
          logger.info('User canceled Apple sign in');
          throw new Error('Sign in canceled');
        }
        else if (result.type === 'dismiss') {
          logger.info('Apple sign in dismissed');
          throw new Error('Sign in dismissed');
        }
      }

      return data;
    } catch (error) {
      logger.error('Apple sign in error:', error);
      throw error;
    }
  },

  async signInWithEmail(email: string, password: string) {
    try {
      logger.info('Starting email sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        logger.info('Email login successful for user:', data.user?.email);
        await supabase.auth.refreshSession();
      }

      return data;
    } catch (error) {
      logger.error('Email sign in error:', error);
      throw error;
    }
  },

  async signUpWithEmail(email: string, password: string, name?: string) {
    try {
      logger.info('Starting email sign up...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            display_name: name,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        logger.info('Sign up successful for user:', data.user?.email);
        logger.info('User profile will be created by database trigger');
      }

      return data;
    } catch (error) {
      logger.error('Email sign up error:', error);
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