export type DeliriumPercent = 0 | 20 | 40 | 60 | 80 | 100;

export type DeliriumRewardType =
  | 'currency'
  | 'scarabs'
  | 'divination'
  | 'fossils'
  | 'essences'
  | 'generic';

export interface DeliriumSimulationInput {
  deliriumPercent: DeliriumPercent;
  rewardType: DeliriumRewardType;
  mapTier?: number;
  monsterPackCount: number;
  orbCostChaos?: number;
  splinterPriceChaos?: number;
  divineRate?: number;
}

export interface DeliriumTierBreakdown {
  tier: number;
  requiredKills: number;
  estimatedValueChaos: number;
}

export type DeliriumRecommendation =
  | 'HIGHLY_PROFITABLE'
  | 'MODERATE_PROFIT'
  | 'HIGH_RISK_LOSS';

export interface DeliriumSimulationResult {
  deliriumPercent: DeliriumPercent;
  achievableTiers: number;
  monsterDamageReductionPercent: number;
  splinterDropMin: number;
  splinterDropMax: number;
  splinterDropAvg: number;
  splinterRevenueChaos: number;
  rewardsRevenueChaos: number;
  totalRevenueChaos: number;
  totalCostChaos: number;
  netProfitChaos: number;
  roiPercent: number;
  recommendation: DeliriumRecommendation;
  recommendationText: string;
  tierBreakdown: DeliriumTierBreakdown[];
}
