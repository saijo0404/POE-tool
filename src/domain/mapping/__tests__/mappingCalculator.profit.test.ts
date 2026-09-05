import { describe, it, expect } from 'vitest';
import type { MapInvestment, MapRun } from '../types';
import {
  computeMapRunProfit,
  computeSessionStats
} from '../mappingCalculator';

describe('mappingCalculator - Profit & Session Stats Suite', () => {
  const investment: MapInvestment = {
    mapCostChaos: 5,
    scarabsCostChaos: 20,
    craftCostChaos: 4,
    otherCostChaos: 0,
    totalCostChaos: 29,
    totalCostDivine: 0.19
  };

  describe('computeMapRunProfit', () => {
    it('should calculate gross revenue and net profit', () => {
      const drops = [
        {
          id: 'd1',
          name: 'Divine Orb',
          typeLine: 'Divine Orb',
          icon: '',
          category: 'Currency' as const,
          deltaCount: 1,
          unitPriceChaos: 150,
          totalPriceChaos: 150,
          unitPriceDivine: 1,
          totalPriceDivine: 1
        },
        {
          id: 'd2',
          name: 'Chaos Orb',
          typeLine: 'Chaos Orb',
          icon: '',
          category: 'Currency' as const,
          deltaCount: 20,
          unitPriceChaos: 1,
          totalPriceChaos: 20,
          unitPriceDivine: 0.007,
          totalPriceDivine: 0.13
        }
      ];

      const profit = computeMapRunProfit(drops, investment, 150);
      expect(profit.grossRevenueChaos).toBe(170);
      expect(profit.grossRevenueDivine).toBe(1.13);
      expect(profit.netProfitChaos).toBe(141);
      expect(profit.netProfitDivine).toBe(0.94);
    });

    it('should handle zero drops resulting in negative net profit', () => {
      const profit = computeMapRunProfit([], investment, 150);
      expect(profit.grossRevenueChaos).toBe(0);
      expect(profit.netProfitChaos).toBe(-29);
      expect(profit.netProfitDivine).toBe(-0.19);
    });
  });

  describe('computeSessionStats', () => {
    const sessionInvestment: MapInvestment = {
      mapCostChaos: 5,
      scarabsCostChaos: 20,
      craftCostChaos: 5,
      otherCostChaos: 0,
      totalCostChaos: 30,
      totalCostDivine: 0.2
    };

    const run1: MapRun = {
      id: 'r1',
      runNumber: 1,
      startTime: 1000,
      endTime: 1180,
      durationSeconds: 180,
      investment: sessionInvestment,
      grossRevenueChaos: 180,
      grossRevenueDivine: 1.2,
      netProfitChaos: 150,
      netProfitDivine: 1.0,
      drops: [
        {
          id: 'd1',
          name: 'Divine Orb',
          typeLine: 'Divine Orb',
          icon: '',
          category: 'Currency',
          deltaCount: 1,
          unitPriceChaos: 150,
          totalPriceChaos: 150,
          unitPriceDivine: 1,
          totalPriceDivine: 1
        }
      ],
      tabNames: ['Dump 1']
    };

    const run2: MapRun = {
      id: 'r2',
      runNumber: 2,
      startTime: 1200,
      endTime: 1380,
      durationSeconds: 180,
      investment: sessionInvestment,
      grossRevenueChaos: 330,
      grossRevenueDivine: 2.2,
      netProfitChaos: 300,
      netProfitDivine: 2.0,
      drops: [
        {
          id: 'd2',
          name: 'Divine Orb',
          typeLine: 'Divine Orb',
          icon: '',
          category: 'Currency',
          deltaCount: 2,
          unitPriceChaos: 150,
          totalPriceChaos: 300,
          unitPriceDivine: 1,
          totalPriceDivine: 2
        }
      ],
      tabNames: ['Dump 1']
    };

    it('should compute comprehensive session stats and accurate Div/hr', () => {
      const stats = computeSessionStats([run1, run2], 600, 150);
      expect(stats.totalRuns).toBe(2);
      expect(stats.totalDurationSeconds).toBe(360);
      expect(stats.avgDurationSeconds).toBe(180);
      expect(stats.totalCostChaos).toBe(60);
      expect(stats.totalNetProfitChaos).toBe(450);
      expect(stats.totalNetProfitDivine).toBe(3.0);
      expect(stats.activeMappingDivPerHour).toBe(30);
      expect(stats.sessionTotalDivPerHour).toBe(18);
      expect(stats.topDrops).toHaveLength(1);
      expect(stats.topDrops[0].deltaCount).toBe(3);
    });

    it('should return safe zero stats when runs list is empty', () => {
      const stats = computeSessionStats([], 0, 150);
      expect(stats.totalRuns).toBe(0);
      expect(stats.avgDurationSeconds).toBe(0);
      expect(stats.totalNetProfitDivine).toBe(0);
      expect(stats.activeMappingDivPerHour).toBe(0);
      expect(stats.sessionTotalDivPerHour).toBe(0);
    });
  });
});
