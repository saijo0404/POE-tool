import { describe, it, expect } from 'vitest';
import {
  computeAtlasSummary,
  generateShoppingListText,
  generateTradeKeywordsText,
  generatePoeItemFormatListText,
  formatItemAsPoeClipboard,
  resolveItemTradeMeta
} from '../atlasHelpers';
import type { AtlasStrategyTier } from '../types';

describe('atlasHelpers - Export & Metadata Suite', () => {
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

  it('should aggregate duplicate scarabs and extra items cleanly with accurate keywords', () => {
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

    const poeFormatList = generatePoeItemFormatListText(summary, 'zh');
    expect(poeFormatList).toContain('物品種類: 聖甲蟲');
    expect(poeFormatList).toContain('稀有度: 通貨');
    expect(poeFormatList).toContain('精髓甲蟲');
    expect(poeFormatList).toContain('堆疊數量: 80');

    expect(poeFormatList).toContain('物品種類: 地圖');
    expect(poeFormatList).toContain('稀有度: 普通');
    expect(poeFormatList).toContain('地圖');
    expect(poeFormatList).toContain('地圖階級: 16');

    const singleScarab = summary.batchItems[0];
    const enScarabFormat = formatItemAsPoeClipboard(singleScarab, 'en');
    expect(enScarabFormat).toContain('Item Class: Scarabs');
    expect(enScarabFormat).toContain('Rarity: Currency');
    expect(enScarabFormat).toContain('Essence Scarab');
    expect(enScarabFormat).toContain('Stack Size: 80');
  });
});
