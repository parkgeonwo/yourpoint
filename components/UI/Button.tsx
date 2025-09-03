import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { lightTheme } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondary, disabled && styles.secondaryDisabled];
      case 'outline':
        return [...baseStyle, styles.outline, disabled && styles.outlineDisabled];
      case 'ghost':
        return [...baseStyle, styles.ghost, disabled && styles.ghostDisabled];
      default:
        return [...baseStyle, styles.primary, disabled && styles.primaryDisabled];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.secondaryText, disabled && styles.secondaryTextDisabled];
      case 'outline':
        return [...baseStyle, styles.outlineText, disabled && styles.outlineTextDisabled];
      case 'ghost':
        return [...baseStyle, styles.ghostText, disabled && styles.ghostTextDisabled];
      default:
        return [...baseStyle, styles.primaryText, disabled && styles.primaryTextDisabled];
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? 'white' : lightTheme.colors.primary}
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: lightTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Sizes
  small: {
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: lightTheme.spacing.xl,
    paddingVertical: lightTheme.spacing.lg,
    minHeight: 56,
  },
  
  // Text sizes
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: lightTheme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: lightTheme.typography.fontSize.base,
  },
  largeText: {
    fontSize: lightTheme.typography.fontSize.lg,
  },
  
  // Primary variant
  primary: {
    backgroundColor: lightTheme.colors.primary,
  },
  primaryText: {
    color: 'white',
  },
  primaryDisabled: {
    backgroundColor: lightTheme.colors.textSecondary,
  },
  primaryTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  // Secondary variant
  secondary: {
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  secondaryText: {
    color: lightTheme.colors.text,
  },
  secondaryDisabled: {
    backgroundColor: lightTheme.colors.background,
    borderColor: lightTheme.colors.textSecondary,
  },
  secondaryTextDisabled: {
    color: lightTheme.colors.textSecondary,
  },
  
  // Outline variant
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: lightTheme.colors.primary,
  },
  outlineText: {
    color: lightTheme.colors.primary,
  },
  outlineDisabled: {
    borderColor: lightTheme.colors.textSecondary,
  },
  outlineTextDisabled: {
    color: lightTheme.colors.textSecondary,
  },
  
  // Ghost variant
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: lightTheme.colors.primary,
  },
  ghostDisabled: {
    backgroundColor: 'transparent',
  },
  ghostTextDisabled: {
    color: lightTheme.colors.textSecondary,
  },
});