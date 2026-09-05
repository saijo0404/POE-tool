import type {
  ArbitrageRecommendation,
  BlightedMapType,
  BlightMapCalculation,
  BlightOil,
  NotableAnointment,
  OilArbitrageResult,
} from './types';
import { BLIGHT_OILS } from './blightData';

function determineRecommendation(profit: number): ArbitrageRecommendation {
  if (profit > 0) return 'upgrade';
  if (profit < 0) return 'sell_raw';
  return 'neutral';
}

export function calculateOilArbitrage(
  fromOil: BlightOil,
  toOil: BlightOil,
  fromPrice: number,
  toPrice: number
): OilArbitrageResult {
  const threeToOneCost = fromPrice * 3;
  const profit = Number((toPrice - threeToOneCost).toFixed(2));

  return {
    fromOilId: fromOil.id,
    toOilId: toOil.id,
    fromOilPriceChaos: fromPrice,
    toOilPriceChaos: toPrice,
    threeToOneCostChaos: threeToOneCost,
    arbitrageProfitChaos: profit,
    recommendation: determineRecommendation(profit),
  };
}

export function calculateAllUpgrades(
  oils: BlightOil[],
  priceMap: Record<string, number>
): OilArbitrageResult[] {
  const sorted = [...oils].sort((a, b) => a.tier - b.tier);
  const results: OilArbitrageResult[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const fromOil = sorted[i];
    const toOil = sorted[i + 1];
    const fromPrice = priceMap[fromOil.id] ?? fromOil.defaultPriceChaos;
    const toPrice = priceMap[toOil.id] ?? toOil.defaultPriceChaos;
    results.push(calculateOilArbitrage(fromOil, toOil, fromPrice, toPrice));
  }

  return results;
}

export function findAnointmentByNotable(
  keyword: string,
  anointments: NotableAnointment[]
): NotableAnointment[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return anointments;

  return anointments.filter(
    (a) =>
      a.notableNameZh.toLowerCase().includes(q) ||
      a.notableNameEn.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
  );
}

interface OilModifiers {
  qty: number;
  pack: number;
  lucky: number;
  mult: number;
}

function accumulateOilModifiers(oilIds: string[]): OilModifiers {
  let qty = 0;
  let pack = 0;
  let lucky = 0;
  let mult = 1.0;

  for (const id of oilIds) {
    if (id === 'crimson') lucky += 10;
    else if (id === 'opal') { qty += 20; pack += 25; }
    else if (id === 'azure') qty += 15;
    else if (id === 'indigo') pack += 20;
    else if (id === 'verdant') pack += 15;
    else if (id === 'golden') mult += 0.25;
    else if (id === 'silver') mult += 0.15;
  }
  return { qty, pack, lucky, mult };
}

export function calculateBlightMapEv(
  mapType: BlightedMapType,
  oilIds: string[],
  baseMapCost: number,
  customOilPrices?: Record<string, number>
): BlightMapCalculation {
  const maxOils = mapType === 'blighted' ? 3 : 9;
  const activeOils = oilIds.slice(0, maxOils);

  let totalOilCost = 0;
  for (const id of activeOils) {
    const oil = BLIGHT_OILS.find((o) => o.id === id);
    totalOilCost += customOilPrices?.[id] ?? oil?.defaultPriceChaos ?? 1;
  }

  const { qty, pack, lucky, mult } = accumulateOilModifiers(activeOils);
  const baseGross = mapType === 'blighted' ? 80 : 320;
  const gross = Math.round(
    baseGross * (1 + qty / 100) * (1 + pack / 200) * (1 + lucky / 100) * mult
  );

  const totalCost = baseMapCost + totalOilCost;
  const netProfit = gross - totalCost;
  const roi = totalCost > 0 ? Number(((netProfit / totalCost) * 100).toFixed(1)) : 0;

  return {
    mapType,
    selectedOilIds: activeOils,
    totalOilCostChaos: Number(totalOilCost.toFixed(1)),
    baseMapCostChaos: baseMapCost,
    quantityBonusPercent: qty,
    packSizeBonusPercent: pack,
    luckyChestChancePercent: lucky,
    estimatedGrossChaos: gross,
    estimatedNetProfitChaos: netProfit,
    roiPercent: roi,
  };
}
