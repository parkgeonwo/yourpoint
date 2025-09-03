/**
 * Environment validation utilities
 * Run this to validate your environment setup
 */

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
  console.log('\n🔍 Environment Validation Results:');
  console.log('================================');
  
  if (result.isValid) {
    console.log('✅ All environment variables are properly configured!');
  } else {
    console.log('❌ Environment validation failed!');
  }

  if (result.errors.length > 0) {
    console.log('\n🚨 Errors:');
    result.errors.forEach(error => console.log(`   • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  if (!result.isValid) {
    console.log(`
🔧 Setup Instructions:
1. Create a .env file in your project root
2. Add your Supabase configuration:
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
3. Restart your development server

📚 For detailed setup instructions, see /plan/implementation-plan.md
    `);
  }

  console.log('================================\n');
}

// Auto-validate on import in development
if (__DEV__) {
  const result = validateEnvironment();
  if (!result.isValid) {
    printValidationResults(result);
  }
}