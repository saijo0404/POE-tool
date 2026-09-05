import { describe, it, expect } from 'vitest';
import {
  calculateMapPerformanceHeatmap,
  type HeatmapAnalysisResult
} from '../mapDropHeatmap';
import type { MapRun, MapInvestment } from '../types';

describe('mapDropHeatmap', () => {
  const dummyInvestment: MapInvestment = {
    mapCostChaos: 5,
    scarabsCostChaos: 20,
    craftCostChaos: 8,
    otherCostChaos: 0,
    totalCostChaos: 33,
    totalCostDivine: 0.22
  };

  const createMockRun = (
    mapName: string,
    netProfit: number,
    durationSec: number,
    topDrop?: { name: string; price: number }
  ): MapRun => ({
    id: `run_${Math.random()}`,
    runNumber: 1,
    mapName,
    startTime: 1000,
    endTime: 1000 + durationSec,
    durationSeconds: durationSec,
    investment: dummyInvestment,
    grossRevenueChaos: netProfit + 33,
    grossRevenueDivine: (netProfit + 33) / 150,
    netProfitChaos: netProfit,
    netProfitDivine: netProfit / 150,
    drops: topDrop
      ? [
          {
            id: 'drop_1',
            name: topDrop.name,
            typeLine: topDrop.name,
            icon: '',
            category: 'Currency',
            deltaCount: 1,
            unitPriceChaos: topDrop.price,
            totalPriceChaos: topDrop.price,
            unitPriceDivine: topDrop.price / 150,
            totalPriceDivine: topDrop.price / 150
          }
        ]
      : [],
    tabNames: ['dump']
  });

  it('returns empty result when no runs provided', () => {
    const res = calculateMapPerformanceHeatmap([], 150);
    expect(res.totalAnalyzedRuns).toBe(0);
    expect(res.totalUniqueMaps).toBe(0);
    expect(res.maps).toEqual([]);
    expect(res.bestYieldMap).toBeUndefined();
  });

  it('aggregates runs by map name and calculates average profit and divine rate', () => {
    const runs: MapRun[] = [
      createMockRun('幽閉墓穴 (Dunes)', 60, 180, { name: '神聖石', price: 150 }),
      createMockRun('幽閉墓穴 (Dunes)', 40, 120),
      createMockRun('劇毒林地 (Toxic Sewer)', 80, 150, { name: '啟蒙輔助', price: 300 }),
      createMockRun('劇毒林地 (Toxic Sewer)', 70, 150)
    ];

    const result: HeatmapAnalysisResult = calculateMapPerformanceHeatmap(runs, 150);

    expect(result.totalAnalyzedRuns).toBe(4);
    expect(result.totalUniqueMaps).toBe(2);

    const toxic = result.maps.find(m => m.mapName === '劇毒林地 (Toxic Sewer)');
    expect(toxic).toBeDefined();
    expect(toxic?.totalRuns).toBe(2);
    expect(toxic?.totalNetProfitChaos).toBe(150);
    expect(toxic?.avgNetProfitChaos).toBe(75);
    expect(toxic?.topDropName).toBe('啟蒙輔助');
    expect(toxic?.recommendationStars).toBeGreaterThanOrEqual(4);

    const dunes = result.maps.find(m => m.mapName === '幽閉墓穴 (Dunes)');
    expect(dunes).toBeDefined();
    expect(dunes?.totalRuns).toBe(2);
    expect(dunes?.avgNetProfitChaos).toBe(50);
    expect(dunes?.topDropName).toBe('神聖石');

    expect(result.bestYieldMap?.mapName).toBe('劇毒林地 (Toxic Sewer)');
  });

  it('correctly handles runs without explicit mapName using fallback', () => {
    const unassignedRun = createMockRun('', 30, 100);
    delete (unassignedRun as Partial<MapRun>).mapName;

    const result = calculateMapPerformanceHeatmap([unassignedRun], 150);
    expect(result.maps[0].mapName).toContain('標準地圖');
  });
});
