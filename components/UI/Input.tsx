import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { lightTheme } from '../../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export default function Input({
  label,
  error,
  helperText,
  variant = 'outline',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = () => {
    const baseStyle = [styles.container, styles[size]];
    
    if (error) {
      return [...baseStyle, styles.error];
    }
    
    if (isFocused) {
      return [...baseStyle, styles.focused];
    }
    
    switch (variant) {
      case 'filled':
        return [...baseStyle, styles.filled];
      case 'default':
        return [...baseStyle, styles.default];
      default:
        return [...baseStyle, styles.outline];
    }
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input, styles[`${size}Input`]];
    return baseStyle;
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, error && styles.labelError, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={getContainerStyle()}>
        <TextInput
          style={[...getInputStyle(), inputStyle]}
          placeholderTextColor={lightTheme.colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
      </View>
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: lightTheme.borderRadius.md,
    justifyContent: 'center',
  },
  
  // Sizes
  small: {
    minHeight: 36,
  },
  medium: {
    minHeight: 48,
  },
  large: {
    minHeight: 56,
  },
  
  // Input sizes
  input: {
    color: lightTheme.colors.text,
    paddingHorizontal: lightTheme.spacing.md,
  },
  smallInput: {
    fontSize: lightTheme.typography.fontSize.sm,
    paddingVertical: lightTheme.spacing.sm,
  },
  mediumInput: {
    fontSize: lightTheme.typography.fontSize.base,
    paddingVertical: lightTheme.spacing.md,
  },
  largeInput: {
    fontSize: lightTheme.typography.fontSize.lg,
    paddingVertical: lightTheme.spacing.lg,
  },
  
  // Variants
  default: {
    backgroundColor: lightTheme.colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: lightTheme.colors.border,
  },
  outline: {
    backgroundColor: lightTheme.colors.surface,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
  },
  filled: {
    backgroundColor: lightTheme.colors.background,
  },
  
  // States
  focused: {
    borderColor: lightTheme.colors.primary,
  },
  error: {
    borderColor: lightTheme.colors.destructive,
  },
  
  // Label
  label: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.xs,
  },
  labelError: {
    color: lightTheme.colors.destructive,
  },
  
  // Helper text
  helperText: {
    fontSize: lightTheme.typography.fontSize.xs,
    color: lightTheme.colors.textSecondary,
    marginTop: lightTheme.spacing.xs,
  },
  errorText: {
    color: lightTheme.colors.destructive,
  },
});