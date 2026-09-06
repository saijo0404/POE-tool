export type WaystoneTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type WaystoneRiskLevel = 'safe' | 'caution' | 'warning' | 'fatal';

export type WaystoneRarity = 'Normal' | 'Magic' | 'Rare' | 'Unique';

export type WaystoneModCategory =
  | 'monster_damage'
  | 'monster_defense'
  | 'player_debuff'
  | 'environmental'
  | 'boss_mechanic'
  | 'reward';

export interface WaystoneModDefinition {
  id: string;
  nameZh: string;
  nameEn: string;
  category: WaystoneModCategory;
  baseRisk: WaystoneRiskLevel;
  descriptionZh: string;
  descriptionEn: string;
  matchPatternsZh: string[];
  matchPatternsEn: string[];
  targetedDefense?: 'fire' | 'cold' | 'lightning' | 'chaos' | 'leech' | 'regen' | 'armor' | 'evasion';
}

export interface PlayerDefensiveProfile {
  fireRes: number;
  coldRes: number;
  lightningRes: number;
  chaosRes: number;
  lifePool: number;
  energyShield: number;
  primaryDefense: 'armor' | 'evasion' | 'energy_shield' | 'hybrid';
  recoveryMechanism: 'leech' | 'regen' | 'recoup' | 'recharge' | 'none';
  spellSuppression: number;
}

export interface MatchedWaystoneMod {
  definition: WaystoneModDefinition;
  rawText: string;
  adjustedRisk: WaystoneRiskLevel;
  riskReason?: string;
}

export interface WaystoneEvaluation {
  isWaystone: boolean;
  tier: WaystoneTier;
  rarity: WaystoneRarity;
  itemQuantity: number;
  itemRarity: number;
  waystoneDropChance: number;
  mods: MatchedWaystoneMod[];
  safetyScore: number; // 0 to 100
  overallRiskLevel: WaystoneRiskLevel;
  fatalCount: number;
  warningCount: number;
  suggestions: string[];
}

export type WaystoneRollingStrategy = 'alch_scour' | 'transmute_aug_regal' | 'chaos_spam';

export interface WaystoneRollingCriteria {
  maxAcceptableRisk: WaystoneRiskLevel;
  minItemQuantity: number;
  forbiddenModIds: string[];
}

export interface WaystoneRollingForecast {
  strategy: WaystoneRollingStrategy;
  successRatePercent: number;
  expectedAttempts: number;
  attempts95Percentile: number;
  costEstimates: {
    transmutation: number;
    augmentation: number;
    regal: number;
    alchemy: number;
    scouring: number;
    chaos: number;
    goldEquivalent: number;
  };
  recommendation: string;
}
