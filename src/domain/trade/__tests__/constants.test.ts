import { describe, it, expect } from 'vitest';
import { COMMON_STAT_PRESETS } from '../constants';

describe('Trade Constants (COMMON_STAT_PRESETS)', () => {
  it('should export a non-empty array of stat presets', () => {
    expect(COMMON_STAT_PRESETS).toBeDefined();
    expect(Array.isArray(COMMON_STAT_PRESETS)).toBe(true);
    expect(COMMON_STAT_PRESETS.length).toBeGreaterThan(0);
  });

  it('should contain valid presets with text, englishText, and positive defaultValue', () => {
    for (const preset of COMMON_STAT_PRESETS) {
      expect(preset.text).toBeTypeOf('string');
      expect(preset.text.length).toBeGreaterThan(0);
      expect(preset.englishText).toBeTypeOf('string');
      expect(preset.englishText.length).toBeGreaterThan(0);
      expect(preset.defaultValue).toBeTypeOf('number');
      expect(preset.defaultValue).toBeGreaterThan(0);
    }
  });

  it('should include common life and resistance presets', () => {
    const texts = COMMON_STAT_PRESETS.map(p => p.text);
    expect(texts).toContain('+# 最大生命');
    expect(texts).toContain('+#% 全部元素抗性');
    expect(texts).toContain('+#% 火焰抗性');
  });
});
