import { describe, it, expect } from 'vitest';
import { forecastWaystoneRolling } from '../waystoneRollingForecaster';
import type { WaystoneRollingCriteria } from '../types';

describe('waystoneRollingForecaster', () => {
  const lenientCriteria: WaystoneRollingCriteria = {
    maxAcceptableRisk: 'warning',
    minItemQuantity: 50,
    forbiddenModIds: []
  };

  const strictCriteria: WaystoneRollingCriteria = {
    maxAcceptableRisk: 'caution',
    minItemQuantity: 75,
    forbiddenModIds: ['ele_penetration', 'cannot_leech', 'extra_chaos']
  };

  it('calculates alch_scour strategy forecast with positive attempts and cost', () => {
    const result = forecastWaystoneRolling('alch_scour', lenientCriteria);
    expect(result.strategy).toBe('alch_scour');
    expect(result.successRatePercent).toBeGreaterThan(10);
    expect(result.expectedAttempts).toBeGreaterThan(0);
    expect(result.attempts95Percentile).toBeGreaterThanOrEqual(result.expectedAttempts);
    expect(result.costEstimates.alchemy).toBeGreaterThan(0);
    expect(result.costEstimates.scouring).toBeGreaterThanOrEqual(0);
    expect(result.costEstimates.goldEquivalent).toBeGreaterThan(0);
  });

  it('calculates chaos_spam strategy with chaos cost estimates', () => {
    const result = forecastWaystoneRolling('chaos_spam', lenientCriteria);
    expect(result.strategy).toBe('chaos_spam');
    expect(result.costEstimates.chaos).toBeGreaterThan(0);
    expect(result.costEstimates.alchemy).toBe(1);
    expect(result.costEstimates.goldEquivalent).toBeGreaterThan(result.costEstimates.chaos * 1000);
  });

  it('calculates transmute_aug_regal strategy with multi-currency breakdown', () => {
    const result = forecastWaystoneRolling('transmute_aug_regal', lenientCriteria);
    expect(result.strategy).toBe('transmute_aug_regal');
    expect(result.costEstimates.transmutation).toBeGreaterThan(0);
    expect(result.costEstimates.regal).toBeGreaterThan(0);
  });

  it('warns when using transmute_aug_regal with high quantity target', () => {
    const highQuantCriteria: WaystoneRollingCriteria = {
      ...lenientCriteria,
      minItemQuantity: 75
    };
    const result = forecastWaystoneRolling('transmute_aug_regal', highQuantCriteria);
    expect(result.recommendation).toContain('藍圖增幅策略難以達到');
  });

  it('produces higher expected attempts for strict criteria compared to lenient criteria', () => {
    const lenient = forecastWaystoneRolling('alch_scour', lenientCriteria);
    const strict = forecastWaystoneRolling('alch_scour', strictCriteria);
    expect(strict.expectedAttempts).toBeGreaterThan(lenient.expectedAttempts);
    expect(strict.successRatePercent).toBeLessThan(lenient.successRatePercent);
  });
});
