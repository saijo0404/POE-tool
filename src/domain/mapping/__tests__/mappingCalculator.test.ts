import { describe, it, expect } from 'vitest';
import type { StashItem } from '../../wealth/types';
import type { MapInvestment, MapRun } from '../types';
import {
  calculateInvestmentTotals,
  computeItemDeltas,
  computeMapRunProfit,
  computeSessionStats
} from '../mappingCalculator';

describe('mappingCalculator', () => {
  describe('calculateInvestmentTotals', () => {
    it('should correctly sum chaos costs and convert to divine', () => {
      const inv = {
        mapCostChaos: 10,
        scarabsCostChaos: 40,
        craftCostChaos: 12,
        otherCostChaos: 3
      };
      const result = calculateInvestmentTotals(inv, 130);
      expect(result.totalCostChaos).toBe(65);
      expect(result.totalCostDivine).toBe(0.5);
    });

    it('should fallback to 150 divine rate if invalid or zero', () => {
      const inv = {
        mapCostChaos: 15,
        scarabsCostChaos: 0,
        craftCostChaos: 0,
        otherCostChaos: 0
      };
      const result = calculateInvestmentTotals(inv, 0);
      expect(result.totalCostChaos).toBe(15);
      expect(result.totalCostDivine).toBe(0.1);
    });
  });

  describe('computeItemDeltas', () => {
    const mockBefore: StashItem[] = [
      {
        id: '1',
        name: 'Chaos Orb',
        typeLine: 'Chaos Orb',
        icon: 'chaos.png',
        stackSize: 20,
        tabName: '倉庫: Dump 1',
        category: 'Currency',
        unitPriceChaos: 1,
        totalPriceChaos: 20,
        unitPriceDivine: 0.007,
        totalPriceDivine: 0.13
      },
      {
        id: '2',
        name: 'Divine Orb',
        typeLine: 'Divine Orb',
        icon: 'divine.png',
        stackSize: 1,
        tabName: '倉庫: Currency',
        category: 'Currency',
        unitPriceChaos: 150,
        totalPriceChaos: 150,
        unitPriceDivine: 1,
        totalPriceDivine: 1
      }
    ];

    const mockAfter: StashItem[] = [
      {
        id: '1',
        name: 'Chaos Orb',
        typeLine: 'Chaos Orb',
        icon: 'chaos.png',
        stackSize: 35,
        tabName: '倉庫: Dump 1',
        category: 'Currency',
        unitPriceChaos: 1,
        totalPriceChaos: 35,
        unitPriceDivine: 0.007,
        totalPriceDivine: 0.23
      },
      {
        id: '2',
        name: 'Divine Orb',
        typeLine: 'Divine Orb',
        icon: 'divine.png',
        stackSize: 2,
        tabName: '倉庫: Currency',
        category: 'Currency',
        unitPriceChaos: 150,
        totalPriceChaos: 300,
        unitPriceDivine: 1,
        totalPriceDivine: 2
      },
      {
        id: '3',
        name: 'Scarab of Monstrous Lineage',
        typeLine: 'Scarab of Monstrous Lineage',
        icon: 'scarab.png',
        stackSize: 4,
        tabName: '倉庫: Dump 1',
        category: 'Scarab',
        unitPriceChaos: 10,
        totalPriceChaos: 40,
        unitPriceDivine: 0.067,
        totalPriceDivine: 0.27
      }
    ];

    it('should compute exact item deltas for all tabs when no tab filter is provided', () => {
      const deltas = computeItemDeltas(mockBefore, mockAfter, 150);
      expect(deltas).toHaveLength(3);

      const divDelta = deltas.find(d => d.name === 'Divine Orb');
      expect(divDelta?.deltaCount).toBe(1);
      expect(divDelta?.totalPriceChaos).toBe(150);
      expect(divDelta?.totalPriceDivine).toBe(1);

      const chaosDelta = deltas.find(d => d.name === 'Chaos Orb');
      expect(chaosDelta?.deltaCount).toBe(15);
      expect(chaosDelta?.totalPriceChaos).toBe(15);

      const scarabDelta = deltas.find(d => d.name === 'Scarab of Monstrous Lineage');
      expect(scarabDelta?.deltaCount).toBe(4);
      expect(scarabDelta?.totalPriceChaos).toBe(40);
    });

    it('should filter only items belonging to selected Dump Tab', () => {
      const deltas = computeItemDeltas(mockBefore, mockAfter, 150, 1.0, ['Dump 1']);
      expect(deltas).toHaveLength(2);
      expect(deltas.some(d => d.name === 'Divine Orb')).toBe(false);
      expect(deltas.some(d => d.name === 'Chaos Orb')).toBe(true);
      expect(deltas.some(d => d.name === 'Scarab of Monstrous Lineage')).toBe(true);
    });

    it('should apply bulk multiplier if provided', () => {
      const deltas = computeItemDeltas(mockBefore, mockAfter, 150, 1.2, ['Dump 1']);
      const scarab = deltas.find(d => d.name === 'Scarab of Monstrous Lineage');
      expect(scarab?.unitPriceChaos).toBe(12);
      expect(scarab?.totalPriceChaos).toBe(48);
    });

    it('should ignore negative or zero deltas', () => {
      const deltas = computeItemDeltas(mockAfter, mockBefore, 150);
      expect(deltas).toHaveLength(0);
    });
  });

  describe('computeMapRunProfit', () => {
    const investment: MapInvestment = {
      mapCostChaos: 5,
      scarabsCostChaos: 20,
      craftCostChaos: 4,
      otherCostChaos: 0,
      totalCostChaos: 29,
      totalCostDivine: 0.19
    };

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
    const investment: MapInvestment = {
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
      investment,
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
      investment,
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

      // Active mapping time = 360s = 0.1 hr -> 3.0 Div / 0.1 = 30 Div/hr
      expect(stats.activeMappingDivPerHour).toBe(30);

      // Total session time = 600s = 0.1667 hr -> 3.0 Div / 0.1667 hr = 18 Div/hr
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
