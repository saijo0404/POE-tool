import type { ModType } from '../item/types';

export type AffixClassification = 'prefix' | 'suffix' | 'implicit' | 'unknown';

export interface EvaluatedAffix {
  id: string;
  text: string;
  englishText: string;
  classification: AffixClassification;
  type: ModType;
  tier?: number;
  tierLabel?: string;
  modGroup?: string;
  score: number;
}

export interface CraftingSpaces {
  totalPrefixes: number;
  totalSuffixes: number;
  maxPrefixes: number;
  maxSuffixes: number;
  openPrefixes: number;
  openSuffixes: number;
  hasCraftedMod: boolean;
  hasFracturedMod: boolean;
  canCraftBenchMod: boolean;
  canMultiMod: boolean;
  canPrefixesCannotBeChanged: boolean;
  canSuffixesCannotBeChanged: boolean;
}

export type PotentialGrade = 'S' | 'A' | 'B' | 'C';

export interface GearPotentialReport {
  score: number;
  grade: PotentialGrade;
  isHighValueBase: boolean;
  recommendations: string[];
  spaces: CraftingSpaces;
  prefixes: EvaluatedAffix[];
  suffixes: EvaluatedAffix[];
  implicits: EvaluatedAffix[];
}
