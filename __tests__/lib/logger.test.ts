import Logger from '../../lib/logger';

describe('Logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Development mode', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ isDevelopment: true });
    });

    it('should log debug messages in development', () => {
      logger.debug('test debug message');
      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG]', 'test debug message');
    });

    it('should log info messages in development', () => {
      logger.info('test info message');
      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO]', 'test info message');
    });

    it('should log warnings in development', () => {
      logger.warn('test warning');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN]', 'test warning');
    });

    it('should log errors in development', () => {
      logger.error('test error');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', 'test error');
    });
  });

  describe('Production mode', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ isDevelopment: false });
    });

    it('should not log debug messages in production', () => {
      logger.debug('test debug message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not log info messages in production', () => {
      logger.info('test info message');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it('should not log warnings in production', () => {
      logger.warn('test warning');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should still log errors in production', () => {
      logger.error('test error');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', 'test error');
    });
  });

  describe('Sensitive data sanitization', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ isDevelopment: true });
    });

    it('should redact Bearer tokens', () => {
      const message = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      logger.debug(message);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[DEBUG]',
        'Authorization: Bearer [REDACTED]'
      );
    });

    it('should redact access tokens in URLs', () => {
      const message = 'URL: https://api.example.com?access_token=secret123';
      logger.debug(message);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[DEBUG]',
        'URL: https://api.example.com?access_token=[REDACTED]'
      );
    });

    it('should redact refresh tokens', () => {
      const message = 'refresh_token=secret_refresh_token_123';
      logger.debug(message);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[DEBUG]',
        'refresh_token=[REDACTED]'
      );
    });

    it('should redact password fields', () => {
      const message = 'Login with password=mySecretPassword123';
      logger.debug(message);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[DEBUG]',
        'Login with password=[REDACTED]'
      );
    });

    it('should redact sensitive fields in objects', () => {
      const data = {
        user: 'john',
        access_token: 'secret_token',
        refreshToken: 'refresh_secret',
        password: 'my_password',
        apiKey: 'api_secret',
        data: {
          nested_token: 'nested_secret',
        },
      };

      logger.debug(data);

      const loggedData = consoleSpy.log.mock.calls[0][1];
      expect(loggedData.user).toBe('john');
      expect(loggedData.access_token).toBe('[REDACTED]');
      expect(loggedData.refreshToken).toBe('[REDACTED]');
      expect(loggedData.password).toBe('[REDACTED]');
      expect(loggedData.apiKey).toBe('[REDACTED]');
      expect(loggedData.data.nested_token).toBe('[REDACTED]');
    });

    it('should handle arrays with sensitive data', () => {
      const data = [
        { name: 'user1', token: 'secret1' },
        { name: 'user2', token: 'secret2' },
      ];

      logger.debug(data);

      const loggedData = consoleSpy.log.mock.calls[0][1];
      expect(loggedData[0].name).toBe('user1');
      expect(loggedData[0].token).toBe('[REDACTED]');
      expect(loggedData[1].name).toBe('user2');
      expect(loggedData[1].token).toBe('[REDACTED]');
    });
  });

  describe('Log level filtering', () => {
    it('should respect log level settings', () => {
      const logger = new Logger({ isDevelopment: true, logLevel: 'warn' });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warning message');
      logger.error('error message');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN]', 'warning message');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', 'error message');
    });
  });

  describe('Performance helpers', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ isDevelopment: true });
      jest.spyOn(console, 'time').mockImplementation();
      jest.spyOn(console, 'timeEnd').mockImplementation();
      jest.spyOn(console, 'group').mockImplementation();
      jest.spyOn(console, 'groupEnd').mockImplementation();
    });

    it('should call console.time in development', () => {
      logger.time('operation');
      expect(console.time).toHaveBeenCalledWith('operation');
    });

    it('should call console.timeEnd in development', () => {
      logger.timeEnd('operation');
      expect(console.timeEnd).toHaveBeenCalledWith('operation');
    });

    it('should not call timing methods in production', () => {
      const prodLogger = new Logger({ isDevelopment: false });
      prodLogger.time('operation');
      prodLogger.timeEnd('operation');

      expect(console.time).not.toHaveBeenCalled();
      expect(console.timeEnd).not.toHaveBeenCalled();
    });

    it('should handle console groups in development', () => {
      logger.group('Test Group');
      logger.groupEnd();

      expect(console.group).toHaveBeenCalledWith('Test Group');
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });
});