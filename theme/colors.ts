export const colors = {
  light: {
    primary: '#6366f1',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    destructive: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  dark: {
    primary: '#818cf8',
    accent: '#fbbf24',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    destructive: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
  },
};

export type ThemeColors = typeof colors.light;