import { describe, it, expect } from 'vitest';
import {
  calculateRecipeCost,
  filterRecipes,
  estimateMissionEv,
  formatBeastBulkWhisper,
} from '../beastcraftingEngine';
import { BESTIARY_RECIPES, RED_BEASTS } from '../bestiaryData';
import type { BeastCraftRecipe } from '../types';

describe('beastcraftingEngine', () => {
  describe('calculateRecipeCost', () => {
    const mockRecipe: BeastCraftRecipe = {
      id: 'imprint_magic',
      nameZh: '拓印魔法物品',
      nameEn: 'Create an Imprint of a Magic Item',
      category: 'imprint_split',
      primaryBeastId: 'craicic_chimeral',
      primaryBeastNameZh: '深海奇美拉',
      primaryBeastNameEn: 'Craicic Chimeral',
      yellowBeastCount: 3,
      outputDescriptionZh: '獲得該魔法物品拓印寶珠',
      defaultEstimatedOutputChaos: 420,
    };

    it('should calculate total craft cost and positive net profit', () => {
      const primaryCost = 280;
      const yellowCost = 15; // 3 * 15 = 45 -> total = 325
      const result = calculateRecipeCost(mockRecipe, primaryCost, yellowCost, 450);

      expect(result.recipeId).toBe('imprint_magic');
      expect(result.primaryBeastCostChaos).toBe(280);
      expect(result.yellowBeastCostChaos).toBe(45);
      expect(result.totalCraftCostChaos).toBe(325);
      expect(result.estimatedOutputChaos).toBe(450);
      expect(result.netProfitChaos).toBe(125);
      expect(result.profitMarginPercent).toBe(38.46);
      expect(result.roiStatus).toBe('profitable');
    });

    it('should calculate loss correctly when cost exceeds output', () => {
      const result = calculateRecipeCost(mockRecipe, 300, 20, 320); // total 360, output 320
      expect(result.totalCraftCostChaos).toBe(360);
      expect(result.netProfitChaos).toBe(-40);
      expect(result.roiStatus).toBe('loss');
    });

    it('should use default recipe output if custom output is not specified', () => {
      const result = calculateRecipeCost(mockRecipe, 250, 10); // total 280, default 420
      expect(result.estimatedOutputChaos).toBe(420);
      expect(result.netProfitChaos).toBe(140);
    });
  });

  describe('filterRecipes', () => {
    it('should return all recipes when no filters given', () => {
      const results = filterRecipes(BESTIARY_RECIPES);
      expect(results.length).toBe(BESTIARY_RECIPES.length);
    });

    it('should filter by category correctly', () => {
      const results = filterRecipes(BESTIARY_RECIPES, 'imprint_split');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.category).toBe('imprint_split'));
    });

    it('should filter by search keyword matching Zh name or En name', () => {
      const zhResults = filterRecipes(BESTIARY_RECIPES, undefined, '拓印');
      expect(zhResults.length).toBeGreaterThan(0);
      expect(zhResults[0].nameZh).toContain('拓印');

      const enResults = filterRecipes(BESTIARY_RECIPES, undefined, 'split');
      expect(enResults.length).toBeGreaterThan(0);
      expect(enResults[0].nameEn.toLowerCase()).toContain('split');
    });
  });

  describe('estimateMissionEv', () => {
    it('should estimate white mission EV with lower expected red beasts', () => {
      const result = estimateMissionEv('white', 0);
      expect(result.missionTier).toBe('white');
      expect(result.redBeastsExpected).toBe(1);
      expect(result.yellowBeastsExpected).toBe(2);
      expect(result.expectedGrossChaos).toBeGreaterThan(0);
      expect(result.netProfitChaos).toBe(result.expectedGrossChaos);
    });

    it('should estimate red mission EV with higher expected returns', () => {
      const whiteResult = estimateMissionEv('white', 0);
      const redResult = estimateMissionEv('red', 20);
      expect(redResult.missionTier).toBe('red');
      expect(redResult.redBeastsExpected).toBeGreaterThan(whiteResult.redBeastsExpected);
      expect(redResult.expectedGrossChaos).toBeGreaterThan(whiteResult.expectedGrossChaos);
      expect(redResult.netProfitChaos).toBe(redResult.expectedGrossChaos - 20);
      expect(redResult.topValuedBeasts.length).toBeGreaterThan(0);
    });

    it('should respect custom beast prices in EV estimation', () => {
      const customPrices = { craicic_chimeral: 500 };
      const res = estimateMissionEv('red', 10, customPrices);
      expect(res.expectedGrossChaos).toBeGreaterThan(0);
    });
  });

  describe('formatBeastBulkWhisper', () => {
    it('should format a valid trade whisper for bulk beasts', () => {
      const whisper = formatBeastBulkWhisper('Craicic Chimeral', 5, 280, 'Settlers');
      expect(whisper).toBe(
        "@seller Hi, I'd like to buy your 5 Craicic Chimeral for 1400 chaos in Settlers."
      );
    });
  });

  describe('RED_BEASTS data integrity', () => {
    it('should contain key valuable beasts', () => {
      const ids = RED_BEASTS.map((b) => b.id);
      expect(ids).toContain('craicic_chimeral');
      expect(ids).toContain('fenumal_plagued_arachnid');
      expect(ids).toContain('farric_frost_crawford');
    });
  });
});
