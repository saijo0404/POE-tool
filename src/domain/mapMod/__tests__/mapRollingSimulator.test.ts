import { describe, it, expect } from 'vitest';
import {
  estimateRollPassProbability,
  simulateMapRolling,
  compareRollingStrategies,
  type MapRollingConfig
} from '../mapRollingSimulator';

describe('mapRollingSimulator', () => {
  describe('estimateRollPassProbability', () => {
    it('returns high pass rate for unconstrained rolling', () => {
      const p = estimateRollPassProbability({
        forbiddenModsCount: 0,
        minQuantityPercent: 0,
        minPackSizePercent: 0
      });
      expect(p).toBeGreaterThan(0.9);
      expect(p).toBeLessThanOrEqual(1.0);
    });

    it('reduces pass rate when forbidden mods increase', () => {
      const p0 = estimateRollPassProbability({ forbiddenModsCount: 0 });
      const p3 = estimateRollPassProbability({ forbiddenModsCount: 3 });
      const p8 = estimateRollPassProbability({ forbiddenModsCount: 8 });

      expect(p3).toBeLessThan(p0);
      expect(p8).toBeLessThan(p3);
    });

    it('reduces pass rate when target quantity and pack size are high', () => {
      const pBase = estimateRollPassProbability({ forbiddenModsCount: 2, minQuantityPercent: 60 });
      const pStrict = estimateRollPassProbability({ forbiddenModsCount: 2, minQuantityPercent: 90, minPackSizePercent: 30 });

      expect(pStrict).toBeLessThan(pBase);
      expect(pStrict).toBeGreaterThan(0);
    });
  });

  describe('simulateMapRolling', () => {
    const config: MapRollingConfig = {
      forbiddenModsCount: 3,
      minQuantityPercent: 75,
      minPackSizePercent: 22,
      mapCount: 1,
      strategy: 'scour_alch'
    };

    it('calculates expected attempts and 95% confidence bounds correctly for scour_alch', () => {
      const result = simulateMapRolling(config);

      expect(result.strategy).toBe('scour_alch');
      expect(result.costPerRollChaos).toBe(1.5);
      expect(result.successProbability).toBeGreaterThan(0);
      expect(result.expectedAttempts).toBeGreaterThanOrEqual(1);
      expect(result.confidence95Attempts).toBeGreaterThanOrEqual(result.expectedAttempts);
      expect(result.expectedCostChaos).toBe(
        Math.round(result.expectedAttempts * result.costPerRollChaos * 10) / 10
      );
    });

    it('calculates chaos_spam cost correctly', () => {
      const result = simulateMapRolling({ ...config, strategy: 'chaos_spam' });
      expect(result.strategy).toBe('chaos_spam');
      expect(result.costPerRollChaos).toBe(1.0);
      expect(result.expectedCostChaos).toBe(
        Math.round(result.expectedAttempts * 1.0 * 10) / 10
      );
    });

    it('scales costs for batch of 50 maps', () => {
      const single = simulateMapRolling({ ...config, mapCount: 1 });
      const batch50 = simulateMapRolling({ ...config, mapCount: 50 });

      expect(batch50.mapCount).toBe(50);
      expect(batch50.totalBatchCostChaos).toBeCloseTo(single.expectedCostChaos * 50, 0);
    });
  });

  describe('compareRollingStrategies', () => {
    it('compares all three strategies and designates one recommended', () => {
      const comparisons = compareRollingStrategies({
        forbiddenModsCount: 3,
        minQuantityPercent: 75,
        minPackSizePercent: 22,
        mapCount: 20
      });

      expect(comparisons.length).toBe(3);
      const recommended = comparisons.find(c => c.isRecommended);
      expect(recommended).toBeDefined();
      expect(recommended?.recommendationReason).toBeTruthy();
    });
  });
});
