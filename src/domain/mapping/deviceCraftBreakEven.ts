export interface CraftKeyDrop {
  name: string;
  unitValueChaos: number;
  expectedUnits: number;
}

export interface DeviceCraftOption {
  id: string;
  name: string;
  nameEn: string;
  costChaos: number;
  keyDrops: CraftKeyDrop[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DeviceCraftForecastInput {
  craftId: string;
  customCostChaos?: number;
  itemQuantityBonusPercent?: number;
  packSizeBonusPercent?: number;
  customUnitPrices?: Record<string, number>;
}

export interface BreakEvenRequirement {
  dropName: string;
  unitValueChaos: number;
  minUnitsToBreakEven: number;
  expectedUnitsWithMapBonus: number;
}

export interface DeviceCraftForecastResult {
  craft: DeviceCraftOption;
  effectiveCostChaos: number;
  expectedRevenueChaos: number;
  netProfitChaos: number;
  expectedRoiPercent: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendationLevel: 'strongly_recommended' | 'situational' | 'high_risk';
  breakEvenDrops: BreakEvenRequirement[];
  verdictNote: string;
}

export const DEVICE_CRAFT_OPTIONS: DeviceCraftOption[] = [
  {
    id: 'essence',
    name: '地圖儀：精髓 (Essence)',
    nameEn: 'Essence Craft',
    costChaos: 8,
    riskLevel: 'low',
    keyDrops: [{ name: '尖嘯/嘯鳴精髓 (Screaming/Shrieking)', unitValueChaos: 3.5, expectedUnits: 3.2 }]
  },
  {
    id: 'ambush',
    name: '地圖儀：伏擊 (Ambush)',
    nameEn: 'Ambush Craft',
    costChaos: 7,
    riskLevel: 'low',
    keyDrops: [{ name: '保險箱通貨/卡片 (Strongbox Loot)', unitValueChaos: 5.0, expectedUnits: 2.2 }]
  },
  {
    id: 'delirium',
    name: '地圖儀：瞻妄 (Delirium)',
    nameEn: 'Delirium Craft',
    costChaos: 10,
    riskLevel: 'medium',
    keyDrops: [{ name: '瞻妄玉/擬態碎片 (Delirium Orb/Splinter)', unitValueChaos: 15.0, expectedUnits: 1.1 }]
  },
  {
    id: 'legion',
    name: '地圖儀：戰亂 (Legion)',
    nameEn: 'Legion Craft',
    costChaos: 8,
    riskLevel: 'medium',
    keyDrops: [{ name: '戰亂印記碎片 (Timeless Splinters)', unitValueChaos: 1.5, expectedUnits: 8.0 }]
  },
  {
    id: 'harvest',
    name: '地圖儀：收割 (Harvest)',
    nameEn: 'Harvest Craft',
    costChaos: 12,
    riskLevel: 'medium',
    keyDrops: [{ name: '命力 (Lifeforce)', unitValueChaos: 0.04, expectedUnits: 420 }]
  },
  {
    id: 'breach',
    name: '地圖儀：破滅裂痕 (Breach)',
    nameEn: 'Breach Craft',
    costChaos: 6,
    riskLevel: 'medium',
    keyDrops: [{ name: '裂痕石碎片 (Breach Splinters)', unitValueChaos: 1.2, expectedUnits: 7.5 }]
  },
  {
    id: 'expedition',
    name: '地圖儀：探險 (Expedition)',
    nameEn: 'Expedition Craft',
    costChaos: 10,
    riskLevel: 'high',
    keyDrops: [{ name: '拓印/重鑄探險日誌 (Runic Logbook)', unitValueChaos: 35.0, expectedUnits: 0.45 }]
  },
  {
    id: 'beyond',
    name: '地圖儀：超越 (Beyond)',
    nameEn: 'Beyond Craft',
    costChaos: 6,
    riskLevel: 'high',
    keyDrops: [{ name: '汙染通貨/聖靈之核 (Tainted Currency)', unitValueChaos: 4.0, expectedUnits: 2.1 }]
  },
  {
    id: 'fortune',
    name: '地圖儀：命運之眷 (Fortune Favours)',
    nameEn: 'Fortune Favours the Brave',
    costChaos: 3,
    riskLevel: 'low',
    keyDrops: [{ name: '隨機遭遇綜合掉落 (Random Encounter)', unitValueChaos: 2.0, expectedUnits: 2.4 }]
  }
];

export function getAllDeviceCrafts(): DeviceCraftOption[] {
  return [...DEVICE_CRAFT_OPTIONS];
}

export function getDeviceCraftById(id: string): DeviceCraftOption | undefined {
  return DEVICE_CRAFT_OPTIONS.find(c => c.id === id);
}

function computeDropRequirement(
  drop: CraftKeyDrop,
  cost: number,
  bonusMult: number,
  customPrices?: Record<string, number>
): BreakEvenRequirement {
  const price = customPrices?.[drop.name] ?? drop.unitValueChaos;
  const safePrice = price > 0 ? price : 1;
  const minUnits = Math.round((cost / safePrice) * 10) / 10;
  const expectedUnitsWithBonus = Math.round(drop.expectedUnits * bonusMult * 10) / 10;
  return {
    dropName: drop.name,
    unitValueChaos: safePrice,
    minUnitsToBreakEven: minUnits,
    expectedUnitsWithMapBonus: expectedUnitsWithBonus
  };
}

function resolveRecommendation(roi: number): 'strongly_recommended' | 'situational' | 'high_risk' {
  if (roi >= 25) return 'strongly_recommended';
  if (roi >= 0) return 'situational';
  return 'high_risk';
}

function formatVerdict(name: string, roi: number, rec: string): string {
  if (rec === 'strongly_recommended') {
    return `【${name}】高期望回報 (+${roi}% ROI)，強烈推薦開啟。`;
  }
  if (rec === 'situational') {
    return `【${name}】基本可持平保本 (+${roi}% ROI)，視輿圖天賦配置決定。`;
  }
  return `【${name}】平均期望為負 (${roi}% ROI)，未配置相關天賦易虧損。`;
}

function computeRevenueAndRoi(drops: BreakEvenRequirement[], cost: number) {
  const rev = drops.reduce((sum, d) => sum + d.expectedUnitsWithMapBonus * d.unitValueChaos, 0);
  const revenue = Math.round(rev * 10) / 10;
  const netProfit = Math.round((revenue - cost) * 10) / 10;
  const roi = Math.round(((revenue - cost) / (cost > 0 ? cost : 1)) * 100);
  return { revenue, netProfit, roi };
}

export function calculateDeviceCraftBreakEven(input: DeviceCraftForecastInput): DeviceCraftForecastResult {
  const craft = getDeviceCraftById(input.craftId) || DEVICE_CRAFT_OPTIONS.find(c => c.id === 'fortune')!;
  const cost = input.customCostChaos ?? craft.costChaos;
  const quantMult = 1 + (input.itemQuantityBonusPercent ?? 0) / 100;
  const packMult = 1 + (input.packSizeBonusPercent ?? 0) / 100;
  const bonusMult = quantMult * packMult;

  const breakEvenDrops = craft.keyDrops.map(drop =>
    computeDropRequirement(drop, cost, bonusMult, input.customUnitPrices)
  );

  const { revenue, netProfit, roi } = computeRevenueAndRoi(breakEvenDrops, cost);
  const recommendation = resolveRecommendation(roi);

  return {
    craft,
    effectiveCostChaos: cost,
    expectedRevenueChaos: revenue,
    netProfitChaos: netProfit,
    expectedRoiPercent: roi,
    riskLevel: craft.riskLevel,
    recommendationLevel: recommendation,
    breakEvenDrops,
    verdictNote: formatVerdict(craft.name, roi, recommendation)
  };
}

export function forecastAllDeviceCrafts(options?: Partial<DeviceCraftForecastInput>): DeviceCraftForecastResult[] {
  return DEVICE_CRAFT_OPTIONS.map(c => calculateDeviceCraftBreakEven({ craftId: c.id, ...options }))
    .sort((a, b) => b.expectedRoiPercent - a.expectedRoiPercent);
}

