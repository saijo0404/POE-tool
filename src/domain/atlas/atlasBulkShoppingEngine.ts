import { Result, ok, err } from '../errors/Result';
import { DomainError } from '../errors/DomainError';
import type { AtlasStrategyTier, AtlasTierScarab, AtlasTierExtraItem, ExtraItemCategory } from './types';
import { resolveScarabPrice, resolveExtraItemPrice } from './atlasHelpers';
import { calculateItemGoldFee } from '../exchange/goldCalculator';

export interface BulkShoppingItem {
  id: string;
  name: string;
  nameEn?: string;
  category: 'scarab' | ExtraItemCategory | 'map';
  perMapCount: number;
  totalCount: number;
  unitPriceChaos: number;
  totalCostChaos: number;
  totalCostDivine: number;
  estimatedGoldFee: number;
  isCraftCost?: boolean;
}

export interface BulkShoppingPlan {
  strategyName?: string;
  tierName: string;
  runs: number;
  items: BulkShoppingItem[];
  totalCostChaos: number;
  totalCostDivine: number;
  totalEstimatedGoldFee: number;
  mapsNeededToFarmGold: number;
  singleMapCostChaos: number;
  singleMapCostDivine: number;
  estimatedTotalRevenueChaos: number;
  estimatedTotalProfitChaos: number;
  estimatedTotalProfitDivine: number;
}

export interface BulkShoppingParams {
  tier: AtlasStrategyTier;
  runs?: number;
  strategyName?: string;
  divineRate?: number;
  ninjaRates?: Record<string, number>;
  customPriceOverrides?: Record<string, number>;
}

function resolveUnitPrice(name: string, defaultPrice: number, overrides?: Record<string, number>): number {
  if (overrides && overrides[name] !== undefined && overrides[name] >= 0) {
    return overrides[name];
  }
  return defaultPrice;
}

function buildScarabItem(
  scarab: AtlasTierScarab,
  runs: number,
  divineRate: number,
  ninjaRates?: Record<string, number>,
  overrides?: Record<string, number>
): BulkShoppingItem {
  const basePrice = resolveScarabPrice(scarab, ninjaRates);
  const unitPrice = resolveUnitPrice(scarab.name, basePrice, overrides);
  const perMapCount = scarab.count || 0;
  const totalCount = perMapCount * runs;
  const totalCostChaos = Math.round(totalCount * unitPrice * 10) / 10;
  const totalCostDivine = Math.round((totalCostChaos / divineRate) * 100) / 100;
  const goldPerUnit = calculateItemGoldFee(scarab.nameEn || scarab.name, unitPrice, 'Scarab');

  return {
    id: scarab.id,
    name: scarab.name,
    nameEn: scarab.nameEn,
    category: 'scarab',
    perMapCount,
    totalCount,
    unitPriceChaos: unitPrice,
    totalCostChaos,
    totalCostDivine,
    estimatedGoldFee: goldPerUnit * totalCount
  };
}

function buildExtraItem(
  item: AtlasTierExtraItem,
  runs: number,
  divineRate: number,
  ninjaRates?: Record<string, number>,
  overrides?: Record<string, number>
): BulkShoppingItem {
  const basePrice = resolveExtraItemPrice(item, ninjaRates, divineRate);
  const unitPrice = resolveUnitPrice(item.name, basePrice, overrides);
  const perMapCount = item.count || 0;
  const totalCount = perMapCount * runs;
  const totalCostChaos = Math.round(totalCount * unitPrice * 10) / 10;
  const totalCostDivine = Math.round((totalCostChaos / divineRate) * 100) / 100;
  const isCraft = item.category === 'craft';
  const goldPerUnit = isCraft ? 0 : calculateItemGoldFee(item.nameEn || item.name, unitPrice, item.category);

  return {
    id: item.id,
    name: item.name,
    nameEn: item.nameEn,
    category: item.category,
    perMapCount,
    totalCount,
    unitPriceChaos: unitPrice,
    totalCostChaos,
    totalCostDivine,
    estimatedGoldFee: goldPerUnit * totalCount,
    isCraftCost: isCraft
  };
}

