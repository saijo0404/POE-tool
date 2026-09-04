import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('CHANGELOG.md link validation', () => {
  const changelogPath = path.resolve(__dirname, '../../CHANGELOG.md');
  const content = fs.readFileSync(changelogPath, 'utf-8');

  it('should include link definition for [2.0.0]', () => {
    expect(content).toMatch(/\[2\.0\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v1\.5\.0\.\.\.v2\.0\.0/);
  });

  it('should point [Unreleased] to compare from v2.0.0 to HEAD', () => {
    expect(content).toMatch(/\[Unreleased\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.0\.0\.\.\.HEAD/);
  });
});
