export type AtlasMechanicCategory =
  | 'all'
  | 'essence'
  | 'ambush'
  | 'harvest'
  | 'expedition'
  | 'legion'
  | 'breach'
  | 'delirium'
  | 'divination'
  | 'boss'
  | 'torment'
  | 'ritual'
  | 'bestiary'
  | 'ultimatum'
  | 'beyond'
  | 'custom';

export interface AtlasTierScarab {
  id: string;
  name: string;
  nameEn?: string;
  count: number;
  customPriceChaos?: number;
  icon?: string;
}

export type ExtraItemCategory = 'craft' | 'map' | 'delirium' | 'currency' | 'fragment' | 'other';

export interface AtlasTierExtraItem {
  id: string;
  name: string;
  nameEn?: string;
  category: ExtraItemCategory;
  count: number;
  unitPriceChaos: number;
  unitPriceDivine?: number;
}

export interface AtlasStrategyTier {
  id: string;
  name: string; // e.g. "入門低配 (Budget)", "進階中配 (Mid)", "極限頂配 (Juiced)" 或自訂分級名稱
  description?: string;
  atlasTreeUrl?: string; // Maxroll / PoePlanner / 官方輿圖天賦網址
  recommendedMaps: string[]; // e.g. ["幽閉墓穴 (Dunes)", "劇毒林地 (Toxic Sewer)"]
  coreKeystones: string[]; // e.g. ["第七道門", "不屈之志", "命運扭曲", "專注單一"]
  mechanicNotes?: string; // 機制操作要點與技巧說明
  allocatedNodes?: string[]; // 應用內配置的輿圖天賦節點 ID 列表
  scarabs: AtlasTierScarab[];
  extraItems: AtlasTierExtraItem[];
  estimatedRevenuePerMapChaos?: number; // 預估單場毛收入 (Chaos)
  mapsPerHour?: number; // 每小時刷圖張數
}

export interface AtlasStrategy {
  id: string;
  name: string;
  category: AtlasMechanicCategory;
  description: string;
  tags: string[];
  tiers: AtlasStrategyTier[];
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface BatchItemRequirement {
  name: string;
  category: 'scarab' | ExtraItemCategory;
  unitCount: number;
  totalCount: number;
  unitPriceChaos: number;
  totalCostChaos: number;
  totalCostDivine: number;
}

export interface AtlasCalculationSummary {
  // Single Map Cost
  scarabCostChaos: number;
  extraItemCostChaos: number;
  totalCostChaosPerMap: number;
  totalCostDivinePerMap: number;

  // Single Map Profit
  revenueChaosPerMap: number;
  revenueDivinePerMap: number;
  netProfitChaosPerMap: number;
  netProfitDivinePerMap: number;
  roiPercentage: number;

  // Hourly Rate
  mapsPerHour: number;
  hourlyRevenueChaos: number;
  hourlyRevenueDivine: number;
  hourlyProfitChaos: number;
  hourlyProfitDivine: number;

  // Batch Requirements
  batchSize: number;
  batchTotalCostChaos: number;
  batchTotalCostDivine: number;
  batchTotalProfitChaos: number;
  batchTotalProfitDivine: number;
  batchItems: BatchItemRequirement[];
}
