export interface ScarabItem {
  id: string;
  nameZh: string;
  nameEn: string;
  category: string;
  unitCostChaos: number;
}

export interface StrategyScarabRequirement {
  scarabId: string;
  quantityPerMap: number;
}

export interface ScarabStockStrategy {
  id: string;
  name: string;
  targetMapRuns: number;
  requirements: StrategyScarabRequirement[];
}

export interface ScarabShortage {
  scarabId: string;
  nameZh: string;
  nameEn: string;
  currentStock: number;
  neededStock: number;
  missingQuantity: number;
  estimatedCostChaos: number;
}

export interface ScarabAuditResult {
  strategyId: string;
  targetMapRuns: number;
  maxPlayableRuns: number;
  bottleneckScarabId?: string;
  completionPct: number;
  shortages: ScarabShortage[];
  totalRestockCostChaos: number;
  totalRestockCostDivine: number;
  bulkWhisperCommand: string;
}
