export type ExpeditionNpc = 'tujen' | 'dannig' | 'rog' | 'gwennen';

export type FactionType = 'black_scythe' | 'sun' | 'order' | 'chalice';

export interface TujenHaggleAdvice {
  askingPrice: number;
  firstOfferSafe: number;
  firstOfferAggressive: number;
  secondCounterOffer: number;
  estimatedSavings: number;
  savingsPercent: number;
  tipZh: string;
}

export interface DannigArbitrageResult {
  convertedCount: number;
  netProfitChaos: number;
}

export type RemnantType = 'reward' | 'quantity' | 'danger';

export interface LogbookRemnant {
  id: string;
  nameZh: string;
  nameEn: string;
  type: RemnantType;
  logbookDropMultiplier: number;
  runicMonsterMultiplier: number;
  isDeadly: boolean;
  descriptionZh: string;
}

export type LogbookRecommendation = 'run' | 'warning_deadly' | 'reroll_placement';

export interface LogbookCalculation {
  selectedFaction: FactionType;
  areaLevel: number;
  selectedRemnantIds: string[];
  logbookCostChaos: number;
  totalRunicMonsterBonus: number;
  totalQuantityBonus: number;
  hasDeadlyAffixes: boolean;
  deadlyRemnantNames: string[];
  estimatedArtifactsTotal: number;
  estimatedGrossChaos: number;
  netProfitChaos: number;
  recommendation: LogbookRecommendation;
}
