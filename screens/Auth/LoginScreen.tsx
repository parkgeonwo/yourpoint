import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { lightTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { refreshSession } = useAuthStore();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log('Google login button pressed');
      
      // Test Supabase connection first
      const { data, error } = await supabase.from('users').select('count').limit(1);
      console.log('Supabase connection test:', { data, error });
      
      await authService.signInWithGoogle();
      
      // Force refresh session after login attempt
      console.log('Login attempt completed, refreshing session...');
      setTimeout(() => {
        refreshSession();
      }, 1500);
      
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('로그인 오류', error.message || 'Google 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      await authService.signInWithApple();
    } catch (error: any) {
      Alert.alert('로그인 오류', error.message || 'Apple 로그인에 실패했습니다.');
    } finally {
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
      </View>
    </View>
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
});