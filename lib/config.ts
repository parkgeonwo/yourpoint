/**
 * Application configuration with environment variable validation
 */
import { logger } from './logger';

interface Config {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
}

/**
 * Validates that a required environment variable exists and is not empty
 */
function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  
  if (!value || value.trim() === '') {
    if (fallback !== undefined) {
      logger.warn(`Environment variable ${name} not found, using fallback value`);
      return fallback;
    }
    throw new Error(
      `Required environment variable ${name} is missing or empty. ` +
      `Please check your .env file or environment configuration.`
    );
  }
  
  return value.trim();
}

/**
 * Validates Supabase URL format
 */
function validateSupabaseUrl(url: string): void {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes('supabase')) {
      throw new Error('Invalid Supabase URL format');
    }
  } catch (error) {
    throw new Error(
      `Invalid Supabase URL: ${url}. ` +
      `Expected format: https://your-project.supabase.co`
    );
  }
}

/**
 * Validates Supabase anonymous key format
 */
function validateSupabaseKey(key: string): void {
  if (key.length < 100) {
    throw new Error(
      `Invalid Supabase anonymous key. ` +
      `Key appears too short (${key.length} characters). ` +
      `Please verify your EXPO_PUBLIC_SUPABASE_ANON_KEY.`
    );
  }
  
  // Basic JWT format validation
  if (!key.includes('.')) {
    throw new Error(
      `Invalid Supabase anonymous key format. ` +
      `Expected JWT format with dots separating sections.`
    );
  }
}

/**
 * Determines the current environment
 */
function getEnvironment(): 'development' | 'staging' | 'production' {
  const env = process.env.NODE_ENV || 'development';
  const expoBuildProfile = process.env.EXPO_PUBLIC_BUILD_PROFILE;
  
  if (expoBuildProfile === 'production' || env === 'production') {
    return 'production';
  }
  
  if (expoBuildProfile === 'staging' || env === 'staging') {
    return 'staging';
  }
  
  return 'development';
}

// Load and validate configuration
function loadConfig(): Config {
  logger.info('Loading application configuration...');
  
  try {
    // Get required environment variables
    const supabaseUrl = requireEnv('EXPO_PUBLIC_SUPABASE_URL');
    const supabaseAnonKey = requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
    
    // Validate Supabase configuration
    validateSupabaseUrl(supabaseUrl);
    validateSupabaseKey(supabaseAnonKey);
    
    const environment = getEnvironment();
    
    const config: Config = {
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      },
      app: {
        name: 'YourPoint',
        version: '1.0.0',
        environment,
      },
    };
    
    logger.info('Configuration loaded successfully:', {
      environment: config.app.environment,
      supabaseUrl: config.supabase.url,
    });
    
    return config;
  } catch (error) {
    logger.error('Configuration error:', error);

    // In development, provide helpful instructions
    if (getEnvironment() === 'development') {
      logger.error('Development Setup Instructions:\n' +
        '1. Create a .env file in your project root\n' +
        '2. Add the following variables:\n' +
        '   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
        '   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n' +
        '3. Restart your development server\n' +
        'Need help? Check the setup guide in /plan/implementation-plan.md');
    }
    
    throw error;
  }
}

// Export the validated configuration
export const config = loadConfig();

// Export individual values for backward compatibility
export const supabaseUrl = config.supabase.url;
export const supabaseAnonKey = config.supabase.anonKey;