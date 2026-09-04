import { describe, it, expect } from 'vitest';
import {
  calculatePercentageChange,
  calculateAbsoluteChange,
  checkPriceAlert,
  formatTrendPercentage,
  isHighVolatility,
  generatePriceSparklinePoints
} from '../trendCalculator';
import type { PriceAlertRule } from '../types';

describe('trendCalculator', () => {
  describe('calculatePercentageChange', () => {
    it('calculates positive percentage change accurately', () => {
      expect(calculatePercentageChange(120, 100)).toBe(20);
    });

    it('calculates negative percentage change accurately', () => {
      expect(calculatePercentageChange(80, 100)).toBe(-20);
    });

    it('handles zero previous value safely without division by zero', () => {
      expect(calculatePercentageChange(100, 0)).toBe(0);
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });
  });

  describe('calculateAbsoluteChange', () => {
    it('calculates difference between current and previous', () => {
      expect(calculateAbsoluteChange(150, 130)).toBe(20);
      expect(calculateAbsoluteChange(90, 100)).toBe(-10);
    });
  });

  describe('formatTrendPercentage', () => {
    it('formats positive numbers with a plus sign', () => {
      expect(formatTrendPercentage(15.24)).toBe('+15.2%');
    });

    it('formats negative numbers with a minus sign', () => {
      expect(formatTrendPercentage(-8.76)).toBe('-8.8%');
    });

    it('formats zero as +0.0%', () => {
      expect(formatTrendPercentage(0)).toBe('+0.0%');
    });
  });

  describe('isHighVolatility', () => {
    it('identifies price movements above default 10% threshold as volatile', () => {
      expect(isHighVolatility(12.5)).toBe(true);
      expect(isHighVolatility(-15.1)).toBe(true);
      expect(isHighVolatility(5.0)).toBe(false);
      expect(isHighVolatility(-3.2)).toBe(false);
    });

    it('supports custom threshold', () => {
      expect(isHighVolatility(6.0, 5.0)).toBe(true);
      expect(isHighVolatility(4.0, 5.0)).toBe(false);
    });
  });

  describe('checkPriceAlert', () => {
    const baseRule: PriceAlertRule = {
      id: 'rule-1',
      assetName: 'Mageblood',
      condition: 'below',
      currency: 'divine',
      threshold: 120,
      enabled: true,
      createdAt: new Date().toISOString()
    };

    it('triggers when condition is below and current value is less than or equal to threshold', () => {
      expect(checkPriceAlert(baseRule, 18000, 115)).toBe(true);
      expect(checkPriceAlert(baseRule, 18000, 120)).toBe(true);
      expect(checkPriceAlert(baseRule, 18000, 125)).toBe(false);
    });

    it('triggers when condition is above and current value is greater than or equal to threshold', () => {
      const aboveRule: PriceAlertRule = {
        ...baseRule,
        condition: 'above',
        threshold: 150
      };
      expect(checkPriceAlert(aboveRule, 24000, 160)).toBe(true);
      expect(checkPriceAlert(aboveRule, 22500, 150)).toBe(true);
      expect(checkPriceAlert(aboveRule, 20000, 140)).toBe(false);
    });

    it('evaluates chaos currency rules correctly', () => {
      const chaosRule: PriceAlertRule = {
        ...baseRule,
        assetName: 'Divine Orb',
        condition: 'above',
        currency: 'chaos',
        threshold: 220
      };
      expect(checkPriceAlert(chaosRule, 230, 1)).toBe(true);
      expect(checkPriceAlert(chaosRule, 210, 1)).toBe(false);
    });

    it('returns false if rule is disabled', () => {
      const disabledRule: PriceAlertRule = {
        ...baseRule,
        enabled: false
      };
      expect(checkPriceAlert(disabledRule, 15000, 100)).toBe(false);
    });
  });

  describe('generatePriceSparklinePoints', () => {
    it('generates svg polyline points string from numbers', () => {
      const points = [10, 20, 15, 25];
      const result = generatePriceSparklinePoints(points, 100, 40);
      expect(result).toBeTypeOf('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain(',');
    });

    it('handles flat numbers without division by zero', () => {
      const points = [10, 10, 10];
      const result = generatePriceSparklinePoints(points, 100, 40);
      expect(result).toBeTypeOf('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles empty or single-item array', () => {
      expect(generatePriceSparklinePoints([], 100, 40)).toBe('');
      expect(generatePriceSparklinePoints([50], 100, 40)).toBe('0,20 100,20');
    });
  });
});
