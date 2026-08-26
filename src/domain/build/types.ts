export type BuildItemCategory = 'equipment' | 'gem' | 'flask' | 'jewel';
export type PriceConfidence = 'high' | 'medium' | 'low';

export interface PricedItem {
  name: string;
  typeLine: string;
  category: BuildItemCategory;
  rarity: string;
  icon: string;
  slot?: string;
  priceChaos: number;
  priceDivine: number;
  confidence: PriceConfidence;
  details?: string;
  tradeSearchUrl?: string;
  tradeQueryJson?: string;
  isLivePrice?: boolean;
  listingCount?: number;
  ilvl?: number;
  quality?: number;
  corrupted?: boolean;
  sockets?: string;
  implicitMods?: string[];
  explicitMods?: string[];
  craftedMods?: string[];
  fracturedMods?: string[];
  enchantMods?: string[];
  gemLevel?: number;
  gemQuality?: number;
  propertyEnergyShield?: number;
  propertyArmour?: number;
  propertyEvasion?: number;
  properties?: { name: string; values: [string, number][] }[];
}

export interface CategoryData {
  items: PricedItem[];
  totalChaos: number;
  totalDivine: number;
}

export interface BuildCharacterMeta {
  account: string;
  name: string;
  league: string;
  level: number;
  class: string;
  ascendancy: string;
}

export interface BuildCostCategories {
  equipment: CategoryData;
  gems: CategoryData;
  flasks: CategoryData;
  jewels: CategoryData;
}

export interface BuildCostResult {
  character: BuildCharacterMeta;
  totalChaos: number;
  totalDivine: number;
  divineChaosRate: number;
  categories: BuildCostCategories;
  totalCostChaos?: number;
}

export interface BuildHistoryEntry {
  url: string;
  account: string;
  character: string;
  league: string;
  totalDivine: number;
  totalChaos: number;
  timestamp: number;
  customPrices?: Record<string, { priceDivine: number; priceChaos: number; isLivePrice: boolean; listingCount?: number }>;
}

export interface NinjaPricesResult {
  rates: Record<string, number>;
  divineChaosRate: number;
  league: string;
}
