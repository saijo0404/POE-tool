import { useState, useMemo, useEffect, useCallback } from 'react';
import type { BuildCostResult, BuildHistoryEntry, PricedItem } from '../domain/build/types';
import { poeApi } from '../services/api';
import { LocalStorageAdapter } from '../infrastructure/storage/LocalStorageAdapter';
import {
  HISTORY_KEY,
  saveBuildToHistory,
  getItemKey,
  computeDynamicBuildResult,
  filterAndSortBuildItems,
  exportBuildToMarkdown
} from '../domain/build/buildHelpers';

const storage = new LocalStorageAdapter();

export function useBuildCalculator({
  league,
  onShowToast
}: {
  league: string;
  onShowToast: (msg: string) => void;
}) {
  const [buildInput, setBuildInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawCostResult, setRawCostResult] = useState<BuildCostResult | null>(null);
  const [history, setHistory] = useState<BuildHistoryEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'slot' | 'confidence'>('price_desc');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [syncingKey, setSyncingKey] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [customPrices, setCustomPrices] = useState<Record<string, { priceDivine: number; priceChaos: number; isLivePrice: boolean; listingCount?: number }>>({});

  useEffect(() => {
    const saved = storage.getItem<BuildHistoryEntry[]>(HISTORY_KEY, []);
    if (saved && saved.length > 0) setHistory(saved);
  }, []);

  const handleLoadBuild = useCallback(async (inputOverride?: string) => {
    const target = (inputOverride || buildInput).trim();
    if (!target) { onShowToast('請先輸入 PoB 代碼或 poe.ninja 角色網址'); return; }
    setLoading(true);
    setError(null);
    setCustomPrices({});
    try {
      const calculated = await poeApi.calculateBuild(target);
      setRawCostResult(calculated);
      saveBuildToHistory(target, calculated, setHistory);
      onShowToast('Build 成本計算完成並已儲存快取！');
    } catch (err: any) {
      setError(err?.message || '解析失敗，請確認輸入內容是否有效');
      onShowToast('造價計算失敗');
    } finally {
      setLoading(false);
    }
  }, [buildInput, onShowToast]);

  const handleSyncLivePrice = useCallback(async (item: PricedItem) => {
    if (!item.tradeQueryJson) return;
    const key = getItemKey(item);
    setSyncingKey(key);
    try {
      const targetLeague = rawCostResult?.character?.league || league;
      const res = await poeApi.fetchBuildItemLivePrice(targetLeague, item.tradeQueryJson);
      const minChaos = res?.estimatedMinPriceChaos ?? 0;
      const minDivine = res?.estimatedMinPriceDivine ?? 0;

      if (res && res.total > 0 && (minChaos > 0 || minDivine > 0)) {
        setCustomPrices(prev => ({
          ...prev,
          [key]: {
            priceDivine: minDivine,
            priceChaos: minChaos > 0 ? minChaos : item.priceChaos,
            isLivePrice: true,
            listingCount: res.total,
          }
        }));
        onShowToast(`已成功獲取【${item.name || item.typeLine}】官方現貨價：${minDivine > 0 ? `${minDivine} Div` : `${minChaos} C`} (共 ${res.total} 筆刊登)！`);
      } else if (res && res.total === 0) {
        onShowToast(`官方市集目前 0 筆符合掛單 (可點擊 Trade 查看搜尋)`);
      } else {
        onShowToast(`現貨查詢完成`);
      }
    } catch {
      onShowToast('現貨查詢失敗');
    } finally {
      setSyncingKey(null);
    }
  }, [rawCostResult, league, onShowToast]);

  const handleSyncAllLivePrices = useCallback(async () => {
    if (!rawCostResult) return;
    const allItems: PricedItem[] = [
      ...rawCostResult.categories.equipment.items,
      ...rawCostResult.categories.jewels.items,
      ...rawCostResult.categories.flasks.items,
      ...rawCostResult.categories.gems.items,
    ].filter(it => it.tradeQueryJson);

    if (allItems.length === 0) { onShowToast('查無可同步的物品市集條件'); return; }
    setSyncingAll(true);
    setSyncProgress({ current: 0, total: allItems.length });
    onShowToast(`🚀 開始同步 ${allItems.length} 件物品的官方市集即時現貨價...`);

    let successCount = 0;
    const targetLeague = rawCostResult?.character?.league || league;

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const key = getItemKey(item);
      setSyncProgress({ current: i + 1, total: allItems.length });
      try {
        if (item.tradeQueryJson) {
          const res = await poeApi.fetchBuildItemLivePrice(targetLeague, item.tradeQueryJson);
          const minChaos = res?.estimatedMinPriceChaos ?? 0;
          const minDivine = res?.estimatedMinPriceDivine ?? 0;

          if (res && res.total > 0 && (minChaos > 0 || minDivine > 0)) {
            setCustomPrices(prev => ({
              ...prev,
              [key]: {
                priceDivine: minDivine,
                priceChaos: minChaos > 0 ? minChaos : item.priceChaos,
                isLivePrice: true,
                listingCount: res.total,
              }
            }));
            successCount++;
          }
        }
      } catch {}
      if (i < allItems.length - 1) {
        await new Promise(r => setTimeout(r, 650));
      }
    }
    setSyncingAll(false);
    setSyncProgress(null);
    onShowToast(`🎉 官方現貨同步完成！成功取得 ${successCount} 件物品的即時市集價格。`);
  }, [rawCostResult, league, onShowToast]);

  const handleOpenTrade = useCallback(async (item: PricedItem) => {
    const targetLeague = rawCostResult?.character?.league || league;
    if (item.tradeQueryJson) {
      await poeApi.createTradeSearchUrl(targetLeague, item.tradeQueryJson);
    } else if (item.tradeSearchUrl) {
      await poeApi.openExternalUrl(item.tradeSearchUrl).catch(() => {});
    }
  }, [rawCostResult, league]);

  const computedResult = useMemo(() => {
    return computeDynamicBuildResult(rawCostResult, customPrices);
  }, [rawCostResult, customPrices]);

  const displayedItems = useMemo(() => {
    return filterAndSortBuildItems(computedResult, activeCategory, searchFilter, sortBy);
  }, [computedResult, activeCategory, searchFilter, sortBy]);

  return {
    buildInput, setBuildInput,
    loading, error,
    costResult: computedResult || rawCostResult,
    history,
    activeCategory, setActiveCategory,
    sortBy, setSortBy, searchFilter, setSearchFilter,
    syncingKey, syncingAll, syncProgress, displayedItems,
    handleLoadBuild,
    handleDeleteHistory: (idx: number) => setHistory(prev => { const u = prev.filter((_, i) => i !== idx); storage.setItem(HISTORY_KEY, u); return u; }),
    handleClearHistory: () => { setHistory([]); storage.removeItem(HISTORY_KEY); onShowToast('已清空歷史紀錄'); },
    handleSyncLivePrice, handleSyncAllLivePrices, handleOpenTrade,
    handleExportMarkdown: () => exportBuildToMarkdown(computedResult || rawCostResult, onShowToast)
  };
}
