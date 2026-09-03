import { describe, it, expect } from 'vitest';
import {
  calculateConfidence95,
  filterAvailableMods,
  evaluateCraftingActuary
} from '../craftingCalculator';
import { CRAFT_BASES } from '../basesDatabase';
import { CRAFT_MODS } from '../modDatabase';
import type { TargetModSelection } from '../types';

describe('craftingCalculator Domain Unit Tests', () => {
  describe('calculateConfidence95', () => {
    it('should calculate accurate 95% confidence attempt count', () => {
      // P = 0.5 -> 5 attempts (1 - 0.5^5 = 0.96875 >= 0.95)
      expect(calculateConfidence95(0.5)).toBe(5);
      // P = 0.1 -> ceil(ln(0.05) / ln(0.9)) = ceil(-2.9957 / -0.10536) = 29
      expect(calculateConfidence95(0.1)).toBe(29);
      // Edge cases
      expect(calculateConfidence95(1)).toBe(1);
      expect(calculateConfidence95(0)).toBe(0);
    });
  });

  describe('filterAvailableMods', () => {
    it('should filter mods by itemClass and ilvl', () => {
      const bodyArmour = CRAFT_BASES.find(b => b.id === 'sadist_garb')!;
      const available = filterAvailableMods(bodyArmour, 86, CRAFT_MODS);

      expect(available.length).toBeGreaterThan(0);
      // Boots movement speed should not be present on body armour
      expect(available.some(m => m.id === 'movement_speed')).toBe(false);
      // Maximum life should be available
      expect(available.some(m => m.id === 'maximum_life')).toBe(true);
    });

    it('should exclude suppression if base attribute is not dex', () => {
      const astralPlate = CRAFT_BASES.find(b => b.id === 'astral_plate')!; // STR base
      const available = filterAvailableMods(astralPlate, 86, CRAFT_MODS);
      expect(available.some(m => m.id === 'spell_suppression')).toBe(false);

      const sadistGarb = CRAFT_BASES.find(b => b.id === 'sadist_garb')!; // DEX/INT base
      const availableDex = filterAvailableMods(sadistGarb, 86, CRAFT_MODS);
      expect(availableDex.some(m => m.id === 'spell_suppression')).toBe(true);
    });
  });

  describe('evaluateCraftingActuary', () => {
    it('should return valid evaluations and recommend the most cost-effective method', () => {
      const base = CRAFT_BASES.find(b => b.id === 'sadist_garb')!;
      const targetMods: TargetModSelection[] = [
        { modId: 'maximum_life', maxTier: 1 },
        { modId: 'fire_resistance', maxTier: 2 }
      ];

      const result = evaluateCraftingActuary({
        baseItem: base,
        ilvl: 86,
        targetMods,
        divineRate: 150
      });

      expect(result.evaluations.length).toBeGreaterThan(0);
      expect(result.activeTargetModsCount).toBe(2);
      expect(result.recommendedMethod).toBeDefined();
      expect(result.recommendedMethod.isRecommended).toBe(true);

      // Verify each evaluation has valid positive numbers
      result.evaluations.forEach(ev => {
        expect(ev.averageAttempts).toBeGreaterThan(0);
        expect(ev.totalExpectedCostChaos).toBeGreaterThan(0);
        expect(ev.confidence95Attempts).toBeGreaterThanOrEqual(ev.averageAttempts);
      });

      // Verify Essence evaluation uses Greed or resistance
      const essenceEval = result.evaluations.find(e => e.method === 'essence');
      expect(essenceEval).toBeDefined();
      expect(essenceEval?.essenceUsed).toBeDefined();

      // Verify Fossil evaluation
      const fossilEval = result.evaluations.find(e => e.method === 'fossil');
      expect(fossilEval).toBeDefined();
      expect(fossilEval?.fossilCombo).toBeDefined();
    });

    it('should handle zero target mods gracefully', () => {
      const base = CRAFT_BASES.find(b => b.id === 'sadist_garb')!;
      const result = evaluateCraftingActuary({
        baseItem: base,
        ilvl: 86,
        targetMods: [],
        divineRate: 150
      });

      expect(result.activeTargetModsCount).toBe(0);
      expect(result.evaluations.length).toBeGreaterThan(0);
      expect(result.recommendedMethod.averageAttempts).toBe(1);
    });
  });
});
