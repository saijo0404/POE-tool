import type { BuildCostResult, BuildHistoryEntry, PricedItem } from './types';
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter';

export const HISTORY_KEY = 'poe_build_history_v1';
const storage = new LocalStorageAdapter();

export function getItemKey(item: PricedItem, fallbackIndex?: number): string {
  return `${item.category}_${item.name || ''}_${item.typeLine || ''}_${item.slot || ''}${fallbackIndex !== undefined ? `_${fallbackIndex}` : ''}`;
}

export function saveBuildToHistory(
  url: string,
  res: BuildCostResult,
  setHistory: React.Dispatch<React.SetStateAction<BuildHistoryEntry[]>>,
  customPrices?: Record<string, { priceDivine: number; priceChaos: number; isLivePrice: boolean; listingCount?: number }>
): void {
  const dynamic = customPrices && Object.keys(customPrices).length > 0 ? computeDynamicBuildResult(res, customPrices) : null;
  const finalRes = dynamic || res;

  const newEntry: BuildHistoryEntry = {
    url,
    account: res.character.account,
    character: res.character.name,
    league: res.character.league,
    totalDivine: finalRes.totalDivine,
    totalChaos: finalRes.totalChaos,
    timestamp: Date.now(),
    customPrices: customPrices && Object.keys(customPrices).length > 0 ? customPrices : undefined,
  };

  setHistory(prev => {
    const existing = prev.find(h => h.url === url || (h.character === newEntry.character && h.league === newEntry.league));
    if (!newEntry.customPrices && existing?.customPrices) {
      newEntry.customPrices = existing.customPrices;
    }
    const filtered = prev.filter(h => h.url !== url && (h.character !== newEntry.character || h.league !== newEntry.league));
    const updated = [newEntry, ...filtered].slice(0, 15);
    storage.setItem(HISTORY_KEY, updated);
    return updated;
  });
}

export function updateHistoryCustomPrices(
  url: string,
  customPrices: Record<string, { priceDivine: number; priceChaos: number; isLivePrice: boolean; listingCount?: number }>,
  currentResult: BuildCostResult | null,
  setHistory: React.Dispatch<React.SetStateAction<BuildHistoryEntry[]>>
): void {
  if (!currentResult) return;
  const dynamic = computeDynamicBuildResult(currentResult, customPrices) || currentResult;
  setHistory(prev => {
    const updated = prev.map(h => {
      if (h.url === url || (h.character === currentResult.character.name && h.league === currentResult.character.league)) {
        return {
          ...h,
          totalDivine: dynamic.totalDivine,
          totalChaos: dynamic.totalChaos,
          timestamp: Date.now(),
          customPrices: { ...(h.customPrices || {}), ...customPrices },
        };
      }
      return h;
    });
    storage.setItem(HISTORY_KEY, updated);
    return updated;
  });
}

export function computeDynamicBuildResult(
  costResult: BuildCostResult | null,
  customPrices: Record<string, { priceDivine: number; priceChaos: number; isLivePrice: boolean; listingCount?: number }>
): BuildCostResult | null {
  if (!costResult) return null;
  const divRate = costResult.divineChaosRate > 0 ? costResult.divineChaosRate : 150;
  const cats = {
    equipment: { ...costResult.categories.equipment, items: [...costResult.categories.equipment.items] },
    gems: { ...costResult.categories.gems, items: [...costResult.categories.gems.items] },
    flasks: { ...costResult.categories.flasks, items: [...costResult.categories.flasks.items] },
    jewels: { ...costResult.categories.jewels, items: [...costResult.categories.jewels.items] },
  };

  let grandTotalChaos = 0;

  (Object.keys(cats) as Array<keyof typeof cats>).forEach(catKey => {
    let catC = 0;
    cats[catKey].items = cats[catKey].items.map((item, idx) => {
      const key = getItemKey(item, idx);
      const live = customPrices[key] || customPrices[getItemKey(item)];
      if (live && live.isLivePrice) {
        catC += live.priceChaos;
        return {
          ...item,
          priceChaos: live.priceChaos,
          priceDivine: live.priceDivine,
          confidence: 'high' as const,
          details: `官方現貨價 (${live.listingCount ?? 0} 筆掛單)`,
          isLivePrice: true,
          listingCount: live.listingCount,
        };
      }
      catC += item.priceChaos;
      return item;
    });
    cats[catKey].totalChaos = Math.round(catC * 100) / 100;
    cats[catKey].totalDivine = Math.round((catC / divRate) * 100) / 100;
    grandTotalChaos += catC;
  });

  return {
    ...costResult,
    categories: cats,
    totalChaos: Math.round(grandTotalChaos * 100) / 100,
    totalDivine: Math.round((grandTotalChaos / divRate) * 100) / 100,
  };
}

export function filterAndSortBuildItems(
  costResult: BuildCostResult | null,
  activeCategory: string,
  searchFilter: string,
  sortBy: string
): PricedItem[] {
  if (!costResult) return [];
  const { equipment, gems, flasks, jewels } = costResult.categories;
  let all: PricedItem[] = [];
  if (activeCategory === 'all' || activeCategory === 'equipment') all = all.concat(equipment.items);
  if (activeCategory === 'all' || activeCategory === 'gems') all = all.concat(gems.items);
  if (activeCategory === 'all' || activeCategory === 'flasks') all = all.concat(flasks.items);
  if (activeCategory === 'all' || activeCategory === 'jewels') all = all.concat(jewels.items);

  const term = searchFilter.toLowerCase().trim();
  const filtered = term
    ? all.filter(i => (i.name || '').toLowerCase().includes(term) || (i.typeLine || '').toLowerCase().includes(term) || (i.slot || '').toLowerCase().includes(term))
    : all;

  return [...filtered].sort((a, b) => {
    if (sortBy === 'price_desc') return b.priceChaos - a.priceChaos;
    if (sortBy === 'price_asc') return a.priceChaos - b.priceChaos;
    if (sortBy === 'slot') return (a.slot || '').localeCompare(b.slot || '');
    return (a.name || a.typeLine).localeCompare(b.name || b.typeLine);
  });
}

export function exportBuildToMarkdown(costResult: BuildCostResult | null, onShowToast: (msg: string) => void): void {
  if (!costResult) return;
  const c = costResult.character;
  let md = `# 🛡️ ${c.name} (${c.ascendancy || c.class}) - Lv.${c.level}\n`;
  md += `- **聯盟 (League)**: ${c.league}\n- **總造價**: **${costResult.totalDivine} Divine** (${costResult.totalChaos} Chaos)\n\n`;
  md += `## 裝備與物品明細\n| 部位 / 類別 | 物品名稱 | 估算價格 (Divine) | 估算價格 (Chaos) | 備註 |\n|---|---|---|---|---|\n`;
  const allItems = [
    ...costResult.categories.equipment.items,
    ...costResult.categories.jewels.items,
    ...costResult.categories.flasks.items,
    ...costResult.categories.gems.items
  ];
  for (const it of allItems) {
    const note = it.isLivePrice ? `官方現貨 (${it.listingCount ?? 0} 筆)` : (it.details || '');
    md += `| ${it.slot || it.category} | ${it.name || it.typeLine} | ${it.priceDivine} div | ${it.priceChaos} c | ${note} |\n`;
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(md);
    onShowToast('已複製流派完整造價 Markdown 報表至剪貼簿！');
  }
}
