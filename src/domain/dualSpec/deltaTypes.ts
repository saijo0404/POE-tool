import type { WeaponSet } from './types';

export interface StatDeltaMetric {
  set1Value: number;
  set2Value: number;
  delta: number;
  percentChange: number;
}

export interface AggregatedWeaponStats {
  physicalDps: number;
  elementalDps: number;
  totalDps: number;
  attacksPerSecond: number;
  critChance: number;
  spirit: number;
  isDualWield: boolean;
  hasShield: boolean;
}

export interface WeaponSetDeltaReport {
  set1Stats: AggregatedWeaponStats;
  set2Stats: AggregatedWeaponStats;
  deltas: {
    physicalDps: StatDeltaMetric;
    elementalDps: StatDeltaMetric;
    totalDps: StatDeltaMetric;
    attacksPerSecond: StatDeltaMetric;
    critChance: StatDeltaMetric;
    spirit: StatDeltaMetric;
  };
  summary: string[];
}

export type ComboStatusEffect =
  | 'Freeze'
  | 'Shock'
  | 'Ignite'
  | 'Bleed'
  | 'Stun'
  | 'ArmourBreak'
  | 'Oil'
  | 'Vulnerability';

export interface ComboStep {
  skillId: string;
  skillName: string;
  weaponSet: WeaponSet;
  appliedEffect?: ComboStatusEffect;
  consumesEffect?: ComboStatusEffect;
}

export interface ComboSynergyReport {
  steps: ComboStep[];
  synergyScore: number;
  crossWeaponSwaps: number;
  comboMultiplier: number;
  synergiesTriggered: string[];
}

export type ScenarioType = 'clearing' | 'bossing' | 'balanced';

export interface ScenarioWeightConfig {
  dpsWeight: number;
  speedWeight: number;
  critWeight: number;
  defenseWeight: number;
  synergyWeight: number;
}

export type ScenarioGrade = 'S' | 'A' | 'B' | 'C';

export interface ScenarioScoreReport {
  scenario: ScenarioType;
  score: number;
  grade: ScenarioGrade;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}
