import { describe, it, expect } from 'vitest';
import { generateMapRegex } from '../regexGenerator';

describe('Map Regex Generator', () => {
  it('should generate quantity regex correctly for English and Chinese', () => {
    const resEn = generateMapRegex({
      minQuantity: 80,
      excludeModIds: [],
      language: 'en'
    });
    expect(resEn.regexString).toContain('m q.*([8-9]\\d|\\d{3})');
    expect(resEn.length).toBeLessThanOrEqual(50);
    expect(resEn.isWithinLimit).toBe(true);

    const resZh = generateMapRegex({
      minQuantity: 80,
      excludeModIds: [],
      language: 'zh'
    });
    expect(resZh.regexString).toContain('量.*([8-9]\\d|\\d{3})');
    expect(resZh.isWithinLimit).toBe(true);
  });

  it('should generate pack size and quality regex correctly', () => {
    const res = generateMapRegex({
      minPackSize: 25,
      minQuality: 20,
      excludeModIds: [],
      language: 'en'
    });
    expect(res.regexString).toContain('m s.*(2[5-9]|[3-9]\\d)');
    expect(res.regexString).toContain('quality:.*20');
    expect(res.isWithinLimit).toBe(true);
  });

  it('should generate compact negative regex for excluded mods', () => {
    const resEn = generateMapRegex({
      excludeModIds: ['ele_reflect', 'phys_reflect'],
      language: 'en'
    });
    expect(resEn.regexString).toBe('!"ele.*ref|phys.*ref"');
    expect(resEn.length).toBeLessThan(50);
    expect(resEn.isWithinLimit).toBe(true);

    const resZh = generateMapRegex({
      excludeModIds: ['ele_reflect', 'no_regen'],
      language: 'zh'
    });
    expect(resZh.regexString).toBe('!"反.*元|無法回復"');
    expect(resZh.isWithinLimit).toBe(true);
  });

  it('should combine quantity and multiple exclusions compactly', () => {
    const res = generateMapRegex({
      minQuantity: 80,
      excludeModIds: ['ele_reflect', 'no_regen', 'minus_max_res'],
      language: 'zh'
    });
    expect(res.regexString).toContain('量.*([8-9]\\d|\\d{3})');
    expect(res.regexString).toContain('!"反.*元|無法回復|大抗"');
    expect(res.length).toBeLessThanOrEqual(50);
    expect(res.isWithinLimit).toBe(true);
  });

  it('should handle custom exclude regex safely and track character limits', () => {
    const res = generateMapRegex({
      excludeModIds: ['ele_reflect'],
      customExcludeRegex: 'temp|chain',
      language: 'en'
    });
    expect(res.regexString).toContain('ele.*ref');
    expect(res.regexString).toContain('temp|chain');
    expect(res.length).toBe(res.regexString.length);
  });
});
