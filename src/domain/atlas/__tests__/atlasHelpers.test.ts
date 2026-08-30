import { describe, it, expect } from 'vitest';
import {
  computeAtlasSummary,
  resolveScarabPrice,
  resolveExtraItemPrice,
  generateShoppingListText,
  generateTradeKeywordsText,
  generatePoeItemFormatListText,
  formatItemAsPoeClipboard,
  resolveItemTradeMeta
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

    // Verify batch items
    expect(summary.batchItems.length).toBe(4);
    const essScarabBatch = summary.batchItems.find(i => i.name === '精髓甲蟲');
    expect(essScarabBatch?.totalCount).toBe(20); // 2 * 10
    expect(essScarabBatch?.totalCostChaos).toBe(60);

    // Verify shopping list generator
    const shoppingList = generateShoppingListText('精髓策略', '測試分級', summary);
    expect(shoppingList).toContain('【POE 1 刷圖備料清單】');
    expect(shoppingList).toContain('批次目標：10 場地圖');
    expect(shoppingList).toContain('精髓甲蟲');
    expect(shoppingList).toContain('市集精確搜尋關鍵字');
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
      count: 1,
      unitPriceChaos: 0
    };
    expect(resolveExtraItemPrice(craftItem, {})).toBe(8);

    const vaalItem: AtlasTierExtraItem = {
      id: 'e_vaal',
      name: '瓦爾寶珠 (Vaal Orb)',
      nameEn: 'Vaal Orb',
      category: 'currency',
      count: 1,
      unitPriceChaos: 0
    };
    expect(resolveExtraItemPrice(vaalItem, { 'Vaal Orb': 1.8 })).toBe(1.8);
    expect(resolveExtraItemPrice(vaalItem, {})).toBe(1);
  });

  it('should resolve clean item trade metadata and official search URL', () => {
    const mapItem = {
      name: 'T16 地圖 (Tier 16 Map)',
      nameEn: 'Tier 16 Map',
      category: 'map' as const,
      unitCount: 1,
      totalCount: 20,
      unitPriceChaos: 4,
      totalCostChaos: 80,
      totalCostDivine: 0.53
    };
    const mapMeta = resolveItemTradeMeta(mapItem, 'Settlers');
    expect(mapMeta.cleanChineseName).toBe('T16 地圖');
    expect(mapMeta.cleanEnglishName).toBe('Tier 16 Map');
    expect(mapMeta.tier).toBe(16);
    expect(mapMeta.isCraft).toBe(false);
    expect(mapMeta.tradeSearchUrl).toContain('map_tier');
    expect(mapMeta.tradeSearchUrl).toContain('category');

    const craftItem = {
      name: '地圖工藝：精髓 (Essence)',
      nameEn: 'Essence Craft',
      category: 'craft' as const,
      unitCount: 1,
      totalCount: 20,
      unitPriceChaos: 8,
      totalCostChaos: 160,
      totalCostDivine: 1.07
    };
    const craftMeta = resolveItemTradeMeta(craftItem, 'Settlers');
    expect(craftMeta.isCraft).toBe(true);
    expect(craftMeta.tradeSearchUrl).toBeUndefined();
  });

  it('should aggregate duplicate scarabs and duplicate extra items cleanly with accurate keywords', () => {
    const tierWithDuplicates: AtlasStrategyTier = {
      id: 'tier_dup',
      name: '重複項目測試',
      recommendedMaps: ['T16 地圖'],
      coreKeystones: [],
      scarabs: [
        { id: 's1', name: '精髓甲蟲', nameEn: 'Essence Scarab', count: 2, customPriceChaos: 3 },
        { id: 's2', name: '精髓甲蟲', nameEn: 'Essence Scarab', count: 2, customPriceChaos: 3 }
      ],
      extraItems: [
        { id: 'e1', name: 'T16 地圖 (Tier 16 Map)', nameEn: 'Tier 16 Map', category: 'map', count: 1, unitPriceChaos: 4 },
        { id: 'e2', name: 'T16 地圖 (Tier 16 Map)', nameEn: 'Tier 16 Map', category: 'map', count: 1, unitPriceChaos: 4 }
      ],
      estimatedRevenuePerMapChaos: 50,
      mapsPerHour: 10
    };

    const summary = computeAtlasSummary(tierWithDuplicates, {}, 150, 20);

    expect(summary.batchItems.length).toBe(2);
    const scarabItem = summary.batchItems.find(i => i.name === '精髓甲蟲');
    expect(scarabItem?.totalCount).toBe(80);
    expect(scarabItem?.nameEn).toBe('Essence Scarab');

    const mapItem = summary.batchItems.find(i => i.name.includes('地圖'));
    expect(mapItem?.totalCount).toBe(40);

    // Check shopping list and keywords text format
    const text = generateShoppingListText('測試策略', '重複分級', summary);
    expect(text).toContain('精髓甲蟲 (Essence Scarab) x 80');
    expect(text).toContain('T16 地圖 (Tier 16 Map) x 40');
    expect(text).toContain('【市集精確搜尋關鍵字 (Trade Search Keywords)】');
    expect(text).toContain('Tier 16 Map x 40');
    expect(text).toContain('Essence Scarab x 80');

    const keywords = generateTradeKeywordsText(summary);
    expect(keywords).toContain('T16 地圖 x 40');
    expect(keywords).toContain('Tier 16 Map x 40');
    expect(keywords).toContain('Essence Scarab x 80');

    // Check PoE Item format for 裝備查詢 / PriceChecker
    const poeFormatList = generatePoeItemFormatListText(summary, 'zh');
    expect(poeFormatList).toContain('物品種類: 聖甲蟲');
    expect(poeFormatList).toContain('稀有度: 通貨');
    expect(poeFormatList).toContain('精髓甲蟲');
    expect(poeFormatList).toContain('堆疊數量: 80');

    expect(poeFormatList).toContain('物品種類: 地圖');
    expect(poeFormatList).toContain('稀有度: 普通');
    expect(poeFormatList).toContain('地圖');
    expect(poeFormatList).toContain('地圖階級: 16');

    // Test single item format in English
    const singleScarab = summary.batchItems[0];
    const enScarabFormat = formatItemAsPoeClipboard(singleScarab, 'en');
    expect(enScarabFormat).toContain('Item Class: Scarabs');
    expect(enScarabFormat).toContain('Rarity: Currency');
    expect(enScarabFormat).toContain('Essence Scarab');
    expect(enScarabFormat).toContain('Stack Size: 80');
  });
});
