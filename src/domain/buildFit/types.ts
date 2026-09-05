export type BuildFitRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface AffixWeightRule {
  id: string;
  name: string;
  pattern: RegExp;
  weight: number;
  isPercentage?: boolean;
  maxCap?: number;
}

export interface BuildScoreThresholds {
  s: number;
  a: number;
  b: number;
  c: number;
}

export interface BuildPreset {
  id: string;
  name: string;
  archetype: 'life_fire_rf' | 'poison_chaos_dot' | 'ele_bow_crit' | 'pure_phys_cyclone' | 'custom';
  description: string;
  rules: AffixWeightRule[];
  scoreThresholds: BuildScoreThresholds;
}

export interface AffixMatchResult {
  modText: string;
  ruleId: string;
  ruleName: string;
  extractedValue: number;
  score: number;
}

export interface BuildFitEvaluation {
  presetId: string;
  presetName: string;
  totalScore: number;
  rank: BuildFitRank;
  matches: AffixMatchResult[];
  primaryHighlights: string[];
  advice: string;
}
