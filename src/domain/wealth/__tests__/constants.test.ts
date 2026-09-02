import { describe, it, expect } from 'vitest';
import { CATEGORY_TABS, PRICE_THRESHOLDS } from '../constants';

describe('Wealth Constants', () => {
  describe('CATEGORY_TABS', () => {
    it('should include ALL and specific stash categories', () => {
      expect(Array.isArray(CATEGORY_TABS)).toBe(true);
      expect(CATEGORY_TABS.length).toBeGreaterThan(0);
      expect(CATEGORY_TABS[0].key).toBe('ALL');

      const keys = CATEGORY_TABS.map(tab => tab.key);
      expect(keys).toContain('Currency');
      expect(keys).toContain('Fragment');
      expect(keys).toContain('DivCard');
      expect(keys).toContain('Essence');
      expect(keys).toContain('Scarab');
      expect(keys).toContain('Map');
      expect(keys).toContain('Equipment');
    });

    it('should have valid non-empty labels for all category tabs', () => {
      for (const tab of CATEGORY_TABS) {
        expect(tab.label).toBeTypeOf('string');
        expect(tab.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PRICE_THRESHOLDS', () => {
    it('should include 0c baseline and higher thresholds in ascending order', () => {
      expect(Array.isArray(PRICE_THRESHOLDS)).toBe(true);
      expect(PRICE_THRESHOLDS.length).toBeGreaterThan(0);
      expect(PRICE_THRESHOLDS[0].value).toBe(0);

      for (let i = 1; i < PRICE_THRESHOLDS.length; i++) {
        expect(PRICE_THRESHOLDS[i].value).toBeGreaterThan(PRICE_THRESHOLDS[i - 1].value);
      }
    });

    it('should have descriptive labels for all thresholds', () => {
      for (const th of PRICE_THRESHOLDS) {
        expect(th.label).toBeTypeOf('string');
        expect(th.label.length).toBeGreaterThan(0);
      }
    });
  });
});
