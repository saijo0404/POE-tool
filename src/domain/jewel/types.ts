export type TimelessJewelType =
  | 'glorious_vanity'
  | 'lethal_pride'
  | 'brutal_restraint'
  | 'elegant_hubris'
  | 'militant_faith';

export interface TimelessLeaderDef {
  id: string;
  name: string;
  nameZh: string;
  keystoneName: string;
  keystoneNameZh: string;
  keystoneDescriptionZh: string;
  popularityScore: number;
  synergyBuilds: string[];
  ratingTier: 'S' | 'A' | 'B' | 'C';
  basePriceRangeChaos: [number, number];
}

export interface TimelessJewelDef {
  id: TimelessJewelType;
  name: string;
  nameZh: string;
  factionsZh: string;
  minSeed: number;
  maxSeed: number;
  leaders: TimelessLeaderDef[];
}

export interface TimelessEvaluationResult {
  jewelType: TimelessJewelType;
  jewelNameZh: string;
  leaderId: string;
  leaderNameZh: string;
  seedNumber: number;
  keystoneNameZh: string;
  keystoneDescriptionZh: string;
  popularityScore: number;
  ratingTier: 'S' | 'A' | 'B' | 'C';
  synergyBuilds: string[];
  estimatedPriceRangeChaos: [number, number];
}

export interface ParsedTimelessJewel {
  jewelType?: TimelessJewelType;
  leaderId?: string;
  seedNumber?: number;
}
