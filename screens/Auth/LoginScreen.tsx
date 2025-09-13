import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { lightTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import SocialLoginButton from '../../components/auth/SocialLoginButton';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { refreshSession, isAuthenticated } = useAuthStore();

  // 인증 상태 변경 감지
  useEffect(() => {
    if (isAuthenticated && loading) {
      console.log('Login successful, resetting loading state');
      setLoading(false);
    }
  }, [isAuthenticated, loading]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log('Google login button pressed');

      // Test Supabase connection first
      const { data, error } = await supabase.from('users').select('count').limit(1);
      console.log('Supabase connection test:', { data, error });

      await authService.signInWithGoogle();

      // Don't immediately set loading to false
      // Let the auth state change handle it
      console.log('Login attempt initiated, waiting for auth state change...');

    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('로그인 오류', error.message || 'Google 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      await authService.signInWithApple();
      console.log('Apple login attempt initiated, waiting for auth state change...');
    } catch (error: any) {
      Alert.alert('로그인 오류', error.message || 'Apple 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>YourPoint에 오신 걸 환영합니다</Text>
        <Text style={styles.subtitle}>
          소중한 사람들과 일정과 추억을 공유하세요
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '로그인 중...' : 'Google로 로그인'}
          </Text>
        </TouchableOpacity>
        
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.button, styles.appleButton, loading && styles.disabledButton]}
            onPress={handleAppleLogin}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.appleButtonText]}>
              {loading ? '로그인 중...' : 'Apple로 로그인'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.socialButtonContainer}>
          <SocialLoginButton provider="google" />
          <SocialLoginButton provider="apple" />
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
    justifyContent: 'center',
    paddingHorizontal: lightTheme.spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: lightTheme.typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: lightTheme.colors.text,
    textAlign: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  subtitle: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: lightTheme.spacing['2xl'],
    lineHeight: lightTheme.typography.lineHeight.relaxed * lightTheme.typography.fontSize.base,
  },
  button: {
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.xl,
    borderRadius: lightTheme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  buttonText: {
    color: 'white',
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialButtonContainer: {
    width: '100%',
    marginTop: lightTheme.spacing.sm,
  },
});