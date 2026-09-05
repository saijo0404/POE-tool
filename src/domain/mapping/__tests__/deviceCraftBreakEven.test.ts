import { describe, it, expect } from 'vitest';
import {
  DEVICE_CRAFT_OPTIONS,
  getAllDeviceCrafts,
  getDeviceCraftById,
  calculateDeviceCraftBreakEven,
  forecastAllDeviceCrafts
} from '../deviceCraftBreakEven';

describe('deviceCraftBreakEven', () => {
  it('provides a catalog of popular map device crafts', () => {
    const crafts = getAllDeviceCrafts();
    expect(crafts.length).toBeGreaterThanOrEqual(8);
    expect(crafts.some(c => c.id === 'essence')).toBe(true);
    expect(crafts.some(c => c.id === 'ambush')).toBe(true);
    expect(crafts.some(c => c.id === 'harvest')).toBe(true);
  });

  it('retrieves craft by ID correctly', () => {
    const ambush = getDeviceCraftById('ambush');
    expect(ambush).toBeDefined();
    expect(ambush?.name).toContain('伏擊');
    expect(ambush?.costChaos).toBeGreaterThan(0);
  });

  it('calculates break-even drops and expected ROI correctly for Essence craft', () => {
    const result = calculateDeviceCraftBreakEven({
      craftId: 'essence',
      itemQuantityBonusPercent: 0,
      packSizeBonusPercent: 0
    });

    expect(result.craft.id).toBe('essence');
    expect(result.effectiveCostChaos).toBe(result.craft.costChaos);
    expect(result.breakEvenDrops.length).toBeGreaterThan(0);

    const firstDrop = result.breakEvenDrops[0];
    // Break-even requirement: cost / unitValue
    const expectedBreakEvenUnits = Math.round((result.effectiveCostChaos / firstDrop.unitValueChaos) * 10) / 10;
    expect(firstDrop.minUnitsToBreakEven).toBe(expectedBreakEvenUnits);
    expect(result.expectedRoiPercent).toBeDefined();
    expect(result.riskLevel).toBeDefined();
    expect(result.verdictNote).toBeTruthy();
  });

  it('amplifies expected revenue and ROI with high map item quantity and pack size', () => {
    const baseResult = calculateDeviceCraftBreakEven({
      craftId: 'ambush',
      itemQuantityBonusPercent: 0,
      packSizeBonusPercent: 0
    });

    const juicedResult = calculateDeviceCraftBreakEven({
      craftId: 'ambush',
      itemQuantityBonusPercent: 100, // +100% quantity
      packSizeBonusPercent: 30 // +30% pack size
    });

    expect(juicedResult.expectedRevenueChaos).toBeGreaterThan(baseResult.expectedRevenueChaos);
    expect(juicedResult.expectedRoiPercent).toBeGreaterThan(baseResult.expectedRoiPercent);
  });

  it('respects custom craft cost and custom unit price overrides', () => {
    const result = calculateDeviceCraftBreakEven({
      craftId: 'harvest',
      customCostChaos: 15,
      customUnitPrices: {
        '命力 (Lifeforce)': 0.05
      }
    });

    expect(result.effectiveCostChaos).toBe(15);
    const drop = result.breakEvenDrops.find(d => d.dropName.includes('命力'));
    if (drop) {
      expect(drop.unitValueChaos).toBe(0.05);
      expect(drop.minUnitsToBreakEven).toBe(300); // 15 / 0.05 = 300
    }
  });

  it('forecasts all device crafts sorted by expected ROI descending', () => {
    const allForecasts = forecastAllDeviceCrafts({
      itemQuantityBonusPercent: 50
    });

    expect(allForecasts.length).toBe(DEVICE_CRAFT_OPTIONS.length);
    for (let i = 0; i < allForecasts.length - 1; i++) {
      expect(allForecasts[i].expectedRoiPercent).toBeGreaterThanOrEqual(
        allForecasts[i + 1].expectedRoiPercent
      );
    }
  });

  it('handles unknown craft ID with safe fallback', () => {
    const fallback = calculateDeviceCraftBreakEven({
      craftId: 'unknown_craft'
    });

    expect(fallback.craft.id).toBe('fortune');
    expect(fallback.riskLevel).toBeDefined();
  });
});
