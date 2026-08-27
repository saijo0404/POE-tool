import type {
  AtlasStrategy,
  AtlasStrategyTier,
  AtlasTierScarab,
  AtlasTierExtraItem,
  AtlasCalculationSummary,
  BatchItemRequirement
} from './types';
import { ATLAS_PRESET_STRATEGIES } from './atlasPresets';
import { SCARAB_DATABASE } from './scarabDatabase';

export const ATLAS_STORAGE_KEY = 'poe_atlas_custom_strategies_v1';

export function resolveScarabPrice(
  scarab: AtlasTierScarab,
  ninjaRates: Record<string, number> = {}
): number {
  if (scarab.customPriceChaos !== undefined && scarab.customPriceChaos >= 0) {
    return scarab.customPriceChaos;
  }
  // Try looking up from live ninjaRates
  if (scarab.nameEn && ninjaRates[scarab.nameEn] !== undefined) {
    return ninjaRates[scarab.nameEn];
  }
  if (scarab.name && ninjaRates[scarab.name] !== undefined) {
    return ninjaRates[scarab.name];
  }
  // Fallback to database base price
  const dbEntry = SCARAB_DATABASE.find(
    s => s.name === scarab.name || (scarab.nameEn && s.nameEn === scarab.nameEn)
  );
  return dbEntry?.basePriceChaos ?? 5;
}

export function resolveExtraItemPrice(
  item: AtlasTierExtraItem,
  ninjaRates: Record<string, number> = {},
  divineRate: number = 150
): number {
  if (item.unitPriceChaos !== undefined && item.unitPriceChaos > 0) {
    return item.unitPriceChaos;
  }
  if (item.unitPriceDivine !== undefined && item.unitPriceDivine > 0) {
    return Math.round(item.unitPriceDivine * divineRate * 100) / 100;
  }
  if (item.nameEn && ninjaRates[item.nameEn] !== undefined) {
    return ninjaRates[item.nameEn];
  }
  if (item.name && ninjaRates[item.name] !== undefined) {
    return ninjaRates[item.name];
  }
  return 0;
}

export function computeAtlasSummary(
  tier: AtlasStrategyTier,
  ninjaRates: Record<string, number> = {},
  divineRate: number = 150,
  batchSize: number = 20
): AtlasCalculationSummary {
  const safeDivRate = divineRate > 0 ? divineRate : 150;

  // 1. Scarabs cost
  let scarabCostChaos = 0;
  const batchScarabMap = new Map<string, { unitCount: number; unitPrice: number; name: string }>();

  tier.scarabs.forEach(scarab => {
    const price = resolveScarabPrice(scarab, ninjaRates);
    const totalItemCost = (scarab.count || 0) * price;
    scarabCostChaos += totalItemCost;

    const key = scarab.name;
    const existing = batchScarabMap.get(key);
    if (existing) {
      existing.unitCount += scarab.count;
    } else {
      batchScarabMap.set(key, {
        name: scarab.name,
        unitCount: scarab.count || 0,
        unitPrice: price
      });
    }
  });

  // 2. Extra items cost
  let extraItemCostChaos = 0;
  const batchExtraItems: BatchItemRequirement[] = [];

  tier.extraItems.forEach(item => {
    const price = resolveExtraItemPrice(item, ninjaRates, safeDivRate);
    const count = item.count || 0;
    const totalItemCost = count * price;
    extraItemCostChaos += totalItemCost;

    batchExtraItems.push({
      name: item.name,
      category: item.category,
      unitCount: count,
      totalCount: count * batchSize,
      unitPriceChaos: price,
      totalCostChaos: Math.round(totalItemCost * batchSize * 10) / 10,
      totalCostDivine: Math.round(((totalItemCost * batchSize) / safeDivRate) * 100) / 100
    });
  });

  // Assemble batch items list
  const batchItems: BatchItemRequirement[] = [];
  batchScarabMap.forEach(s => {
    const totalCount = s.unitCount * batchSize;
    const totalChaos = Math.round(totalCount * s.unitPrice * 10) / 10;
    batchItems.push({
      name: s.name,
      category: 'scarab',
      unitCount: s.unitCount,
      totalCount,
      unitPriceChaos: s.unitPrice,
      totalCostChaos: totalChaos,
      totalCostDivine: Math.round((totalChaos / safeDivRate) * 100) / 100
    });
  });
  batchItems.push(...batchExtraItems);

  const totalCostChaosPerMap = Math.round((scarabCostChaos + extraItemCostChaos) * 10) / 10;
  const totalCostDivinePerMap = Math.round((totalCostChaosPerMap / safeDivRate) * 100) / 100;

  // Revenue & Profits
  const revenueChaosPerMap = tier.estimatedRevenuePerMapChaos || 0;
  const revenueDivinePerMap = Math.round((revenueChaosPerMap / safeDivRate) * 100) / 100;

  const netProfitChaosPerMap = Math.round((revenueChaosPerMap - totalCostChaosPerMap) * 10) / 10;
  const netProfitDivinePerMap = Math.round((netProfitChaosPerMap / safeDivRate) * 100) / 100;

  const roiPercentage = totalCostChaosPerMap > 0
    ? Math.round((netProfitChaosPerMap / totalCostChaosPerMap) * 1000) / 10
    : 0;

  const mapsPerHour = tier.mapsPerHour || 15;
  const hourlyRevenueChaos = Math.round(revenueChaosPerMap * mapsPerHour);
  const hourlyRevenueDivine = Math.round((hourlyRevenueChaos / safeDivRate) * 100) / 100;
  const hourlyProfitChaos = Math.round(netProfitChaosPerMap * mapsPerHour);
  const hourlyProfitDivine = Math.round((hourlyProfitChaos / safeDivRate) * 100) / 100;

  const batchTotalCostChaos = Math.round(totalCostChaosPerMap * batchSize * 10) / 10;
  const batchTotalCostDivine = Math.round((batchTotalCostChaos / safeDivRate) * 100) / 100;
  const batchTotalProfitChaos = Math.round(netProfitChaosPerMap * batchSize * 10) / 10;
  const batchTotalProfitDivine = Math.round((batchTotalProfitChaos / safeDivRate) * 100) / 100;

  return {
    scarabCostChaos,
    extraItemCostChaos,
    totalCostChaosPerMap,
    totalCostDivinePerMap,
    revenueChaosPerMap,
    revenueDivinePerMap,
    netProfitChaosPerMap,
    netProfitDivinePerMap,
    roiPercentage,
    mapsPerHour,
    hourlyRevenueChaos,
    hourlyRevenueDivine,
    hourlyProfitChaos,
    hourlyProfitDivine,
    batchSize,
    batchTotalCostChaos,
    batchTotalCostDivine,
    batchTotalProfitChaos,
    batchTotalProfitDivine,
    batchItems
  };
}

