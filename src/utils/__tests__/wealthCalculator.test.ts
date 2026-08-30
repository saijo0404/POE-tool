import { describe, it, expect } from 'vitest';
import { computeFilteredWealthData } from '../wealthCalculator';
import type { WealthSnapshot, WealthFilterState, StashItem } from '../../types/poe';

describe('wealthCalculator', () => {
  const mockItems: StashItem[] = [
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
      name: 'Chaos Orb',
      typeLine: 'Chaos Orb',
      icon: 'chaos.png',
      stackSize: 50,
      tabName: 'Currency Tab',
      category: 'Currency',
      unitPriceChaos: 1,
      totalPriceChaos: 50,
      unitPriceDivine: 0.0066,
      totalPriceDivine: 0.33
    },
    {
      id: 'item3',
      name: 'The Doctor',
      typeLine: 'The Doctor',
      icon: 'doctor.png',
      stackSize: 1,
      tabName: 'Divination Tab',
      category: 'DivCard',
      unitPriceChaos: 1500,
      totalPriceChaos: 1500,
      unitPriceDivine: 10,
      totalPriceDivine: 10
    },
    {
      id: 'item4',
      name: 'Scroll of Wisdom',
      typeLine: 'Scroll of Wisdom',
      icon: 'scroll.png',
      stackSize: 40,
      tabName: 'Dump Tab',
      category: 'Currency',
      unitPriceChaos: 0.01,
      totalPriceChaos: 0.4,
      unitPriceDivine: 0,
      totalPriceDivine: 0
    }
  ];

  const mockSnapshot: WealthSnapshot = {
    timestamp: '2026-08-30T12:00:00Z',
    league: 'Standard',
    totalChaos: 1850.4,
    totalDivine: 12.33,
    chaosRate: 150,
    tabSummaries: [],
    topItems: mockItems,
    allItems: mockItems
  };

  it('returns empty result when snapshot is null', () => {
    const filterState: WealthFilterState = {
      minValueChaos: 0,
      ignoredTabNames: [],
      selectedCategory: 'ALL'
    };
    const result = computeFilteredWealthData(null, filterState);
    expect(result.totalChaos).toBe(0);
    expect(result.totalDivine).toBe(0);
    expect(result.tabSummaries).toEqual([]);
    expect(result.topItems).toEqual([]);
    expect(result.allItems).toEqual([]);
  });

  it('calculates totals correctly with default filter', () => {
    const filterState: WealthFilterState = {
      minValueChaos: 0,
      ignoredTabNames: [],
      selectedCategory: 'ALL'
    };
    const result = computeFilteredWealthData(mockSnapshot, filterState);
    expect(result.totalChaos).toBe(1850.4);
    expect(result.totalDivine).toBe(12.34);
    expect(result.allItems.length).toBe(4);
    expect(result.tabSummaries.length).toBe(3);
  });

  it('filters items by minValueChaos', () => {
    const filterState: WealthFilterState = {
      minValueChaos: 10,
      ignoredTabNames: [],
      selectedCategory: 'ALL'
    };
    const result = computeFilteredWealthData(mockSnapshot, filterState);
    // Scroll of Wisdom (0.01c unit) and Chaos Orb (1c unit) filtered out by minValueChaos = 10
    expect(result.allItems.length).toBe(2);
    expect(result.allItems.some(i => i.id === 'item4')).toBe(false);
    expect(result.allItems.some(i => i.id === 'item2')).toBe(false);
    expect(result.totalChaos).toBe(1800);

  });

  it('filters items by ignoredTabNames', () => {
    const filterState: WealthFilterState = {
      minValueChaos: 0,
      ignoredTabNames: ['Dump Tab'],
      selectedCategory: 'ALL'
    };
    const result = computeFilteredWealthData(mockSnapshot, filterState);
    expect(result.allItems.length).toBe(3);
    expect(result.tabSummaries.find(t => t.tabName === 'Dump Tab')).toBeUndefined();
  });

  it('filters items by category', () => {
    const filterState: WealthFilterState = {
      minValueChaos: 0,
      ignoredTabNames: [],
      selectedCategory: 'DivCard'
    };
    const result = computeFilteredWealthData(mockSnapshot, filterState);
    expect(result.allItems.length).toBe(1);
    expect(result.allItems[0].name).toBe('The Doctor');
    expect(result.totalChaos).toBe(1500);
  });
});
