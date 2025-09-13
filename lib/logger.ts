/**
 * Secure logger utility that only logs in development mode
 * Prevents sensitive data from being logged in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  isDevelopment: boolean;
  logLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      isDevelopment: __DEV__ || false,
      logLevel: 'debug',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.isDevelopment) {
      // In production, only log errors
      return level === 'error';
    }
    return this.logLevels[level] >= this.logLevels[this.config.logLevel];
  }

  private sanitize(data: any): any {
    if (typeof data === 'string') {
      // Remove potential tokens or sensitive data patterns
      return data
        .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, 'Bearer [REDACTED]')
        .replace(/access_token=[\w-]+/gi, 'access_token=[REDACTED]')
        .replace(/refresh_token=[\w-]+/gi, 'refresh_token=[REDACTED]')
        .replace(/password=[\w-]+/gi, 'password=[REDACTED]');
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {};

      for (const key in data) {
        const lowerKey = key.toLowerCase();
        // Redact sensitive fields
        if (
          lowerKey.includes('token') ||
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey === 'authorization'
        ) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(data[key]);
        }
      }

      return sanitized;
    }

    return data;
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      const sanitized = args.map(arg => this.sanitize(arg));
      console.log('[DEBUG]', ...sanitized);
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      const sanitized = args.map(arg => this.sanitize(arg));
      console.info('[INFO]', ...sanitized);
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      const sanitized = args.map(arg => this.sanitize(arg));
      console.warn('[WARN]', ...sanitized);
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      const sanitized = args.map(arg => this.sanitize(arg));
      console.error('[ERROR]', ...sanitized);
    }
  }

  // Group logging for better organization
  group(label: string): void {
    if (this.config.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.config.isDevelopment) {
      console.groupEnd();
    }
  }

  // Performance timing helpers
  time(label: string): void {
    if (this.config.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.config.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export default Logger;