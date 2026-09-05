import { describe, it, expect } from 'vitest';
import {
  computeAtlasSummary,
  resolveScarabPrice,
  resolveExtraItemPrice
} from '../atlasHelpers';
import type { AtlasStrategyTier, AtlasTierScarab, AtlasTierExtraItem } from '../types';

describe('atlasHelpers - Pricing & Summary Suite', () => {
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
    expect(resolveScarabPrice(fallbackScarab, {})).toBe(3);
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
        { id: 'e2', name: 'T16 地圖 (Tier 16 Map)', nameEn: 'Tier 16 Map', category: 'map', count: 1, unitPriceChaos: 4 }
      ],
      estimatedRevenuePerMapChaos: 100,
      mapsPerHour: 20
    };

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

    expect(summary.batchItems.length).toBe(4);
    const essScarabBatch = summary.batchItems.find(i => i.name === '精髓甲蟲');
    expect(essScarabBatch?.totalCount).toBe(20);
    expect(essScarabBatch?.totalCostChaos).toBe(60);
  });

  it('should resolve Chinese-only scarab name against ninja rates via database mapping', () => {
    const scarabWithoutNameEn: AtlasTierScarab = {
      id: 's_no_en',
      name: '精髓甲蟲',
      count: 1
    };
    const ninjaRates = {
      'Essence Scarab': 7.5
    };
    expect(resolveScarabPrice(scarabWithoutNameEn, ninjaRates)).toBe(7.5);
    expect(resolveScarabPrice(scarabWithoutNameEn, {})).toBe(3);
  });

  it('should resolve popular extra items price from ninja rates or popular presets fallback', () => {
    const craftItem: AtlasTierExtraItem = {
      id: 'e_craft',
      name: '地圖工藝：精髓 (Essence)',
      category: 'craft',
      count: 1
    };
    expect(resolveExtraItemPrice(craftItem, {})).toBe(8);

    const vaalItem: AtlasTierExtraItem = {
      id: 'e_vaal',
      name: '瓦爾寶珠 (Vaal Orb)',
      nameEn: 'Vaal Orb',
      category: 'currency',
      count: 1
    };
    expect(resolveExtraItemPrice(vaalItem, { 'Vaal Orb': 1.8 })).toBe(1.8);
    expect(resolveExtraItemPrice(vaalItem, {})).toBe(1);

    const freeCraftItem: AtlasTierExtraItem = {
      id: 'e_free_craft',
      name: '地圖工藝：伏擊 (Ambush)',
      category: 'craft',
      count: 1,
      unitPriceChaos: 0
    };
    expect(resolveExtraItemPrice(freeCraftItem, {})).toBe(0);
  });
});