export function generateShoppingListText(
  strategyName: string,
  tierName: string,
  summary: AtlasCalculationSummary
): string {
  const lines: string[] = [];
  lines.push(`📋 【POE 1 刷圖備料清單】`);
  lines.push(`策略：${strategyName} - 分級：${tierName}`);
  lines.push(`批次目標：${summary.batchSize} 場地圖`);
  lines.push(`預估總成本：${summary.batchTotalCostChaos} Chaos (~ ${summary.batchTotalCostDivine} Divine)`);
  lines.push(`預估總利潤：${summary.batchTotalProfitChaos} Chaos (~ ${summary.batchTotalProfitDivine} Divine)`);
  lines.push(`----------------------------------------`);
  lines.push(`【所需物料採購總清單】`);

  summary.batchItems.forEach(item => {
    lines.push(`- ${item.name} x ${item.totalCount} (單價 ~${item.unitPriceChaos}c | 總計 ${item.totalCostChaos}c)`);
  });

  lines.push(`----------------------------------------`);
  lines.push(`產出自 POE_tool 輿圖天賦策略規劃器`);
  return lines.join('\n');
}

export const DEFAULT_ATLAS_TREE_URL = 'https://poeplanner.com/atlas-tree';

export function sanitizeAtlasTreeUrl(url?: string): string {
  if (!url || !url.trim()) {
    return DEFAULT_ATLAS_TREE_URL;
  }
  const trimmed = url.trim();
  // Sanitize legacy mock/corrupted BAAFA URLs
  if (trimmed.includes('poeplanner.com/atlas-tree/BAAFA') || trimmed.includes('BAAFA')) {
    return DEFAULT_ATLAS_TREE_URL;
  }
  return trimmed;
}

export function loadStrategiesFromStorage(): AtlasStrategy[] {
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((strat: AtlasStrategy) => ({
          ...strat,
          tiers: (strat.tiers || []).map(tier => ({
            ...tier,
            atlasTreeUrl: sanitizeAtlasTreeUrl(tier.atlasTreeUrl)
          }))
        }));
      }
    }
  } catch {
    // ignore
  }
  return ATLAS_PRESET_STRATEGIES;
}

export function saveStrategiesToStorage(strategies: AtlasStrategy[]): void {
  try {
    localStorage.setItem(ATLAS_STORAGE_KEY, JSON.stringify(strategies));
  } catch {
    // ignore
  }
}

