import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { lightTheme } from '../../theme';
import { authService } from '../../services/authService';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');

  const validatePassword = (pass: string): string[] => {
    const errors: string[] = [];

    if (pass.length < 8) {
      errors.push('최소 8자 이상이어야 합니다');
    }

    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

    if (typeCount < 2) {
      errors.push('문자, 숫자, 특수문자 중 2가지 이상 포함해야 합니다');
    }

    return errors;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text) {
      setPasswordErrors(validatePassword(text));
    } else {
      setPasswordErrors([]);
    }
  };

  const handleNameChange = (text: string) => {
    // 한글(완성형, 자음, 모음), 영문, 숫자만 허용하는 정규식
    // ㄱ-ㅎ: 자음, ㅏ-ㅣ: 모음, 가-힣: 완성된 한글
    const validNameRegex = /^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]*$/;

    if (validNameRegex.test(text) || text === '') {
      setName(text);
      setNameError('');
    } else {
      // 특수문자나 공백이 포함된 경우 - 마지막 유효한 문자까지만 저장
      const filteredText = text.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g, '');
      setName(filteredText);
      setNameError('한글, 영문, 숫자만 입력 가능합니다');
      // 에러 메시지를 잠시 후 제거
      setTimeout(() => setNameError(''), 2000);
    }
  };

  const handleSignUp = async () => {
    // Validation
    if (!email || !name || !password || !confirmPassword) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('입력 오류', '올바른 이메일 주소를 입력해주세요.');
      return;
    }

    // 이름 유효성 검사 (최종 제출 시에는 완성된 한글만 허용)
    const finalNameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (!finalNameRegex.test(name)) {
      Alert.alert('입력 오류', '이름은 완성된 한글, 영문, 숫자만 입력 가능합니다.');
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      Alert.alert('비밀번호 오류', errors.join('\n'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);

      // Sign up with email, password, and name
      const { data, error } = await authService.signUpWithEmail(email, password, name);

      if (error) throw error;

      if (data?.user) {
        Alert.alert(
          '회원가입 성공',
          '이메일을 확인하여 계정을 인증해주세요.',
          [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('회원가입 오류', error.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;

    const errors = validatePassword(password);
    if (errors.length === 0) {
      return { text: '강함', color: lightTheme.colors.success };
    } else if (errors.length === 1) {
      return { text: '보통', color: '#FFA500' };
    } else {
      return { text: '약함', color: lightTheme.colors.destructive };
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            YourPoint와 함께 소중한 순간들을 공유하세요
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={lightTheme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>이름 or 닉네임</Text>
            <TextInput
              style={[
                styles.input,
                nameError ? styles.inputError : null,
              ]}
              placeholder="홍길동 or 빵빵이"
              placeholderTextColor={lightTheme.colors.textSecondary}
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="none"
              editable={!loading}
              maxLength={20}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={[
                styles.input,
                passwordErrors.length > 0 && password && styles.inputError,
              ]}
              placeholder="비밀번호 입력"
              placeholderTextColor={lightTheme.colors.textSecondary}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {passwordStrength && (
              <View style={styles.passwordStrengthContainer}>
                <Text style={styles.passwordStrengthLabel}>비밀번호 강도: </Text>
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}

            {passwordErrors.length > 0 && password && (
              <View style={styles.errorContainer}>
                {passwordErrors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={[
                styles.input,
                confirmPassword && password !== confirmPassword && styles.inputError,
              ]}
              placeholder="비밀번호 재입력"
              placeholderTextColor={lightTheme.colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
            )}
          </View>

          <View style={styles.requirementContainer}>
            <Text style={styles.requirementTitle}>비밀번호 요구사항</Text>
            <Text style={styles.requirementText}>• 최소 8자 이상</Text>
            <Text style={styles.requirementText}>
              • 문자, 숫자, 특수문자 중 2가지 이상 포함
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '처리 중...' : '회원가입'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
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
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: lightTheme.spacing.xl,
    paddingVertical: lightTheme.spacing.xl,
  },
  backButton: {
    paddingVertical: lightTheme.spacing.sm,
    marginTop: 18,
    marginBottom: lightTheme.spacing.lg,
  },
  backButtonText: {
    color: lightTheme.colors.primary,
    fontSize: lightTheme.typography.fontSize.base,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: lightTheme.typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.sm,
  },
  subtitle: {
    fontSize: lightTheme.typography.fontSize.base,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing['2xl'],
  },
  inputContainer: {
    marginBottom: lightTheme.spacing.lg,
  },
  label: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
    marginTop: lightTheme.spacing.md,
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
  },
  inputError: {
    borderColor: lightTheme.colors.destructive,
  },
  errorContainer: {
    marginTop: lightTheme.spacing.xs,
    marginBottom: lightTheme.spacing.sm,
  },
  errorText: {
    color: lightTheme.colors.destructive,
    fontSize: lightTheme.typography.fontSize.sm,
    marginTop: lightTheme.spacing.xs,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: lightTheme.spacing.xs,
  },
  passwordStrengthLabel: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
  },
  passwordStrengthText: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: '600',
  },
  requirementContainer: {
    backgroundColor: lightTheme.colors.surface,
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    marginBottom: lightTheme.spacing.xl,
  },
  requirementTitle: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  requirementText: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
    marginTop: lightTheme.spacing.xs,
  },
  button: {
    backgroundColor: lightTheme.colors.primary,
    paddingVertical: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.xl,
    borderRadius: lightTheme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: lightTheme.spacing.lg,
  },
  buttonText: {
    color: 'white',
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: lightTheme.colors.textSecondary,
    fontSize: lightTheme.typography.fontSize.base,
  },
  loginLink: {
    color: lightTheme.colors.primary,
    fontSize: lightTheme.typography.fontSize.base,
    fontWeight: '600',
  },
});