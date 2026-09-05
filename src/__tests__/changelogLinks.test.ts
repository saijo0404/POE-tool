import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('CHANGELOG.md link validation', () => {
  const changelogPath = path.resolve(__dirname, '../../CHANGELOG.md');
  const content = fs.readFileSync(changelogPath, 'utf-8');

  it('should include link definition for [3.1.0]', () => {
    expect(content).toMatch(/\[3\.1\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v3\.0\.0\.\.\.v3\.1\.0/);
  });

  it('should include link definition for [3.0.0]', () => {
    expect(content).toMatch(/\[3\.0\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.12\.0\.\.\.v3\.0\.0/);
  });

  it('should include link definition for [2.12.0]', () => {
    expect(content).toMatch(/\[2\.12\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.11\.0\.\.\.v2\.12\.0/);
  });

  it('should include link definition for [2.11.0]', () => {
    expect(content).toMatch(/\[2\.11\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.10\.0\.\.\.v2\.11\.0/);
  });

  it('should include link definition for [2.10.0]', () => {
    expect(content).toMatch(/\[2\.10\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.9\.0\.\.\.v2\.10\.0/);
  });

  it('should include link definition for [2.9.0]', () => {
    expect(content).toMatch(/\[2\.9\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.8\.0\.\.\.v2\.9\.0/);
  });

  it('should include link definition for [2.8.0]', () => {
    expect(content).toMatch(/\[2\.8\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.7\.0\.\.\.v2\.8\.0/);
  });

  it('should include link definition for [2.7.0]', () => {
    expect(content).toMatch(/\[2\.7\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.6\.0\.\.\.v2\.7\.0/);
  });

  it('should include link definition for [2.6.0]', () => {
    expect(content).toMatch(/\[2\.6\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.5\.0\.\.\.v2\.6\.0/);
  });

  it('should include link definition for [2.5.0]', () => {
    expect(content).toMatch(/\[2\.5\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.4\.0\.\.\.v2\.5\.0/);
  });

  it('should include link definition for [2.4.0]', () => {
    expect(content).toMatch(/\[2\.4\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.3\.0\.\.\.v2\.4\.0/);
  });

  it('should include link definition for [2.3.0]', () => {
    expect(content).toMatch(/\[2\.3\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.2\.0\.\.\.v2\.3\.0/);
  });

  it('should include link definition for [2.2.0]', () => {
    expect(content).toMatch(/\[2\.2\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.1\.0\.\.\.v2\.2\.0/);
  });

  it('should include link definition for [2.1.0]', () => {
    expect(content).toMatch(/\[2\.1\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v2\.0\.0\.\.\.v2\.1\.0/);
  });

  it('should include link definition for [2.0.0]', () => {
    expect(content).toMatch(/\[2\.0\.0\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v1\.5\.0\.\.\.v2\.0\.0/);
  });

  it('should point [Unreleased] to compare from v3.1.0 to HEAD', () => {
    expect(content).toMatch(/\[Unreleased\]:\s*https:\/\/github\.com\/saijo0404\/POE-tool\/compare\/v3\.1\.0\.\.\.HEAD/);
  });
});
