import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { lightTheme } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}: CardProps) {
  const getCardStyle = () => {
    const baseStyle = [styles.card, styles[padding]];
    
    switch (variant) {
      case 'elevated':
        return [...baseStyle, styles.elevated];
      case 'outlined':
        return [...baseStyle, styles.outlined];
      default:
        return baseStyle;
    }
  };

  return (
    <View style={[...getCardStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.lg,
  },
  
  // Padding variants
  none: {
    padding: 0,
  },
  small: {
    padding: lightTheme.spacing.sm,
  },
  medium: {
    padding: lightTheme.spacing.lg,
  },
  large: {
    padding: lightTheme.spacing.xl,
  },
  
  // Style variants
  elevated: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
});