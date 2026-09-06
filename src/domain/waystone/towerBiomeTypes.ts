export type PoE2BiomeType = 'desert' | 'jungle' | 'tundra' | 'volcanic' | 'ruins' | 'swamp';

export type PoE2FarmingGoal = 'gold' | 'currency' | 'waystones' | 'runes' | 'mechanics' | 'boss';

export type PrecursorTabletCategory =
  | 'economic'
  | 'density'
  | 'progression'
  | 'endgame_mechanic'
  | 'boss';

export interface PrecursorTabletBonuses {
  packSize?: number;
  quantity?: number;
  rarity?: number;
  goldMultiplier?: number;
  waystoneChance?: number;
  runeChance?: number;
  bossLootMultiplier?: number;
  mechanicType?: string;
  mechanicChance?: number;
}

export interface PrecursorTabletDefinition {
  id: string;
  nameZh: string;
  nameEn: string;
  category: PrecursorTabletCategory;
  tierRequirement?: number;
  descriptionZh: string;
  descriptionEn: string;
  bonuses: PrecursorTabletBonuses;
}

export interface BiomeDefinition {
  id: PoE2BiomeType;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn?: string;
  inherentBonusDescZh: string;
  bestGoals: PoE2FarmingGoal[];
  nativeMultiplier: {
    gold: number;
    waystones: number;
    runes: number;
    currency: number;
    packSize: number;
  };
  recommendedTierRange: [number, number];
}

export interface TowerSlotConfig {
  id: string;
  name: string;
  active: boolean;
  socketedTabletIds: string[];
}

export interface TowerSynergyResult {
  activeTowerCount: number;
  resonanceMultiplier: number;
  totalPackSizeBonus: number;
  totalQuantityBonus: number;
  totalRarityBonus: number;
  totalGoldMultiplier: number;
  totalWaystoneChanceBonus: number;
  totalRuneChanceBonus: number;
  totalBossLootMultiplier: number;
  activeMechanics: Array<{ mechanicType: string; totalChance: number }>;
}

export interface BiomeOptimizationRecommendation {
  biome: BiomeDefinition;
  goal: PoE2FarmingGoal;
  recommendedTabletIds: string[];
  recommendedWaystoneAffixesZh: string[];
  expectedSynergyScore: number; // 0 to 100
  strategicAdviceZh: string;
  estimatedYieldSummary: {
    goldRating: number; // 1 to 5
    currencyRating: number; // 1 to 5
    progressionRating: number; // 1 to 5
  };
}
