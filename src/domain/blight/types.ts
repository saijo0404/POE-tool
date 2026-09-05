export interface BlightOil {
  id: string;
  nameZh: string;
  nameEn: string;
  tier: number;
  defaultPriceChaos: number;
  dropWeight: number;
  mapEffectZh: string;
}

export type ArbitrageRecommendation = 'upgrade' | 'sell_raw' | 'neutral';

export interface OilArbitrageResult {
  fromOilId: string;
  toOilId: string;
  fromOilPriceChaos: number;
  toOilPriceChaos: number;
  threeToOneCostChaos: number;
  arbitrageProfitChaos: number;
  recommendation: ArbitrageRecommendation;
}

export interface NotableAnointment {
  id: string;
  notableNameZh: string;
  notableNameEn: string;
  requiredOils: [string, string, string];
  effectSummaryZh: string;
}

export type BlightedMapType = 'blighted' | 'blight_ravaged';

export interface BlightMapCalculation {
  mapType: BlightedMapType;
  selectedOilIds: string[];
  totalOilCostChaos: number;
  baseMapCostChaos: number;
  quantityBonusPercent: number;
  packSizeBonusPercent: number;
  luckyChestChancePercent: number;
  estimatedGrossChaos: number;
  estimatedNetProfitChaos: number;
  roiPercent: number;
}
