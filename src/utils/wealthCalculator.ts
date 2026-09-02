import type { WealthSnapshot, WealthFilterState, FilteredWealthData, StashItem } from '../types/poe';

export function isBulkCommodityCategory(category?: string): boolean {
  if (!category) return false;
  return category !== 'Equipment';
}

export function computeFilteredWealthData(
  latestSnapshot: WealthSnapshot | null,
  filterState: WealthFilterState
): FilteredWealthData {
  const bulkMultiplier = filterState.bulkMultiplier && filterState.bulkMultiplier > 0 ? filterState.bulkMultiplier : 1.0;

  if (!latestSnapshot) {
    return { totalChaos: 0, totalDivine: 0, tabSummaries: [], topItems: [], allItems: [], bulkMultiplier };
  }
  const { minValueChaos, ignoredTabNames, selectedCategory } = filterState;

  const rawItems = latestSnapshot.allItems || latestSnapshot.topItems || [];
  const divRate = latestSnapshot.chaosRate || 150;

  const adjustedItems: StashItem[] = rawItems.map(item => {
    if (bulkMultiplier === 1.0 || !isBulkCommodityCategory(item.category)) {
      return item;
    }
    const unitPriceChaos = Math.round(item.unitPriceChaos * bulkMultiplier * 100) / 100;
    const totalPriceChaos = Math.round(item.totalPriceChaos * bulkMultiplier * 100) / 100;
    const unitPriceDivine = Math.round((unitPriceChaos / divRate) * 100) / 100;
    const totalPriceDivine = Math.round((totalPriceChaos / divRate) * 100) / 100;
    return {
      ...item,
      unitPriceChaos,
      totalPriceChaos,
      unitPriceDivine,
      totalPriceDivine
    };
  });

  const filteredItems = adjustedItems.filter(item => {
    if (minValueChaos && minValueChaos > 0 && (item.unitPriceChaos || item.totalPriceChaos) < minValueChaos) return false;
    if (ignoredTabNames && ignoredTabNames.includes(item.tabName)) return false;
    if (selectedCategory && selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  let totalChaos = 0;
  const tabMap: Record<string, { category: string; count: number; totalChaos: number }> = {};
  for (const item of filteredItems) {
    totalChaos += item.totalPriceChaos;
    if (!tabMap[item.tabName]) tabMap[item.tabName] = { category: item.category, count: 0, totalChaos: 0 };
    tabMap[item.tabName].count += item.stackSize || 1;
    tabMap[item.tabName].totalChaos += item.totalPriceChaos;
  }

  totalChaos = Math.round(totalChaos * 100) / 100;
  const totalDivine = Math.round((totalChaos / divRate) * 100) / 100;
  const tabSummaries = Object.keys(tabMap).map(tabName => ({
    tabName, category: tabMap[tabName].category, itemCount: tabMap[tabName].count,
    totalValueChaos: Math.round(tabMap[tabName].totalChaos * 100) / 100,
    totalValueDivine: Math.round((tabMap[tabName].totalChaos / divRate) * 100) / 100
  })).sort((a, b) => b.totalValueChaos - a.totalValueChaos);

  return {
    totalChaos,
    totalDivine,
    tabSummaries,
    topItems: [...filteredItems].sort((a, b) => b.totalPriceChaos - a.totalPriceChaos).slice(0, 20),
    allItems: filteredItems,
    bulkMultiplier
  };
}

