export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNAUTHORIZED_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'PARSE_ERROR'
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND_ERROR';

export interface DomainErrorDetails {
  code: ErrorCode;
  message: string;
  cause?: unknown;
  context?: Record<string, unknown>;
}

export class DomainError extends Error {
  public readonly code: ErrorCode;
  public readonly context?: Record<string, unknown>;

  constructor({ code, message, cause, context }: DomainErrorDetails) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.context = context;
    if (cause !== undefined) {
      this.cause = cause;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static validation(message: string, context?: Record<string, unknown>): DomainError {
    return new DomainError({ code: 'VALIDATION_ERROR', message, context });
  }

  public static network(message: string, cause?: unknown): DomainError {
    return new DomainError({ code: 'NETWORK_ERROR', message, cause });
  }

  public static rateLimit(message: string, context?: Record<string, unknown>): DomainError {
    return new DomainError({ code: 'RATE_LIMIT_ERROR', message, context });
  }

  public static parse(message: string, context?: Record<string, unknown>): DomainError {
    return new DomainError({ code: 'PARSE_ERROR', message, context });
  }

  public static unauthorized(message: string): DomainError {
    return new DomainError({ code: 'UNAUTHORIZED_ERROR', message });
  }
}
