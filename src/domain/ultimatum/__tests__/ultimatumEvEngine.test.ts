import { describe, it, expect } from 'vitest';
import { calculateUltimatumEv } from '../ultimatumEvEngine';
import type { ActiveModSelection, PlayerWeaknessConfig } from '../types';

describe('ultimatumEvEngine', () => {
  it('recommends STRONG_CONTINUE on early round with low accumulated reward and safe mods', () => {
    const activeMods: ActiveModSelection[] = [
      { modId: 'scorching_ground', tier: 1 }
    ];
    const weaknesses: PlayerWeaknessConfig = {};

    const result = calculateUltimatumEv({
      currentRound: 1,
      accumulatedRewardChaos: 10,
      activeMods,
      playerWeaknesses: weaknesses,
      characterPowerScore: 80
    });

    expect(result.currentRound).toBe(1);
    expect(result.nextRoundSuccessProbability).toBeGreaterThan(0.85);
    expect(result.expectedNetGainChaos).toBeGreaterThan(0);
    expect(result.recommendation).toBe('STRONG_CONTINUE');
    expect(result.lethalWarnings).toHaveLength(0);
  });

  it('detects weakness conflict, adds lethal warnings, and lowers success probability', () => {
    const activeMods: ActiveModSelection[] = [
      { modId: 'blood_offering', tier: 3 }
    ];
    const weaknesses: PlayerWeaknessConfig = {
      noLifeRecovery: true
    };

    const result = calculateUltimatumEv({
      currentRound: 5,
      accumulatedRewardChaos: 150,
      activeMods,
      playerWeaknesses: weaknesses,
      characterPowerScore: 70
    });

    expect(result.lethalWarnings.length).toBeGreaterThanOrEqual(1);
    expect(result.lethalWarnings[0]).toContain('鮮血獻祭');
    expect(result.totalModRiskScore).toBeGreaterThan(15);
  });

  it('recommends TAKE_PROFIT on late round when accumulated reward is very high and EV turns negative or risky', () => {
    const activeMods: ActiveModSelection[] = [
      { modId: 'blood_offering', tier: 3 },
      { modId: 'stalking_ruin', tier: 3 },
      { modId: 'fatal_criticals', tier: 2 }
    ];
    const weaknesses: PlayerWeaknessConfig = {
      noLifeRecovery: true,
      slowMovement: true
    };

    const result = calculateUltimatumEv({
      currentRound: 9,
      accumulatedRewardChaos: 500,
      activeMods,
      playerWeaknesses: weaknesses,
      characterPowerScore: 60
    });

    expect(result.recommendation).toBe('TAKE_PROFIT');
    expect(result.riskRewardRatio).toBeGreaterThan(1.5);
    expect(result.nextRoundSuccessProbability).toBeLessThan(0.65);
  });

  it('correctly calculates 10-round projection with descending cumulative survival rates', () => {
    const result = calculateUltimatumEv({
      currentRound: 1,
      accumulatedRewardChaos: 0,
      activeMods: [],
      playerWeaknesses: {},
      characterPowerScore: 80
    });

    expect(result.projection).toHaveLength(10);
    expect(result.projection[0].round).toBe(1);
    expect(result.projection[9].round).toBe(10);
    expect(result.projection[0].survivalProbability).toBeGreaterThan(result.projection[9].survivalProbability);
    expect(result.projection[9].estimatedRewardChaos).toBe(380);
  });
});
