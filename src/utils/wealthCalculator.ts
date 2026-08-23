import type { WealthSnapshot } from '../types/poe';

export function computeFilteredWealthData(latestSnapshot: WealthSnapshot | null, filterState: any) {
  if (!latestSnapshot) {
    return { totalChaos: 0, totalDivine: 0, tabSummaries: [], topItems: [], allItems: [] };
  }
  const { minValueChaos, ignoredTabNames, selectedCategory } = filterState;

  const allItems = latestSnapshot.allItems || latestSnapshot.topItems || [];
  const divRate = latestSnapshot.chaosRate || 150;
  const filteredItems = allItems.filter(item => {
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

  return { totalChaos, totalDivine, tabSummaries, topItems: [...filteredItems].sort((a, b) => b.totalPriceChaos - a.totalPriceChaos).slice(0, 20), allItems: filteredItems };
}
