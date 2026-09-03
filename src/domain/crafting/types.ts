export type ItemClass =
  | 'body_armour'
  | 'helmet'
  | 'gloves'
  | 'boots'
  | 'weapon_1h'
  | 'weapon_2h_bow'
  | 'shield'
  | 'ring'
  | 'amulet'
  | 'belt';

export type BaseAttributeType = 'str' | 'dex' | 'int' | 'str_dex' | 'str_int' | 'dex_int' | 'none';

export interface CraftBaseItem {
  id: string;
  name: string;
  nameZh: string;
  itemClass: ItemClass;
  defaultIlvl: number;
  attributeType: BaseAttributeType;
  armour?: number;
  evasion?: number;
  energyShield?: number;
  implicit?: string;
}

export interface CraftModTier {
  tier: number;
  ilvl: number;
  weight: number;
  statText: string;
  statTextZh: string;
  minValue?: number;
  maxValue?: number;
}

export interface CraftMod {
  id: string;
  name: string;
  nameZh: string;
  group: string;
  type: 'prefix' | 'suffix';
  tags: string[];
  applicableClasses: ItemClass[];
  requiresAttribute?: 'str' | 'dex' | 'int';
  tiers: CraftModTier[];
}

export interface TargetModSelection {
  modId: string;
  maxTier: number; // 1 means only T1, 2 means T1 or T2, etc.
}

export type CraftingMethodType = 'essence' | 'fossil' | 'harvest' | 'chaos';

export interface EssenceDefinition {
  id: string;
  name: string;
  nameZh: string;
  guaranteedGroup: string;
  guaranteedTier: number;
  defaultPriceChaos: number;
  icon: string;
}

export interface FossilDefinition {
  id: string;
  name: string;
  nameZh: string;
  positiveTags: string[];
  positiveMultiplier: number;
  blockedTags: string[];
  defaultPriceChaos: number;
  icon: string;
}

export interface MethodEvaluation {
  method: CraftingMethodType;
  title: string;
  subtitle: string;
  details?: string;
  successProbability: number;
  averageAttempts: number;
  costPerAttemptChaos: number;
  totalExpectedCostChaos: number;
  totalExpectedCostDivine: number;
  confidence95Attempts: number;
  confidence95CostChaos: number;
  confidence95CostDivine: number;
  fossilCombo?: string[];
  essenceUsed?: string;
  isRecommended?: boolean;
}

export interface CraftActuaryResult {
  evaluations: MethodEvaluation[];
  recommendedMethod: MethodEvaluation;
  totalPoolModsCount: number;
  activeTargetModsCount: number;
}

export interface RolledAffix {
  modId: string;
  name: string;
  nameZh: string;
  type: 'prefix' | 'suffix';
  tier: number;
  text: string;
  isTargetHit: boolean;
}

export interface SimulatedItem {
  baseItem: CraftBaseItem;
  ilvl: number;
  prefixes: RolledAffix[];
  suffixes: RolledAffix[];
  hitAllTargets: boolean;
  attemptCount: number;
  totalSpentChaos: number;
}

export interface CraftPreset {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  baseItemId: string;
  ilvl: number;
  targetMods: TargetModSelection[];
}
