import poeApi from '../../services/api';
import type { LogLevel } from '../../domain/logger/types';

const SENSITIVE_KEY_PATTERN =
  /(poesessid|cf_clearance|poetoken|token|password|secret)=([^&\s,;]+)/gi;
const JSON_SECRET_PATTERN =
  /("(?:poesessid|cf_clearance|poetoken|token|password|secret)")\s*:\s*"[^"]*"/gi;
const BEARER_PATTERN = /bearer\s+[a-zA-Z0-9_\-.]+/gi;

export function sanitizeLogMessage(input: string): string {
  if (!input) return '';
  let sanitized = input.replace(BEARER_PATTERN, 'Bearer ***REDACTED***');
  sanitized = sanitized.replace(SENSITIVE_KEY_PATTERN, '$1=***REDACTED***');
  return sanitized.replace(JSON_SECRET_PATTERN, '$1:"***REDACTED***"');
}

export function safeStringify(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item instanceof Error) {
    return `${item.name}: ${item.message}\n${item.stack ?? ''}`.trim();
  }
  try {
    return JSON.stringify(item);
  } catch {
    return String(item);
  }
}

async function emitLog(
  level: LogLevel,
  rawMessage: unknown,
  context?: string
): Promise<void> {
  const messageStr = safeStringify(rawMessage);
  const sanitized = sanitizeLogMessage(messageStr);
  try {
    await poeApi.writeLogEntry(level, sanitized, context);
  } catch {
    // Non-blocking fallback if backend IPC is not ready
  }
}

export const logger = {
  trace: (message: unknown, context?: string): Promise<void> =>
    emitLog('TRACE', message, context),
  debug: (message: unknown, context?: string): Promise<void> =>
    emitLog('DEBUG', message, context),
  info: (message: unknown, context?: string): Promise<void> =>
    emitLog('INFO', message, context),
  warn: (message: unknown, context?: string): Promise<void> =>
    emitLog('WARN', message, context),
  error: (message: unknown, context?: string): Promise<void> =>
    emitLog('ERROR', message, context)
};

let isGlobalErrorLoggingInitialized = false;

export function isErrorLoggingInitialized(): boolean {
  return isGlobalErrorLoggingInitialized;
}

export function resetGlobalErrorLoggingForTest(): void {
  isGlobalErrorLoggingInitialized = false;
}

export function initGlobalErrorLogging(): void {
  if (isGlobalErrorLoggingInitialized || typeof window === 'undefined') {
    return;
  }
  isGlobalErrorLoggingInitialized = true;

  window.addEventListener('error', (event: ErrorEvent) => {
    const errorMsg = event.error ? safeStringify(event.error) : event.message;
    void logger.error(`Unhandled window error: ${errorMsg}`, 'GlobalError');
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reasonMsg = safeStringify(event.reason);
    void logger.error(`Unhandled promise rejection: ${reasonMsg}`, 'GlobalPromise');
  });
}
