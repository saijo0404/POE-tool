import type { StashItem } from '../wealth/types';
import type { MapDropItem, MapInvestment, MapRun, MappingSessionStats } from './types';
import { computePoe2SessionStats } from './poe2MappingCalculator';

export function calculateInvestmentTotals(
  inv: Omit<MapInvestment, 'totalCostChaos' | 'totalCostDivine'>,
  divRate: number
): MapInvestment {
  const rate = divRate > 0 ? divRate : 150;
  const totalCostChaos = Math.round(
    (inv.mapCostChaos + inv.scarabsCostChaos + inv.craftCostChaos + inv.otherCostChaos) * 100
  ) / 100;
  const totalCostDivine = Math.round((totalCostChaos / rate) * 100) / 100;

  return {
    ...inv,
    totalCostChaos,
    totalCostDivine
  };
}

function normalizeTabName(name: string): string {
  return name.replace(/^倉庫:\s*/, '').trim();
}

function isTabSelected(tabName: string, selectedTabNames?: string[]): boolean {
  if (!selectedTabNames || selectedTabNames.length === 0) return true;
  const norm = normalizeTabName(tabName);
  return selectedTabNames.some(t => normalizeTabName(t) === norm);
}

function buildItemKey(item: StashItem): string {
  const cleanTab = normalizeTabName(item.tabName);
  return `${cleanTab}::${item.name || ''}::${item.typeLine}::${item.category}`;
}

export function computeItemDeltas(
  beforeItems: StashItem[],
  afterItems: StashItem[],
  divRate: number,
  bulkMultiplier: number = 1.0,
  selectedTabNames?: string[]
): MapDropItem[] {
  const rate = divRate > 0 ? divRate : 150;
  const multiplier = bulkMultiplier > 0 ? bulkMultiplier : 1.0;

  const beforeMap = new Map<string, { count: number; item: StashItem }>();
  for (const item of beforeItems) {
    if (!isTabSelected(item.tabName, selectedTabNames)) continue;
    const key = buildItemKey(item);
    const existing = beforeMap.get(key);
    const count = (existing?.count || 0) + (item.stackSize || 1);
    beforeMap.set(key, { count, item });
  }

  const afterMap = new Map<string, { count: number; item: StashItem }>();
  for (const item of afterItems) {
    if (!isTabSelected(item.tabName, selectedTabNames)) continue;
    const key = buildItemKey(item);
    const existing = afterMap.get(key);
    const count = (existing?.count || 0) + (item.stackSize || 1);
    afterMap.set(key, { count, item });
  }

  const drops: MapDropItem[] = [];
  for (const [key, afterEntry] of afterMap.entries()) {
    const beforeCount = beforeMap.get(key)?.count || 0;
    const delta = afterEntry.count - beforeCount;
    if (delta <= 0) continue;

    const unitPriceChaos = Math.round(afterEntry.item.unitPriceChaos * multiplier * 100) / 100;
    const totalPriceChaos = Math.round(delta * unitPriceChaos * 100) / 100;
    const unitPriceDivine = Math.round((unitPriceChaos / rate) * 1000) / 1000;
    const totalPriceDivine = Math.round((totalPriceChaos / rate) * 100) / 100;

    drops.push({
      id: `${afterEntry.item.id || key}_delta_${Date.now()}`,
      name: afterEntry.item.name || afterEntry.item.typeLine,
      typeLine: afterEntry.item.typeLine,
      icon: afterEntry.item.icon,
      category: afterEntry.item.category,
      deltaCount: delta,
      unitPriceChaos,
      totalPriceChaos,
      unitPriceDivine,
      totalPriceDivine
    });
  }

  return drops.sort((a, b) => b.totalPriceChaos - a.totalPriceChaos);
}

