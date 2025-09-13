/**
 * Environment validation utilities
 * Run this to validate your environment setup
 */
import { logger } from './logger';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check required environment variables
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      result.errors.push(`Missing required environment variable: ${varName}`);
      result.isValid = false;
    }
  });

  // Validate Supabase URL
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      if (!url.hostname.includes('supabase')) {
        result.warnings.push('Supabase URL does not appear to be a standard Supabase URL');
      }
    } catch {
      result.errors.push('EXPO_PUBLIC_SUPABASE_URL is not a valid URL');
      result.isValid = false;
    }
  }

  // Validate Supabase key
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseKey) {
    if (supabaseKey.length < 100) {
      result.errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY appears to be too short');
      result.isValid = false;
    }
    if (!supabaseKey.includes('.')) {
      result.errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY does not appear to be in JWT format');
      result.isValid = false;
    }
  }

  // Check for common development issues
  if (supabaseUrl === 'your-project.supabase.co' || supabaseUrl?.includes('example')) {
    result.errors.push('EXPO_PUBLIC_SUPABASE_URL appears to be a placeholder value');
    result.isValid = false;
  }

  if (supabaseKey === 'your-anon-key-here' || supabaseKey?.includes('example')) {
    result.errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY appears to be a placeholder value');
    result.isValid = false;
  }

  return result;
}

export function printValidationResults(result: ValidationResult): void {
  if (result.isValid) {
    logger.info('All environment variables are properly configured!');
  } else {
    logger.error('Environment validation failed!');
  }

  if (result.errors.length > 0) {
    result.errors.forEach(error => logger.error(error));
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => logger.warn(warning));
  }

  if (!result.isValid) {
    logger.error('Setup Instructions:\n' +
      '1. Create a .env file in your project root\n' +
      '2. Add your Supabase configuration:\n' +
      '   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      '   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n' +
      '3. Restart your development server\n' +
      'For detailed setup instructions, see /plan/implementation-plan.md');
  }
}

// Auto-validate on import in development
if (__DEV__) {
  const result = validateEnvironment();
  if (!result.isValid) {
    printValidationResults(result);
  }
}