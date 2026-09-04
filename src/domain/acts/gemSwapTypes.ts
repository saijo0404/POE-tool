import type { CharacterClass } from './types';

export type GemSwapLevel = 12 | 28 | 38;

export type GemAttribute = 'strength' | 'dexterity' | 'intelligence' | 'hybrid';

export interface GemSwapRecommendation {
  id: string;
  name: string;
  nameEn: string;
  slotType: 'main_skill' | 'support_gem' | 'aura_utility';
  sourceNpc: string; // e.g. "奈莎 (Act 1 任務獎勵/海妖之歌)"
  recommendedColors: string; // e.g. "BBB", "GGB", "RRR"
  primaryAttribute: GemAttribute;
  requiredAttributeValue: number;
  attributeWarning?: string;
  usageTips: string;
}

export interface GemSwapMilestone {
  level: GemSwapLevel;
  title: string;
  characterClass: CharacterClass;
  archetypeName: string;
  gearResistanceTarget: string;
  gems: GemSwapRecommendation[];
  summaryNote: string;
}
