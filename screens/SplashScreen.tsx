import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { lightTheme } from '../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📍</Text>
        </View>
        <Text style={styles.title}>YourPoint</Text>
        <Text style={styles.subtitle}>소중한 사람들과 함께하는 공간</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: lightTheme.borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xl,
  },
  logo: {
    fontSize: 60,
  },
  title: {
    fontSize: lightTheme.typography.fontSize['3xl'],
    fontWeight: 'bold',
    color: 'white',
    marginBottom: lightTheme.spacing.sm,
  },
  subtitle: {
    fontSize: lightTheme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});