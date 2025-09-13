import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authService } from '../../services/authService';

interface SocialLoginButtonProps {
  provider: 'google' | 'apple';
  onPress?: () => void;
}

export default function SocialLoginButton({ provider, onPress }: SocialLoginButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = React.useState(false);

  React.useEffect(() => {
    if (provider === 'apple' && Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, [provider]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      await authService.signInWithApple();
    } catch (error) {
      console.error('Apple login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (provider === 'google') {
      handleGoogleLogin();
    } else if (provider === 'apple') {
      handleAppleLogin();
    }
  };

  // Apple 로그인이 iOS에서 사용 불가능한 경우 숨김
  if (provider === 'apple' && Platform.OS === 'ios' && !isAppleAvailable) {
    return null;
  }

  const config = {
    google: {
      icon: 'logo-google' as const,
      text: 'Google로 계속하기',
      backgroundColor: '#fff',
      textColor: '#333',
    },
    apple: {
      icon: 'logo-apple' as const,
      text: 'Apple로 계속하기',
      backgroundColor: '#000',
      textColor: '#fff',
    },
  };

  const { icon, text, backgroundColor, textColor } = config[provider];

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          <Ionicons name={icon} size={20} color={textColor} />
          <Text style={[styles.text, { color: textColor }]}>{text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
    minHeight: 44, // Apple 규정 준수
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});