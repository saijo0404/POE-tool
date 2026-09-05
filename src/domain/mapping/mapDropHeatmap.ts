import type { MapRun, MapDropItem } from './types';

export interface MapPerformanceStats {
  mapName: string;
  tier?: number;
  totalRuns: number;
  totalNetProfitChaos: number;
  avgNetProfitChaos: number;
  totalDurationSeconds: number;
  divinePerHour: number;
  topDropName?: string;
  topDropValueChaos?: number;
  yieldScore: number;
  recommendationStars: number;
}

export interface HeatmapAnalysisResult {
  totalAnalyzedRuns: number;
  totalUniqueMaps: number;
  bestYieldMap?: MapPerformanceStats;
  maps: MapPerformanceStats[];
}

function findTopDropInRuns(runs: MapRun[]): { name: string; value: number } | undefined {
  let bestItem: MapDropItem | undefined;
  for (const r of runs) {
    for (const d of r.drops) {
      if (!bestItem || d.totalPriceChaos > bestItem.totalPriceChaos) {
        bestItem = d;
      }
    }
  }
  return bestItem ? { name: bestItem.name, value: bestItem.totalPriceChaos } : undefined;
}

function calculateStars(score: number): number {
  if (score >= 80) return 5;
  if (score >= 65) return 4;
  if (score >= 45) return 3;
  if (score >= 25) return 2;
  return 1;
}

function calculateYieldScore(avgNetChaos: number, divPerHour: number): number {
  const chaosPart = Math.min(50, Math.max(0, avgNetChaos * 0.6));
  const divPart = Math.min(50, Math.max(0, divPerHour * 5));
  return Math.round(Math.min(100, Math.max(0, chaosPart + divPart)));
}

function summarizeMapGroup(name: string, groupRuns: MapRun[], divineRate: number): MapPerformanceStats {
  const count = groupRuns.length;
  const totalNet = groupRuns.reduce((sum, r) => sum + r.netProfitChaos, 0);
  const totalSec = groupRuns.reduce((sum, r) => sum + r.durationSeconds, 0);
  const avgNet = Math.round((totalNet / count) * 10) / 10;
  const safeDivRate = divineRate > 0 ? divineRate : 150;
  const divPerHour = totalSec > 0
    ? Math.round(((totalNet / safeDivRate) / (totalSec / 3600)) * 100) / 100
    : 0;

  const topDrop = findTopDropInRuns(groupRuns);
  const score = calculateYieldScore(avgNet, divPerHour);
  const stars = calculateStars(score);

  return {
    mapName: name,
    tier: groupRuns[0]?.mapTier,
    totalRuns: count,
    totalNetProfitChaos: Math.round(totalNet * 10) / 10,
    avgNetProfitChaos: avgNet,
    totalDurationSeconds: totalSec,
    divinePerHour: divPerHour,
    topDropName: topDrop?.name,
    topDropValueChaos: topDrop?.value,
    yieldScore: score,
    recommendationStars: stars
  };
}

export function calculateMapPerformanceHeatmap(
  runs: MapRun[],
  divineRate = 150
): HeatmapAnalysisResult {
  if (!runs || runs.length === 0) {
    return { totalAnalyzedRuns: 0, totalUniqueMaps: 0, maps: [] };
  }

  const groups = new Map<string, MapRun[]>();
  for (const r of runs) {
    const rawName = r.mapName?.trim();
    const key = rawName && rawName.length > 0 ? rawName : '標準地圖 (Standard Run)';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const mapStatsList: MapPerformanceStats[] = [];
  for (const [name, groupRuns] of groups.entries()) {
    mapStatsList.push(summarizeMapGroup(name, groupRuns, divineRate));
  }

  mapStatsList.sort((a, b) => b.yieldScore - a.yieldScore || b.avgNetProfitChaos - a.avgNetProfitChaos);

  return {
    totalAnalyzedRuns: runs.length,
    totalUniqueMaps: groups.size,
    bestYieldMap: mapStatsList[0],
    maps: mapStatsList
  };
}
