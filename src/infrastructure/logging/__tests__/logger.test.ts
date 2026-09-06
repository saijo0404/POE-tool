import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logger,
  sanitizeLogMessage,
  safeStringify,
  initGlobalErrorLogging,
  resetGlobalErrorLoggingForTest,
  isErrorLoggingInitialized
} from '../logger';
import poeApi from '../../../services/api';

vi.mock('../../../services/api', () => ({
  default: {
    writeLogEntry: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('logger and sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetGlobalErrorLoggingForTest();
  });

  afterEach(() => {
    resetGlobalErrorLoggingForTest();
  });

  describe('sanitizeLogMessage', () => {
    it('returns empty string on empty input', () => {
      expect(sanitizeLogMessage('')).toBe('');
    });

    it('redacts Bearer tokens', () => {
      const msg = 'Authorization: Bearer my_secret_token_12345';
      expect(sanitizeLogMessage(msg)).toBe('Authorization: Bearer ***REDACTED***');
    });

    it('redacts POESESSID and query string secrets', () => {
      const msg = 'GET /api/stash?poesessid=abcdef0123456789&tab=1';
      expect(sanitizeLogMessage(msg)).toBe('GET /api/stash?poesessid=***REDACTED***&tab=1');
    });

    it('redacts JSON format secrets', () => {
      const msg = '{"token": "xyz987", "accountName": "Exile123", "password": "super-secret"}';
      const sanitized = sanitizeLogMessage(msg);
      expect(sanitized).toContain('"token":"***REDACTED***"');
      expect(sanitized).toContain('"password":"***REDACTED***"');
      expect(sanitized).toContain('"accountName": "Exile123"');
    });

    it('preserves non-sensitive log contents', () => {
      const msg = 'Parsed item Headhunter with 5 affixes successfully.';
      expect(sanitizeLogMessage(msg)).toBe(msg);
    });
  });

  describe('safeStringify', () => {
    it('returns string as is', () => {
      expect(safeStringify('test message')).toBe('test message');
    });

    it('formats Error object with name and message', () => {
      const err = new Error('Network timeout');
      expect(safeStringify(err)).toContain('Error: Network timeout');
    });

    it('serializes plain objects to JSON', () => {
      const obj = { league: 'Standard', count: 42 };
      expect(safeStringify(obj)).toBe('{"league":"Standard","count":42}');
    });
  });

  describe('logger methods', () => {
    it('calls writeLogEntry with TRACE level', async () => {
      await logger.trace('trace message', 'TestCtx');
      expect(poeApi.writeLogEntry).toHaveBeenCalledWith('TRACE', 'trace message', 'TestCtx');
    });

    it('calls writeLogEntry with DEBUG level', async () => {
      await logger.debug('debug info', 'DebugCtx');
      expect(poeApi.writeLogEntry).toHaveBeenCalledWith('DEBUG', 'debug info', 'DebugCtx');
    });

    it('calls writeLogEntry with INFO level and sanitizes', async () => {
      await logger.info('Connecting with poesessid=secret_123', 'Api');
      expect(poeApi.writeLogEntry).toHaveBeenCalledWith(
        'INFO',
        'Connecting with poesessid=***REDACTED***',
        'Api'
      );
    });

    it('calls writeLogEntry with WARN level', async () => {
      await logger.warn('Stash fetch slow', 'Stash');
      expect(poeApi.writeLogEntry).toHaveBeenCalledWith('WARN', 'Stash fetch slow', 'Stash');
    });

    it('calls writeLogEntry with ERROR level', async () => {
      await logger.error(new Error('IPC crash'), 'IPC');
      expect(poeApi.writeLogEntry).toHaveBeenCalledWith(
        'ERROR',
        expect.stringContaining('IPC crash'),
        'IPC'
      );
    });

    it('does not throw when writeLogEntry rejects', async () => {
      vi.mocked(poeApi.writeLogEntry).mockRejectedValueOnce(new Error('IPC unavailable'));
      await expect(logger.info('safe call')).resolves.toBeUndefined();
    });
  });

  describe('initGlobalErrorLogging', () => {
    it('initializes global error listeners once', () => {
      expect(isErrorLoggingInitialized()).toBe(false);
      initGlobalErrorLogging();
      expect(isErrorLoggingInitialized()).toBe(true);

      // Calling again should not throw or duplicate
      initGlobalErrorLogging();
      expect(isErrorLoggingInitialized()).toBe(true);
    });

    it('captures window error events', () => {
      initGlobalErrorLogging();
      const event = new ErrorEvent('error', {
        message: 'Uncaught script error',
        error: new Error('Script failure')
      });
      window.dispatchEvent(event);

      expect(poeApi.writeLogEntry).toHaveBeenCalledWith(
        'ERROR',
        expect.stringContaining('Unhandled window error: Error: Script failure'),
        'GlobalError'
      );
    });

    it('captures unhandledrejection events', () => {
      initGlobalErrorLogging();
      const event = new Event('unhandledrejection');
      Object.assign(event, {
        promise: Promise.resolve(),
        reason: 'Async failure'
      });
      window.dispatchEvent(event);

      expect(poeApi.writeLogEntry).toHaveBeenCalledWith(
        'ERROR',
        'Unhandled promise rejection: Async failure',
        'GlobalPromise'
      );
    });
  });
});
