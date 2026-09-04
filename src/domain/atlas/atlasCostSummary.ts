import type {
  AtlasStrategyTier,
  AtlasTierScarab,
  AtlasTierExtraItem,
  AtlasCalculationSummary,
  BatchItemRequirement
} from './types';
import { SCARAB_DATABASE, POPULAR_EXTRA_ITEMS } from './scarabDatabase';
import { resolveScarabPrice, resolveExtraItemPrice } from './atlasHelpers';

interface BatchAccumulator {
  name: string;
  nameEn?: string;
  unitCount: number;
  unitPrice: number;
  totalCost: number;
}

function accumulateScarab(
  scarabMap: Map<string, BatchAccumulator>,
  scarab: AtlasTierScarab,
  ninjaRates: Record<string, number>
): number {
  const price = resolveScarabPrice(scarab, ninjaRates);
  const count = scarab.count || 0;
  const totalItemCost = count * price;
  const dbEntry = SCARAB_DATABASE.find(
    s => s.name === scarab.name || (scarab.nameEn && s.nameEn === scarab.nameEn)
  );
  const nameEn = scarab.nameEn || dbEntry?.nameEn;
  const existing = scarabMap.get(scarab.name);
  if (existing) {
    existing.unitCount += count;
    existing.totalCost += totalItemCost;
    existing.unitPrice = existing.unitCount > 0
      ? Math.round((existing.totalCost / existing.unitCount) * 10) / 10
      : price;
  } else {
    scarabMap.set(scarab.name, { name: scarab.name, nameEn, unitCount: count, unitPrice: price, totalCost: totalItemCost });
  }
  return totalItemCost;
}

function accumulateExtra(
  extraMap: Map<string, BatchAccumulator & { category: BatchItemRequirement['category'] }>,
  item: AtlasTierExtraItem,
  ninjaRates: Record<string, number>,
  safeDivRate: number
): number {
  const price = resolveExtraItemPrice(item, ninjaRates, safeDivRate);
  const count = item.count || 0;
  const totalItemCost = count * price;
  const preset = POPULAR_EXTRA_ITEMS.find(
    p => p.name === item.name || (item.nameEn && p.nameEn === item.nameEn) || item.name.includes(p.name.split(' (')[0]) || p.name.includes(item.name)
  );
  const nameEn = item.nameEn || preset?.nameEn;
  const key = `${item.category}_${item.name}`;
  const existing = extraMap.get(key);
  if (existing) {
    existing.unitCount += count;
    existing.totalCost += totalItemCost;
    existing.unitPrice = existing.unitCount > 0 ? Math.round((existing.totalCost / existing.unitCount) * 10) / 10 : price;
  } else {
    extraMap.set(key, { name: item.name, nameEn, category: item.category, unitCount: count, unitPrice: price, totalCost: totalItemCost });
  }
  return totalItemCost;
}

function assembleBatchItems(
  scarabMap: Map<string, BatchAccumulator>,
  extraMap: Map<string, BatchAccumulator & { category: BatchItemRequirement['category'] }>,
  batchSize: number,
  safeDivRate: number
): BatchItemRequirement[] {
  const batchItems: BatchItemRequirement[] = [];
  scarabMap.forEach(s => {
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
  extraMap.forEach(item => {
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
  return batchItems;
}

export function computeAtlasSummary(
  tier: AtlasStrategyTier,
  ninjaRates: Record<string, number> = {},
  divineRate: number = 150,
  batchSize: number = 20
): AtlasCalculationSummary {
  const safeDivRate = divineRate > 0 ? divineRate : 150;
  const scarabMap = new Map<string, BatchAccumulator>();
  const scarabCostChaos = tier.scarabs.reduce((sum, s) => sum + accumulateScarab(scarabMap, s, ninjaRates), 0);

  const extraMap = new Map<string, BatchAccumulator & { category: BatchItemRequirement['category'] }>();
  const extraItemCostChaos = tier.extraItems.reduce((sum, e) => sum + accumulateExtra(extraMap, e, ninjaRates, safeDivRate), 0);

  const batchItems = assembleBatchItems(scarabMap, extraMap, batchSize, safeDivRate);
  const totalCostChaosPerMap = Math.round((scarabCostChaos + extraItemCostChaos) * 10) / 10;
  const totalCostDivinePerMap = Math.round((totalCostChaosPerMap / safeDivRate) * 100) / 100;

  const revenueChaosPerMap = tier.estimatedRevenuePerMapChaos || 0;
  const revenueDivinePerMap = Math.round((revenueChaosPerMap / safeDivRate) * 100) / 100;
  const netProfitChaosPerMap = Math.round((revenueChaosPerMap - totalCostChaosPerMap) * 10) / 10;
  const netProfitDivinePerMap = Math.round((netProfitChaosPerMap / safeDivRate) * 100) / 100;
  const roiPercentage = totalCostChaosPerMap > 0 ? Math.round((netProfitChaosPerMap / totalCostChaosPerMap) * 1000) / 10 : 0;

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
