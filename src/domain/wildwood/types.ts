export type WildwoodAscendancyClass = 'warden' | 'warlock' | 'primalist';

export type WildwoodTier = 'S' | 'A' | 'B' | 'C';

export interface WildwoodMajorNode {
  id: string;
  nameZh: string;
  nameEn: string;
  ascendancy: WildwoodAscendancyClass;
  descriptionZh: string;
  descriptionEn: string;
  specialFlag?: string;
  stats?: Record<string, number>;
}

export interface CharmAffixDef {
  id: string;
  nameZh: string;
  nameEn: string;
  archetypeZh: string;
  minRoll: number;
  maxRoll: number;
  statKey: string;
  descriptionZh: string;
}

export interface CharmSlotInput {
  slotIndex: number;
  affix1Id?: string;
  affix1Roll?: number;
  affix2Id?: string;
  affix2Roll?: number;
}

export interface WildwoodConfig {
  ascendancy: WildwoodAscendancyClass;
  allocatedNodeIds: string[];
  charms: CharmSlotInput[];
}

export interface WildwoodEvaluationResult {
  ascendancy: WildwoodAscendancyClass;
  aggregateStats: Record<string, number>;
  specialFlags: string[];
  fitScore: number;
  fitTier: WildwoodTier;
  recommendations: string[];
}
