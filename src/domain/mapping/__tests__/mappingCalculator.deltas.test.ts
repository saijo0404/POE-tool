import { describe, it, expect } from 'vitest';
import type { StashItem } from '../../wealth/types';
import {
  calculateInvestmentTotals,
  computeItemDeltas
} from '../mappingCalculator';

describe('mappingCalculator - Deltas & Investment Suite', () => {
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
});
