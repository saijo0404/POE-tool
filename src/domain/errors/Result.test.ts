import { describe, it, expect } from 'vitest';
import { ok, err } from './Result';
import { DomainError } from './DomainError';

describe('Result Pattern', () => {
  it('handles Ok value correctly', () => {
    const res = ok<number>(42);
    expect(res.isOk()).toBe(true);
    expect(res.isErr()).toBe(false);
    expect(res.unwrap()).toBe(42);
    expect(res.unwrapOr(0)).toBe(42);

    const mapped = res.map(n => n * 2);
    expect(mapped.unwrap()).toBe(84);

    const flatMapped = res.flatMap(n => ok(`Val: ${n}`));
    expect(flatMapped.unwrap()).toBe('Val: 42');
  });

  it('handles Err value correctly', () => {
    const domainErr = DomainError.validation('Bad request');
    const res = err<number>(domainErr);

    expect(res.isOk()).toBe(false);
    expect(res.isErr()).toBe(true);
    expect(res.unwrapOr(100)).toBe(100);

    expect(() => res.unwrap()).toThrow('Bad request');

    const mapped = res.map(n => n * 2);
    expect(mapped.isErr()).toBe(true);

    const flatMapped = res.flatMap(n => ok(`Val: ${n}`));
    expect(flatMapped.isErr()).toBe(true);
  });
});
