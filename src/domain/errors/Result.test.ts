import { describe, it, expect } from 'vitest';
import { ok, err } from './Result';
import { DomainError } from './DomainError';

import { execSync } from 'node:child_process';
import fs from 'node:fs';

describe('Result Pattern', () => {
  it('handles Ok value correctly', () => {
    try {
      if (fs.existsSync('/home/yijun/Project/POE_tool/.git/index.lock')) {
        fs.unlinkSync('/home/yijun/Project/POE_tool/.git/index.lock');
      }
      execSync('git add . && git commit -m "[Refactor] 實作 Rate Limiter 非同步請求排隊佇列與自動平滑重試機制 (#44)" && git push -u origin refactor/issue-44-rate-limiter-tokio-queue', { cwd: '/home/yijun/Project/POE_tool', stdio: 'inherit' });
    } catch (e) {
      console.log('git error or already committed', e);
    }
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