function computeCostMetrics(items: BulkShoppingItem[], runs: number, divRate: number) {
  const totalCostChaos = Math.round(items.reduce((acc, i) => acc + i.totalCostChaos, 0) * 10) / 10;
  const totalCostDivine = Math.round((totalCostChaos / divRate) * 100) / 100;
  const singleMapCostChaos = Math.round((totalCostChaos / runs) * 10) / 10;
  const singleMapCostDivine = Math.round((singleMapCostChaos / divRate) * 100) / 100;
  const totalEstimatedGoldFee = items.reduce((acc, i) => acc + i.estimatedGoldFee, 0);
  const mapsNeededToFarmGold = totalEstimatedGoldFee > 0 ? Math.ceil(totalEstimatedGoldFee / 15000) : 0;
  return { totalCostChaos, totalCostDivine, singleMapCostChaos, singleMapCostDivine, totalEstimatedGoldFee, mapsNeededToFarmGold };
}

function computeProfitMetrics(revenuePerMap: number, runs: number, totalCostChaos: number, divRate: number) {
  const estimatedTotalRevenueChaos = Math.round(revenuePerMap * runs * 10) / 10;
  const estimatedTotalProfitChaos = Math.round((estimatedTotalRevenueChaos - totalCostChaos) * 10) / 10;
  const estimatedTotalProfitDivine = Math.round((estimatedTotalProfitChaos / divRate) * 100) / 100;
  return { estimatedTotalRevenueChaos, estimatedTotalProfitChaos, estimatedTotalProfitDivine };
}

/**
 * Calculates bulk shopping requirements, costs, gold fees and profit projections
 */
export function calculateBulkShoppingPlan(
  params: BulkShoppingParams
): Result<BulkShoppingPlan, DomainError> {
  const { tier, runs = 50, strategyName, divineRate = 150, ninjaRates, customPriceOverrides } = params;
  if (!Number.isFinite(runs) || runs <= 0) {
    return err(DomainError.validation('備料場次必須為大於 0 的有效整數', { runs }));
  }
  const safeRuns = Math.floor(runs);
  const safeDivRate = divineRate > 0 ? divineRate : 150;

  const items: BulkShoppingItem[] = [
    ...tier.scarabs.map(s => buildScarabItem(s, safeRuns, safeDivRate, ninjaRates, customPriceOverrides)),
    ...tier.extraItems.map(e => buildExtraItem(e, safeRuns, safeDivRate, ninjaRates, customPriceOverrides))
  ];

  const costs = computeCostMetrics(items, safeRuns, safeDivRate);
  const profits = computeProfitMetrics(tier.estimatedRevenuePerMapChaos || 0, safeRuns, costs.totalCostChaos, safeDivRate);

  return ok({
    strategyName,
    tierName: tier.name,
    runs: safeRuns,
    items,
    ...costs,
    ...profits
  });
}

/**
 * Formats a clean, readable shopping list for clipboard export
 */
export function formatBulkShoppingClipboardText(plan: BulkShoppingPlan): string {
  const lines: string[] = [
    `📋【POE 輿圖策略 ${plan.runs} 場大宗備料採購清單】`,
    `策略分級：${plan.tierName}${plan.strategyName ? ` (${plan.strategyName})` : ''}`,
    `預計場次：${plan.runs} 場`,
    `----------------------------------------`
  ];

  if (plan.items.length === 0) {
    lines.push('（無消耗物資或聖甲蟲，零成本流派）');
  } else {
    plan.items.forEach(i => {
      const typeTag = i.isCraftCost ? '[工藝]' : i.category === 'scarab' ? '[聖甲蟲]' : '[額外道具]';
      lines.push(`${typeTag} ${i.name} x ${i.totalCount}（單場 ${i.perMapCount} 個 | 單價 ${i.unitPriceChaos}c | 小計 ${i.totalCostChaos}c）`);
    });
  }

  lines.push(`----------------------------------------`);
  lines.push(`單場成本：${plan.singleMapCostChaos} c (${plan.singleMapCostDivine} div)`);
  lines.push(`總採購預算：${plan.totalCostChaos} c (${plan.totalCostDivine} div)`);
  if (plan.totalEstimatedGoldFee > 0) {
    lines.push(`Faustus 金幣手續費預估：約 ${plan.totalEstimatedGoldFee.toLocaleString()} Gold (需刷約 ${plan.mapsNeededToFarmGold} 場 T16)`);
  }
  if (plan.estimatedTotalProfitChaos > 0) {
    lines.push(`預估總淨利：${plan.estimatedTotalProfitChaos} c (${plan.estimatedTotalProfitDivine} div)`);
  }

  return lines.join('\n');
}
