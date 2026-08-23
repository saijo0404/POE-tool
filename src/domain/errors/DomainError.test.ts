import { describe, it, expect } from 'vitest';
import { DomainError } from './DomainError';

describe('DomainError', () => {
  it('creates validation error with code and message', () => {
    const err = DomainError.validation('Invalid input', { field: 'name' });
    expect(err.name).toBe('DomainError');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid input');
    expect(err.context).toEqual({ field: 'name' });
  });

  it('creates network error with cause', () => {
    const original = new Error('Socket closed');
    const err = DomainError.network('Failed to fetch trade', original);
    expect(err.code).toBe('NETWORK_ERROR');
    expect(err.cause).toBe(original);
  });

  it('creates rateLimit and parse errors properly', () => {
    const rateErr = DomainError.rateLimit('Too many requests', { retryAfter: 60 });
    expect(rateErr.code).toBe('RATE_LIMIT_ERROR');
    expect(rateErr.context?.retryAfter).toBe(60);

    const parseErr = DomainError.parse('Unable to parse item string');
    expect(parseErr.code).toBe('PARSE_ERROR');

    const authErr = DomainError.unauthorized('Session expired');
    expect(authErr.code).toBe('UNAUTHORIZED_ERROR');
  });
});
