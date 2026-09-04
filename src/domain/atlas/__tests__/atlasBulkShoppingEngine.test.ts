import { describe, it, expect } from 'vitest';
import {
  calculateBulkShoppingPlan,
  formatBulkShoppingClipboardText
} from '../atlasBulkShoppingEngine';
import type { AtlasStrategyTier } from '../types';

describe('atlasBulkShoppingEngine (Issue #108)', () => {
  const mockTier: AtlasStrategyTier = {
    id: 'tier-test',
    name: '精華極限速刷 (Juiced Essence)',
    recommendedMaps: ['劇毒林地 (Toxic Sewer)'],
    coreKeystones: ['第七道門'],
    scarabs: [
      {
        id: 'scarab-1',
        name: '昇華之精髓聖甲蟲',
        nameEn: 'Essence Scarab of Ascent',
        count: 2,
        customPriceChaos: 6
      },
      {
        id: 'scarab-2',
        name: '鈣化之精髓聖甲蟲',
        nameEn: 'Essence Scarab of Calcification',
        count: 1,
        customPriceChaos: 25
      }
    ],
    extraItems: [
      {
        id: 'extra-1',
        name: '精華地圖工藝 (Essence Craft)',
        category: 'craft',
        count: 1,
        unitPriceChaos: 4
      }
    ],
    estimatedRevenuePerMapChaos: 70,
    mapsPerHour: 20
  };

  it('calculates bulk requirements and costs correctly for 50 runs', () => {
    const result = calculateBulkShoppingPlan({
      tier: mockTier,
      runs: 50,
      divineRate: 150
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const plan = result.value;
    expect(plan.runs).toBe(50);
    expect(plan.tierName).toBe('精華極限速刷 (Juiced Essence)');

    // 2 scarabs * 50 = 100
    const scarab1 = plan.items.find(i => i.name === '昇華之精髓聖甲蟲');
    expect(scarab1).toBeDefined();
    expect(scarab1?.perMapCount).toBe(2);
    expect(scarab1?.totalCount).toBe(100);
    expect(scarab1?.unitPriceChaos).toBe(6);
    expect(scarab1?.totalCostChaos).toBe(600);

    // 1 scarab * 50 = 50
    const scarab2 = plan.items.find(i => i.name === '鈣化之精髓聖甲蟲');
    expect(scarab2).toBeDefined();
    expect(scarab2?.perMapCount).toBe(1);
    expect(scarab2?.totalCount).toBe(50);
    expect(scarab2?.unitPriceChaos).toBe(25);
    expect(scarab2?.totalCostChaos).toBe(1250);

    // 1 craft * 50 = 50
    const craft = plan.items.find(i => i.name === '精華地圖工藝 (Essence Craft)');
    expect(craft).toBeDefined();
    expect(craft?.totalCount).toBe(50);
    expect(craft?.totalCostChaos).toBe(200);

    // Single map total cost: (2*6) + (1*25) + (1*4) = 12 + 25 + 4 = 41c
    expect(plan.singleMapCostChaos).toBe(41);

    // 50 runs total: 41 * 50 = 2050c
    expect(plan.totalCostChaos).toBe(2050);
    // 2050 / 150 = 13.67 div
    expect(plan.totalCostDivine).toBe(13.67);

    // Gold fee estimation should be > 0 for market trading
    expect(plan.totalEstimatedGoldFee).toBeGreaterThan(0);
    expect(plan.mapsNeededToFarmGold).toBeGreaterThan(0);

    // Profit projections
    // Revenue: 70c * 50 = 3500c
    expect(plan.estimatedTotalRevenueChaos).toBe(3500);
    // Profit: 3500 - 2050 = 1450c
    expect(plan.estimatedTotalProfitChaos).toBe(1450);
    expect(plan.estimatedTotalProfitDivine).toBe(9.67);
  });

  it('supports custom price overrides for bulk estimation', () => {
    const result = calculateBulkShoppingPlan({
      tier: mockTier,
      runs: 10,
      divineRate: 150,
      customPriceOverrides: {
        '昇華之精髓聖甲蟲': 10 // override 6 -> 10
      }
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const scarab1 = result.value.items.find(i => i.name === '昇華之精髓聖甲蟲');
    expect(scarab1?.unitPriceChaos).toBe(10);
    expect(scarab1?.totalCostChaos).toBe(200); // 20 * 10 = 200
  });

  it('returns domain error when runs is invalid (less than 1)', () => {
    const result = calculateBulkShoppingPlan({
      tier: mockTier,
      runs: 0
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('handles empty tier without items gracefully', () => {
    const emptyTier: AtlasStrategyTier = {
      id: 'empty',
      name: '白圖零成本流',
      recommendedMaps: [],
      coreKeystones: [],
      scarabs: [],
      extraItems: []
    };

    const result = calculateBulkShoppingPlan({
      tier: emptyTier,
      runs: 50
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    expect(result.value.items).toHaveLength(0);
    expect(result.value.totalCostChaos).toBe(0);
    expect(result.value.totalEstimatedGoldFee).toBe(0);
  });

  it('formats clean clipboard text for copying shopping list', () => {
    const result = calculateBulkShoppingPlan({
      tier: mockTier,
      runs: 50,
      divineRate: 150
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const text = formatBulkShoppingClipboardText(result.value);
    expect(text).toContain('50 場大宗備料採購清單');
    expect(text).toContain('昇華之精髓聖甲蟲');
    expect(text).toContain('100');
    expect(text).toContain('總採購預算');
  });
});
