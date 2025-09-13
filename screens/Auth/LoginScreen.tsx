import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { lightTheme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await authService.signInWithEmail(email, password);
      console.log('Email login attempt initiated, waiting for auth state change...');
    } catch (error: any) {
      Alert.alert('로그인 오류', error.message || '이메일 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>YourPoint에 오신 걸 환영합니다</Text>
          <Text style={styles.subtitle}>
            소중한 사람들과 일정과 추억을 공유하세요
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor={lightTheme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={lightTheme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, styles.emailButton, loading && styles.disabledButton]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '로그인 중...' : '로그인'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.signUpButton, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.signUpButtonText]}>
              {loading ? '처리 중...' : '회원가입'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.socialButton, loading && styles.disabledButton]}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: lightTheme.spacing.xl,
    paddingVertical: lightTheme.spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: lightTheme.spacing.lg,
  },
  input: {
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: lightTheme.borderRadius.lg,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.lg,
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: lightTheme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: lightTheme.colors.border,
  },
  dividerText: {
    color: lightTheme.colors.textSecondary,
    fontSize: lightTheme.typography.fontSize.sm,
    marginHorizontal: lightTheme.spacing.md,
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
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.xl,
    borderRadius: lightTheme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.md,
  },
  emailButton: {
    backgroundColor: lightTheme.colors.primary,
  },
  signUpButton: {
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.primary,
  },
  signUpButtonText: {
    color: lightTheme.colors.primary,
  },
  socialButton: {
    backgroundColor: '#4285F4',
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