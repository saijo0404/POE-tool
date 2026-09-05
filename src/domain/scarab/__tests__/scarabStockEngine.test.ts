import { describe, it, expect } from 'vitest';
import { auditScarabStock, getScarabById } from '../scarabStockEngine';
import type { ScarabStockStrategy } from '../scarabTypes';
import { DEFAULT_SCARABS } from '../scarabData';

describe('scarabStockEngine', () => {
  const sampleStrategy: ScarabStockStrategy = {
    id: 'ambush_divination_strat',
    name: '伏擊命運卡大宗刷圖',
    targetMapRuns: 50,
    requirements: [
      { scarabId: 'scarab_ambush_normal', quantityPerMap: 2 },
      { scarabId: 'scarab_divination_plenty', quantityPerMap: 1 },
      { scarabId: 'scarab_cartography_duplication', quantityPerMap: 1 }
    ]
  };

  describe('getScarabById', () => {
    it('finds scarab by id', () => {
      const scarab = getScarabById('scarab_ambush_normal', DEFAULT_SCARABS);
      expect(scarab).toBeDefined();
      expect(scarab?.nameZh).toContain('伏擊');
    });
  });

  describe('auditScarabStock', () => {
    it('handles empty inventory with 0% completion', () => {
      const inventory: Record<string, number> = {};
      const result = auditScarabStock(inventory, sampleStrategy, DEFAULT_SCARABS, 150);

      expect(result.maxPlayableRuns).toBe(0);
      expect(result.completionPct).toBe(0);
      expect(result.shortages.length).toBe(3);
      expect(result.totalRestockCostChaos).toBeGreaterThan(0);
      expect(result.bulkWhisperCommand).toContain('50');
    });

    it('identifies bottleneck scarab and calculates max playable runs', () => {
      const inventory: Record<string, number> = {
        scarab_ambush_normal: 40, // 40 / 2 = 20 runs
        scarab_divination_plenty: 50, // 50 / 1 = 50 runs
        scarab_cartography_duplication: 15 // 15 / 1 = 15 runs -> Bottleneck!
      };

      const result = auditScarabStock(inventory, sampleStrategy, DEFAULT_SCARABS, 150);

      expect(result.maxPlayableRuns).toBe(15);
      expect(result.bottleneckScarabId).toBe('scarab_cartography_duplication');
      expect(result.completionPct).toBe(30); // 15 / 50 = 30%

      const cartShortage = result.shortages.find(s => s.scarabId === 'scarab_cartography_duplication');
      expect(cartShortage?.missingQuantity).toBe(35); // 50 - 15 = 35
    });

    it('handles fully stocked inventory with 100% completion', () => {
      const inventory: Record<string, number> = {
        scarab_ambush_normal: 120,
        scarab_divination_plenty: 60,
        scarab_cartography_duplication: 80
      };

      const result = auditScarabStock(inventory, sampleStrategy, DEFAULT_SCARABS, 150);

      expect(result.maxPlayableRuns).toBe(60);
      expect(result.completionPct).toBe(100);
      expect(result.shortages.length).toBe(0);
      expect(result.totalRestockCostChaos).toBe(0);
      expect(result.totalRestockCostDivine).toBe(0);
    });
  });
});
