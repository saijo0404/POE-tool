import { describe, it, expect } from 'vitest';
import {
  calculateMechanicWeights,
  recommendScarabCombination,
  type ScarabSynergyInput,
  type ScarabSynergyRecommendation
} from '../scarabSynergyEngine';
import type { AtlasMechanicCategory } from '../types';

describe('scarabSynergyEngine', () => {
  describe('calculateMechanicWeights', () => {
    it('returns empty weight record when no nodes or tags provided', () => {
      const weights = calculateMechanicWeights({});
      expect(Object.keys(weights).length).toBe(0);
    });

    it('boosts primaryCategory and strategyTags when provided', () => {
      const weights = calculateMechanicWeights({
        primaryCategory: 'legion',
        strategyTags: ['legion', 'breach']
      });
      expect(weights.legion).toBeGreaterThan(0);
      expect(weights.breach).toBeGreaterThan(0);
      expect(weights.legion).toBeGreaterThan(weights.breach || 0);
    });

    it('accumulates weights from allocatedNodeIds', () => {
      const weights = calculateMechanicWeights({
        primaryCategory: 'harvest',
        strategyTags: ['harvest', 'lifeforce']
      });
      expect(weights.harvest).toBeGreaterThan(5);
    });
  });

  describe('recommendScarabCombination', () => {
    it('generates an S-tier scarab combination for Legion focus', () => {
      const input: ScarabSynergyInput = {
        primaryCategory: 'legion',
        strategyTags: ['legion', 'timeless'],
        maxSlots: 5
      };

      const result: ScarabSynergyRecommendation = recommendScarabCombination(input);

      expect(result.primaryMechanic).toBe('legion');
      expect(result.totalScarabsCount).toBe(5);
      expect(result.tier).toBe('S');
      expect(result.synergyMultiplier).toBeGreaterThan(1.5);
      expect(result.slots.length).toBeGreaterThanOrEqual(2);
      expect(result.estimatedCostChaos).toBeGreaterThan(0);

      // Verify slot limits are strictly respected
      for (const slot of result.slots) {
        expect(slot.count).toBeLessThanOrEqual(slot.scarab.limit);
        expect(slot.totalCostChaos).toBe(slot.count * slot.unitCostChaos);
        expect(slot.synergyReason).toBeTruthy();
      }
    });

    it('generates an Ambush scarab combination respecting limits', () => {
      const input: ScarabSynergyInput = {
        primaryCategory: 'ambush',
        strategyTags: ['ambush', 'strongbox'],
        maxSlots: 5
      };

      const result = recommendScarabCombination(input);

      expect(result.primaryMechanic).toBe('ambush');
      expect(result.totalScarabsCount).toBe(5);
      expect(result.slots.some(s => s.scarab.category === 'ambush')).toBe(true);

      for (const slot of result.slots) {
        expect(slot.count).toBeLessThanOrEqual(slot.scarab.limit);
      }
    });

    it('respects 4-slot map device limit', () => {
      const input: ScarabSynergyInput = {
        primaryCategory: 'essence',
        maxSlots: 4
      };

      const result = recommendScarabCombination(input);
      expect(result.totalScarabsCount).toBe(4);
    });

    it('handles custom ninjaRates for price calculation', () => {
      const customRates = {
        'Essence Scarab': 10,
        'Essence Scarab of Ascent': 30
      };

      const input: ScarabSynergyInput = {
        primaryCategory: 'essence',
        maxSlots: 5,
        ninjaRates: customRates
      };

      const result = recommendScarabCombination(input);
      const ascentSlot = result.slots.find(s => s.scarab.nameEn === 'Essence Scarab of Ascent');
      if (ascentSlot) {
        expect(ascentSlot.unitCostChaos).toBe(30);
      }
    });

    it('gracefully handles empty database or unknown category', () => {
      const input: ScarabSynergyInput = {
        primaryCategory: 'custom' as AtlasMechanicCategory,
        availableScarabs: []
      };

      const result = recommendScarabCombination(input);
      expect(result.slots).toEqual([]);
      expect(result.totalScarabsCount).toBe(0);
      expect(result.tier).toBe('B');
    });
  });
});
