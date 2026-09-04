export type AssetCategory = 'unique' | 'currency' | 'essence' | 'divcard' | 'scarab';

export interface PricePoint {
  timestamp: number;
  priceChaos: number;
  priceDivine: number;
  dateLabel: string;
}

export interface AssetTrend {
  id: string;
  name: string;
  category: AssetCategory;
  icon?: string;
  currentPriceChaos: number;
  currentPriceDivine: number;
  change24hPercent: number;
  change24hChaos: number;
  change7dPercent: number;
  change7dChaos: number;
  sparkline7d: number[];
  history: PricePoint[];
  isVolatile: boolean;
}

export type AlertConditionType = 'above' | 'below';
export type AlertCurrencyType = 'chaos' | 'divine';

export interface PriceAlertRule {
  id: string;
  assetName: string;
  condition: AlertConditionType;
  currency: AlertCurrencyType;
  threshold: number;
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface PriceAlertTrigger {
  rule: PriceAlertRule;
  currentValue: number;
  message: string;
  triggeredAt: string;
}
