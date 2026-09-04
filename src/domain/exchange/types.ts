/**
 * Faustus Currency Exchange Domain Types
 */

export type ExchangeCategory =
  | 'All'
  | 'Currency'
  | 'Scarab'
  | 'Essence'
  | 'DivinationCard'
  | 'Fragment'
  | 'DeliriumOrb'
  | 'Catalyst'
  | 'Oil';

export type CurrencyKey = 'chaos' | 'divine' | 'mirror' | 'exalted';

export type ArbitrageDirection =
  | 'BUY_FAUSTUS_SELL_TRADE'
  | 'BUY_TRADE_SELL_FAUSTUS';

export interface ExchangeItem {
  id: string;
  name: string;
  nameZh?: string;
  category: ExchangeCategory;
  icon: string;
  primaryValue: number; // Price in Chaos
  secondaryValue: number; // Price in Divine
  tradePriceChaos?: number; // Direct Trade / Marketplace price in Chaos
  volume24h: number;
  maxVolumeCurrency: string;
  maxVolumeRate: number;
  goldCostPerUnit: number;
  sparkline?: number[];
  change24h?: number;
}

export interface ArbitrageOpportunity {
  itemId: string;
  itemName: string;
  itemNameZh?: string;
  category: ExchangeCategory;
  icon: string;
  direction: ArbitrageDirection;
  faustusPriceChaos: number;
  tradePriceChaos: number;
  priceDiffChaos: number;
  profitChaos: number;
  profitDivine: number;
  roiPercent: number;
  goldFeePerUnit: number;
  volume24h: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface GoldFeeCalculation {
  itemName: string;
  quantity: number;
  goldCostPerUnit: number;
  totalGoldFee: number;
  tier: 'BASIC' | 'MID' | 'HIGH' | 'PREMIUM';
  estimatedMapsToFarm: number; // Based on average ~25,000 gold per T16 map
}

export interface CurrencyRates {
  divineChaosRate: number;
  mirrorChaosRate: number;
  exaltedChaosRate: number;
}

export interface CurrencyMatrixConversion {
  baseCurrency: CurrencyKey;
  amount: number;
  conversions: {
    chaos: number;
    divine: number;
    mirror: number;
    exalted: number;
  };
  goldFeeEstimate: number;
}

export interface FaustusMarketOverview {
  league: string;
  updatedAt: number;
  divineChaosRate: number;
  mirrorDivineRate: number;
  totalItems: number;
  items: ExchangeItem[];
  arbitrageOpportunities: ArbitrageOpportunity[];
}

export interface ExchangeFilterOptions {
  category: ExchangeCategory;
  searchQuery: string;
  onlyArbitrage: boolean;
  minVolume: number;
  sortBy: 'volume' | 'priceAsc' | 'priceDesc' | 'arbitrageProfit' | 'roi';
}
