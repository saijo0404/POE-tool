import { describe, it, expect } from 'vitest';
import {
  computeAtlasSummary,
  resolveScarabPrice,
  resolveExtraItemPrice,
  generateShoppingListText
} from '../atlasHelpers';
import type { AtlasStrategyTier, AtlasTierScarab, AtlasTierExtraItem } from '../types';

describe('Atlas Strategy Helpers', () => {
  it('should resolve scarab price with custom override or ninja rates or fallback', () => {
    const customScarab: AtlasTierScarab = {
      id: 's1',
      name: '精髓甲蟲',
      nameEn: 'Essence Scarab',
      count: 2,
      customPriceChaos: 20
    };
    expect(resolveScarabPrice(customScarab, {})).toBe(20);

    const ninjaScarab: AtlasTierScarab = {
      id: 's2',
      name: '精髓甲蟲',
      nameEn: 'Essence Scarab',
      count: 1
    };
    expect(resolveScarabPrice(ninjaScarab, { 'Essence Scarab': 4.5 })).toBe(4.5);

    const fallbackScarab: AtlasTierScarab = {
      id: 's3',
      name: '精髓甲蟲',
      nameEn: 'Essence Scarab',
      count: 1
    };
    expect(resolveScarabPrice(fallbackScarab, {})).toBe(3); // base price in db
  });

  it('should resolve extra item price correctly in chaos and divine', () => {
    const chaosItem: AtlasTierExtraItem = {
      id: 'e1',
      name: '地圖工藝：精髓',
      category: 'craft',
      count: 1,
      unitPriceChaos: 8
    };
    expect(resolveExtraItemPrice(chaosItem, {}, 150)).toBe(8);

    const divItem: AtlasTierExtraItem = {
      id: 'e2',
      name: 'T17 堡壘地圖',
      category: 'map',
      count: 1,
      unitPriceChaos: 0,
      unitPriceDivine: 0.5
    };
    expect(resolveExtraItemPrice(divItem, {}, 160)).toBe(80);
  });

  it('should accurately compute single map cost, profit, ROI, and batch materials', () => {
    const testTier: AtlasStrategyTier = {
      id: 'tier_test',
      name: '測試精髓分級',
      recommendedMaps: ['幽閉墓穴'],
      coreKeystones: ['第七道門'],
      scarabs: [
        { id: 's1', name: '精髓甲蟲', count: 2, customPriceChaos: 3 },
        { id: 's2', name: '飛升之精髓甲蟲', count: 1, customPriceChaos: 14 }
      ],
      extraItems: [
        { id: 'e1', name: '地圖工藝：精髓', category: 'craft', count: 1, unitPriceChaos: 8 },
        { id: 'e2', name: 'T16 幽閉墓穴', category: 'map', count: 1, unitPriceChaos: 4 }
      ],
      estimatedRevenuePerMapChaos: 100,
      mapsPerHour: 20
    };

    // Scarab cost: 2*3 + 1*14 = 20c
    // Extra items: 1*8 + 1*4 = 12c
    // Total cost per map = 32c
    // Net profit per map = 100 - 32 = 68c
    // ROI = 68 / 32 = 212.5%
    // Hourly profit = 68 * 20 = 1360c
    const summary = computeAtlasSummary(testTier, {}, 150, 10);

    expect(summary.scarabCostChaos).toBe(20);
    expect(summary.extraItemCostChaos).toBe(12);
    expect(summary.totalCostChaosPerMap).toBe(32);
    expect(summary.netProfitChaosPerMap).toBe(68);
    expect(summary.roiPercentage).toBe(212.5);
    expect(summary.hourlyProfitChaos).toBe(1360);
    expect(summary.batchSize).toBe(10);
    expect(summary.batchTotalCostChaos).toBe(320);
    expect(summary.batchTotalProfitChaos).toBe(680);

    // Verify batch items
    expect(summary.batchItems.length).toBe(4);
    const essScarabBatch = summary.batchItems.find(i => i.name === '精髓甲蟲');
    expect(essScarabBatch?.totalCount).toBe(20); // 2 * 10
    expect(essScarabBatch?.totalCostChaos).toBe(60);

    // Verify shopping list generator
    const shoppingList = generateShoppingListText('精髓策略', '測試分級', summary);
    expect(shoppingList).toContain('【POE 1 刷圖備料清單】');
    expect(shoppingList).toContain('批次目標：10 場地圖');
    expect(shoppingList).toContain('精髓甲蟲 x 20');
  });
});
