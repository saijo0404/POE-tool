import type {
  AtlasStrategyTier,
  AtlasTierScarab,
  AtlasTierExtraItem,
  AtlasCalculationSummary,
  BatchItemRequirement
} from './types';
import { SCARAB_DATABASE, POPULAR_EXTRA_ITEMS } from './scarabDatabase';
export {
  generateShoppingListText,
  generateTradeKeywordsText,
  generatePoeItemFormatListText,
  formatItemAsPoeClipboard,
  resolveItemTradeMeta
} from './atlasShoppingList';

export function resolveScarabPrice(
  scarab: AtlasTierScarab,
  ninjaRates: Record<string, number> = {}
): number {
  if (scarab.customPriceChaos !== undefined && scarab.customPriceChaos >= 0) {
    return scarab.customPriceChaos;
  }
  // Try looking up from live ninjaRates if nameEn is given
  if (scarab.nameEn && ninjaRates[scarab.nameEn] !== undefined) {
    return ninjaRates[scarab.nameEn];
  }
  if (scarab.name && ninjaRates[scarab.name] !== undefined) {
    return ninjaRates[scarab.name];
  }
  // Look up in database to get standard English name or base price
  const dbEntry = SCARAB_DATABASE.find(
    s => s.name === scarab.name || (scarab.nameEn && s.nameEn === scarab.nameEn)
  );
  if (dbEntry) {
    if (dbEntry.nameEn && ninjaRates[dbEntry.nameEn] !== undefined) {
      return ninjaRates[dbEntry.nameEn];
    }
    return dbEntry.basePriceChaos ?? 5;
  }
  return 5;
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
  // Check live ninjaRates directly
  if (item.nameEn && ninjaRates[item.nameEn] !== undefined) {
    return ninjaRates[item.nameEn];
  }
  if (item.name && ninjaRates[item.name] !== undefined) {
    return ninjaRates[item.name];
  }
  // Look up preset in POPULAR_EXTRA_ITEMS
  const preset = POPULAR_EXTRA_ITEMS.find(
    p => p.name === item.name ||
      (item.nameEn && p.nameEn === item.nameEn) ||
      item.name.includes(p.name.split(' (')[0]) ||
      p.name.includes(item.name)
  );
  if (preset) {
    if (preset.nameEn && ninjaRates[preset.nameEn] !== undefined) {
      return ninjaRates[preset.nameEn];
    }
    return preset.defaultPriceChaos;
  }
  return item.unitPriceChaos ?? 0;
}

export function computeAtlasSummary(
  tier: AtlasStrategyTier,
  ninjaRates: Record<string, number> = {},
  divineRate: number = 150,
  batchSize: number = 20
): AtlasCalculationSummary {
  const safeDivRate = divineRate > 0 ? divineRate : 150;

  // 1. Scarabs cost & aggregation
  let scarabCostChaos = 0;
  const batchScarabMap = new Map<string, {
    name: string;
    nameEn?: string;
    unitCount: number;
    unitPrice: number;
    totalCost: number;
  }>();

  tier.scarabs.forEach(scarab => {
    const price = resolveScarabPrice(scarab, ninjaRates);
    const count = scarab.count || 0;
    const totalItemCost = count * price;
    scarabCostChaos += totalItemCost;

    const dbEntry = SCARAB_DATABASE.find(
      s => s.name === scarab.name || (scarab.nameEn && s.nameEn === scarab.nameEn)
    );
    const nameEn = scarab.nameEn || dbEntry?.nameEn;
    const key = scarab.name;
    const existing = batchScarabMap.get(key);
    if (existing) {
      existing.unitCount += count;
      existing.totalCost += totalItemCost;
      existing.unitPrice = existing.unitCount > 0
        ? Math.round((existing.totalCost / existing.unitCount) * 10) / 10
        : price;
    } else {
      batchScarabMap.set(key, {
        name: scarab.name,
        nameEn,
        unitCount: count,
        unitPrice: price,
        totalCost: totalItemCost
      });
    }
  });

  // 2. Extra items cost & aggregation
  let extraItemCostChaos = 0;
  const batchExtraMap = new Map<string, {
    name: string;
    nameEn?: string;
    category: BatchItemRequirement['category'];
    unitCount: number;
    unitPrice: number;
    totalCost: number;
  }>();

  tier.extraItems.forEach(item => {
    const price = resolveExtraItemPrice(item, ninjaRates, safeDivRate);
    const count = item.count || 0;
    const totalItemCost = count * price;
    extraItemCostChaos += totalItemCost;

    const preset = POPULAR_EXTRA_ITEMS.find(
      p => p.name === item.name ||
        (item.nameEn && p.nameEn === item.nameEn) ||
        item.name.includes(p.name.split(' (')[0]) ||
        p.name.includes(item.name)
    );
    const nameEn = item.nameEn || preset?.nameEn;
    const key = `${item.category}_${item.name}`;
    const existing = batchExtraMap.get(key);
    if (existing) {
      existing.unitCount += count;
      existing.totalCost += totalItemCost;
      existing.unitPrice = existing.unitCount > 0
        ? Math.round((existing.totalCost / existing.unitCount) * 10) / 10
        : price;
    } else {
      batchExtraMap.set(key, {
        name: item.name,
        nameEn,
        category: item.category,
        unitCount: count,
        unitPrice: price,
        totalCost: totalItemCost
      });
    }
  });

  // Assemble batch items list
  const batchItems: BatchItemRequirement[] = [];
  batchScarabMap.forEach(s => {
    const totalCount = s.unitCount * batchSize;
    const totalChaos = Math.round(totalCount * s.unitPrice * 10) / 10;
    batchItems.push({
      name: s.name,
      nameEn: s.nameEn,
      category: 'scarab',
      unitCount: s.unitCount,
      totalCount,
      unitPriceChaos: s.unitPrice,
      totalCostChaos: totalChaos,
      totalCostDivine: Math.round((totalChaos / safeDivRate) * 100) / 100
    });
  });

  batchExtraMap.forEach(item => {
    const totalCount = item.unitCount * batchSize;
    const totalChaos = Math.round(totalCount * item.unitPrice * 10) / 10;
    batchItems.push({
      name: item.name,
      nameEn: item.nameEn,
      category: item.category,
      unitCount: item.unitCount,
      totalCount,
      unitPriceChaos: item.unitPrice,
      totalCostChaos: totalChaos,
      totalCostDivine: Math.round((totalChaos / safeDivRate) * 100) / 100
    });
  });

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
export {
  ATLAS_STORAGE_KEY,
  DEFAULT_ATLAS_TREE_URL,
  sanitizeAtlasTreeUrl,
  loadStrategiesFromStorage,
  saveStrategiesToStorage
} from './atlasStorage';