export function computeMapRunProfit(
  drops: MapDropItem[],
  investment: MapInvestment,
  divRate: number
): {
  grossRevenueChaos: number;
  grossRevenueDivine: number;
  netProfitChaos: number;
  netProfitDivine: number;
} {
  const rate = divRate > 0 ? divRate : 150;
  const grossRevenueChaos = Math.round(
    drops.reduce((sum, d) => sum + d.totalPriceChaos, 0) * 100
  ) / 100;
  const grossRevenueDivine = Math.round((grossRevenueChaos / rate) * 100) / 100;

  const netProfitChaos = Math.round((grossRevenueChaos - investment.totalCostChaos) * 100) / 100;
  const netProfitDivine = Math.round((netProfitChaos / rate) * 100) / 100;

  return {
    grossRevenueChaos,
    grossRevenueDivine,
    netProfitChaos,
    netProfitDivine
  };
}

export function computeSessionStats(
  runs: MapRun[],
  sessionDurationSeconds: number,
  divRate: number
): MappingSessionStats {
  const rate = divRate > 0 ? divRate : 150;
  const totalRuns = runs.length;
  const totalDurationSeconds = runs.reduce((sum, r) => sum + r.durationSeconds, 0);
  const avgDurationSeconds = totalRuns > 0 ? Math.round(totalDurationSeconds / totalRuns) : 0;

  const totalCostChaos = Math.round(runs.reduce((sum, r) => sum + r.investment.totalCostChaos, 0) * 100) / 100;
  const totalCostDivine = Math.round((totalCostChaos / rate) * 100) / 100;

  const totalRevenueChaos = Math.round(runs.reduce((sum, r) => sum + r.grossRevenueChaos, 0) * 100) / 100;
  const totalRevenueDivine = Math.round(runs.reduce((sum, r) => sum + r.grossRevenueDivine, 0) * 100) / 100;

  const totalNetProfitChaos = Math.round(runs.reduce((sum, r) => sum + r.netProfitChaos, 0) * 100) / 100;
  const totalNetProfitDivine = Math.round((totalNetProfitChaos / rate) * 100) / 100;

  const activeHours = totalDurationSeconds / 3600;
  const sessionHours = Math.max(sessionDurationSeconds, totalDurationSeconds) / 3600;

  const activeMappingDivPerHour = activeHours > 0 ? Math.round((totalNetProfitDivine / activeHours) * 100) / 100 : 0;
  const activeMappingChaosPerHour = activeHours > 0 ? Math.round((totalNetProfitChaos / activeHours) * 100) / 100 : 0;

  const sessionTotalDivPerHour = sessionHours > 0 ? Math.round((totalNetProfitDivine / sessionHours) * 100) / 100 : 0;
  const sessionTotalChaosPerHour = sessionHours > 0 ? Math.round((totalNetProfitChaos / sessionHours) * 100) / 100 : 0;

  const allDropsMerged = mergeSessionDrops(runs);
  const poe2Stats = computePoe2SessionStats(runs, sessionDurationSeconds);

  return {
    totalRuns,
    totalDurationSeconds,
    avgDurationSeconds,
    totalCostChaos,
    totalCostDivine,
    totalRevenueChaos,
    totalRevenueDivine,
    totalNetProfitChaos,
    totalNetProfitDivine,
    activeMappingDivPerHour,
    activeMappingChaosPerHour,
    sessionTotalDivPerHour,
    sessionTotalChaosPerHour,
    topDrops: allDropsMerged.slice(0, 10),
    ...poe2Stats
  };
}

function mergeSessionDrops(runs: MapRun[]): MapDropItem[] {
  const map = new Map<string, MapDropItem>();
  for (const run of runs) {
    for (const drop of run.drops) {
      const key = `${drop.name}::${drop.typeLine}::${drop.category}`;
      const existing = map.get(key);
      if (existing) {
        existing.deltaCount += drop.deltaCount;
        existing.totalPriceChaos = Math.round((existing.totalPriceChaos + drop.totalPriceChaos) * 100) / 100;
        existing.totalPriceDivine = Math.round((existing.totalPriceDivine + drop.totalPriceDivine) * 100) / 100;
      } else {
        map.set(key, { ...drop });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalPriceChaos - a.totalPriceChaos);
}
