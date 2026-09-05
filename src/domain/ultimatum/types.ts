export type WeaknessTag =
  | 'chaos_res'
  | 'recovery'
  | 'flask'
  | 'movement'
  | 'phys'
  | 'bleed'
  | 'cooldown'
  | 'mana'
  | 'crit'
  | 'ruin';

export interface UltimatumMod {
  id: string;
  name: string;
  nameZh: string;
  baseRisk: number; // 1 to 10
  tags: WeaknessTag[];
  description: string;
}

export interface ActiveModSelection {
  modId: string;
  tier: 1 | 2 | 3;
}

export interface PlayerWeaknessConfig {
  lowChaosRes?: boolean;
  noLifeRecovery?: boolean;
  reliantOnFlasks?: boolean;
  slowMovement?: boolean;
  noBleedImmunity?: boolean;
  lowPhysMitigation?: boolean;
  reliantOnCooldowns?: boolean;
}

export type UltimatumRecommendation = 'STRONG_CONTINUE' | 'CAUTIOUS_CONTINUE' | 'TAKE_PROFIT';

export interface RoundProjection {
  round: number;
  estimatedRewardChaos: number;
  cumulativeRewardChaos: number;
  survivalProbability: number;
  expectedCumulativeValueChaos: number;
}

export interface UltimatumEvAnalysis {
  currentRound: number;
  accumulatedRewardChaos: number;
  nextRoundRewardEstimateChaos: number;
  nextRoundSuccessProbability: number;
  totalModRiskScore: number;
  expectedNetGainChaos: number;
  riskRewardRatio: number;
  recommendation: UltimatumRecommendation;
  recommendationText: string;
  lethalWarnings: string[];
  projection: RoundProjection[];
}
