export type BeastFamily = 'The Wilds' | 'The Sands' | 'The Caverns' | 'The Deep';

export type BeastGenus = 'Craicic' | 'Fenumal' | 'Farric' | 'Saqawine';

export type BeastCraftCategory =
  | 'imprint_split'
  | 'modifier_manipulation'
  | 'corruption_quality'
  | 'unique_item'
  | 'flask_utility';

export interface BeastInfo {
  id: string;
  nameZh: string;
  nameEn: string;
  family: BeastFamily;
  genus: BeastGenus;
  minLevel: number;
  defaultMarketChaos: number;
  rarity: 'Red' | 'Yellow';
}

export interface BeastCraftRecipe {
  id: string;
  nameZh: string;
  nameEn: string;
  category: BeastCraftCategory;
  primaryBeastId: string;
  primaryBeastNameZh: string;
  primaryBeastNameEn: string;
  yellowBeastCount: number;
  outputDescriptionZh: string;
  defaultEstimatedOutputChaos: number;
}

export type RoiStatus = 'profitable' | 'marginal' | 'loss';

export interface RecipeCostCalculation {
  recipeId: string;
  recipeNameZh: string;
  primaryBeastCostChaos: number;
  yellowBeastCostChaos: number;
  totalCraftCostChaos: number;
  estimatedOutputChaos: number;
  netProfitChaos: number;
  profitMarginPercent: number;
  roiStatus: RoiStatus;
}

export type MissionTier = 'white' | 'yellow' | 'red';

export interface MissionValuedBeast {
  nameZh: string;
  captureChancePercent: number;
  valueChaos: number;
}

export interface BestiaryMissionResult {
  missionTier: MissionTier;
  redBeastsExpected: number;
  yellowBeastsExpected: number;
  expectedGrossChaos: number;
  netProfitChaos: number;
  topValuedBeasts: MissionValuedBeast[];
}
