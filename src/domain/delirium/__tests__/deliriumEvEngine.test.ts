import { describe, it, expect } from 'vitest';
import { simulateDeliriumEv } from '../deliriumEvEngine';
import type { DeliriumSimulationInput } from '../types';

describe('deliriumEvEngine', () => {
  it('simulates Delirium Mirror (0% orb) with 0 cost and positive net gain', () => {
    const input: DeliriumSimulationInput = {
      deliriumPercent: 0,
      rewardType: 'currency',
      mapTier: 16,
      monsterPackCount: 800,
      orbCostChaos: 35,
      splinterPriceChaos: 0.75,
      divineRate: 150
    };

    const result = simulateDeliriumEv(input);
    expect(result.deliriumPercent).toBe(0);
    expect(result.totalCostChaos).toBe(0);
    expect(result.achievableTiers).toBeGreaterThanOrEqual(5);
    expect(result.splinterDropAvg).toBeGreaterThan(15);
    expect(result.netProfitChaos).toBeGreaterThan(0);
    expect(result.monsterDamageReductionPercent).toBe(0);
    expect(result.recommendation).toBe('HIGHLY_PROFITABLE');
  });

  it('accurately calculates 100% Delirium (5 orbs) with heavy damage reduction and splinter scaling', () => {
    const input: DeliriumSimulationInput = {
      deliriumPercent: 100,
      rewardType: 'scarabs',
      mapTier: 16,
      monsterPackCount: 1200,
      orbCostChaos: 30,
      splinterPriceChaos: 0.8,
      divineRate: 150
    };

    const result = simulateDeliriumEv(input);
    expect(result.totalCostChaos).toBe(150); // 5 * 30C
    expect(result.monsterDamageReductionPercent).toBe(96);
    expect(result.achievableTiers).toBeGreaterThanOrEqual(7);
    expect(result.splinterDropAvg).toBeGreaterThanOrEqual(80);
    expect(result.tierBreakdown).toHaveLength(result.achievableTiers);
  });

  it('recommends HIGH_RISK_LOSS when orb cost is exorbitant and monster pack density is too low', () => {
    const input: DeliriumSimulationInput = {
      deliriumPercent: 100,
      rewardType: 'generic',
      mapTier: 11,
      monsterPackCount: 200, // very low kills
      orbCostChaos: 80, // huge cost = 400C
      splinterPriceChaos: 0.5,
      divineRate: 150
    };

    const result = simulateDeliriumEv(input);
    expect(result.totalCostChaos).toBe(400);
    expect(result.netProfitChaos).toBeLessThan(0);
    expect(result.recommendation).toBe('HIGH_RISK_LOSS');
    expect(result.recommendationText).toContain('虧損');
  });
});
