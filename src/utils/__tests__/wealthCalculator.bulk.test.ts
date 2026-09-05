import { describe, it, expect } from 'vitest';
import { computeFilteredWealthData } from '../wealthCalculator';
import type { WealthSnapshot, WealthFilterState, StashItem } from '../../types/poe';

describe('wealthCalculator - Bulk Suite', () => {
  const baseItems: StashItem[] = [
    {
      id: 'item1',
      name: 'Divine Orb',
      typeLine: 'Divine Orb',
      icon: 'divine.png',
      stackSize: 2,
      tabName: 'Currency Tab',
      category: 'Currency',
      unitPriceChaos: 150,
      totalPriceChaos: 300,
      unitPriceDivine: 1,
      totalPriceDivine: 2
    },
    {
      id: 'item2',
      name: 'The Doctor',
      typeLine: 'The Doctor',
      icon: 'doctor.png',
      stackSize: 1,
      tabName: 'Divination Tab',
      category: 'DivCard',
      unitPriceChaos: 1550.4,
      totalPriceChaos: 1550.4,
      unitPriceDivine: 10.33,
      totalPriceDivine: 10.33
    }
  ];

  const mockSnapshot: WealthSnapshot = {
    timestamp: '2026-08-30T12:00:00Z',
    league: 'Standard',
    totalChaos: 1850.4,
    totalDivine: 12.33,
    chaosRate: 150,
    tabSummaries: [],
    topItems: baseItems,
    allItems: baseItems
  };

  it('applies bulk multiplier (1.2x) to bulk commodities correctly', () => {
    const mixedItems: StashItem[] = [
      {
        id: 'bulk1',
        name: 'Divine Orb',
        typeLine: 'Divine Orb',
        icon: 'divine.png',
        stackSize: 2,
        tabName: 'Currency Tab',
        category: 'Currency',
        unitPriceChaos: 150,
        totalPriceChaos: 300,
        unitPriceDivine: 1,
        totalPriceDivine: 2
      },
      {
        id: 'bulk2',
        name: 'Headhunter',
        typeLine: 'Leather Belt',
        icon: 'hh.png',
        stackSize: 1,
        tabName: 'Gear Tab',
        category: 'Equipment',
        unitPriceChaos: 7500,
        totalPriceChaos: 7500,
        unitPriceDivine: 50,
        totalPriceDivine: 50
      }
    ];

    const snapshot: WealthSnapshot = {
      ...mockSnapshot,
      allItems: mixedItems,
      topItems: mixedItems
    };

    const filterState: WealthFilterState = {
      minValueChaos: 0,
      ignoredTabNames: [],
      selectedCategory: 'ALL',
      bulkMultiplier: 1.2
    };

    const result = computeFilteredWealthData(snapshot, filterState);
    expect(result.bulkMultiplier).toBe(1.2);

    const divineItem = result.allItems.find(i => i.id === 'bulk1');
    expect(divineItem?.unitPriceChaos).toBe(180);
    expect(divineItem?.totalPriceChaos).toBe(360);

    const hhItem = result.allItems.find(i => i.id === 'bulk2');
    expect(hhItem?.totalPriceChaos).toBe(7500);

    expect(result.totalChaos).toBe(7860);
    expect(result.totalDivine).toBe(52.4);
  });

  it('applies super bulk multiplier (1.4x) and scales tab summaries', () => {
    const filterState: WealthFilterState = {
      minValueChaos: 0,
      ignoredTabNames: [],
      selectedCategory: 'ALL',
      bulkMultiplier: 1.4
    };
    const result = computeFilteredWealthData(mockSnapshot, filterState);
    expect(result.bulkMultiplier).toBe(1.4);
    expect(result.totalChaos).toBe(2590.56);
    expect(result.totalDivine).toBe(Math.round((2590.56 / 150) * 100) / 100);
  });
});
