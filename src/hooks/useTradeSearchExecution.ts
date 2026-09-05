import { useState, useCallback } from 'react';
import type { ParsedItem, ParsedItemMod, TradeSearchResult, TradeStatusOption } from '../types/poe';
import { poeApi } from '../services/api';
import { getSortConfig, mergeTradeResults, parseRuneSocketsMin } from '../domain/trade/tradeSearchHelpers';
import type { RecentSearchItem } from './useRecentSearches';

interface UseTradeSearchExecutionOptions {
  selectedLeague: string;
  tradeStatus: TradeStatusOption;
  sortBy: 'price_asc' | 'price_desc' | 'indexed_desc';
  rawText: string;
  initialResults: TradeSearchResult | null;
  addRecentSearch: (item: RecentSearchItem) => void;
  onShowToast: (msg: string) => void;
}

function detectAuthErrorMessage(msg: string): string | null {
  const authKeywords = ['AUTH_SESSION_EXPIRED', 'CLOUDFLARE_CHALLENGE', '403', '401', '憑證已過期', 'Cloudflare'];
  const matched = authKeywords.some(kw => msg.includes(kw));
  return matched ? msg : null;
}

function handleSaveRecent(
  item: ParsedItem,
  rawText: string,
  res: TradeSearchResult | null,
  addRecent: (item: RecentSearchItem) => void
) {
  const nameOrBase = item.name || item.baseType;
  if (!nameOrBase) return;
  addRecent({
    id: `${Date.now()}_${nameOrBase}`,
    timestamp: Date.now(),
    name: nameOrBase,
    baseType: item.baseType,
    rarity: item.rarity,
    rawText,
    minPriceDivine: res?.estimatedMinPriceDivine,
    minPriceChaos: res?.estimatedMinPriceChaos
  });
}

export function useTradeSearchExecution({
  selectedLeague,
  tradeStatus,
  sortBy,
  rawText,
  initialResults,
  addRecentSearch,
  onShowToast
}: UseTradeSearchExecutionOptions) {
  const [searching, setSearching] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [tradeResults, setTradeResults] = useState<TradeSearchResult | null>(initialResults);
  const [authError, setAuthError] = useState<string | null>(null);

  const executeTradeSearch = useCallback(async (
    targetItem: ParsedItem | null,
    targetMods: ParsedItemMod[],
    targetLinks?: number,
    targetCorrupted?: boolean,
    targetIlvl?: number,
    fetchOffset?: number
  ) => {
    if (!targetItem) return null;
    const isLoadMore = Boolean(fetchOffset && fetchOffset > 0);
    if (isLoadMore) setLoadingMore(true); else setSearching(true);

    try {
      const activeMods = targetMods.filter(m => m.enabled);
      const res = await poeApi.searchTrade({
        league: selectedLeague,
        engine: targetItem.engine,
        tradeStatus,
        name: targetItem.name,
        baseType: targetItem.baseType,
        rarity: targetItem.rarity,
        linksMin: targetLinks,
        corrupted: targetCorrupted,
        itemLevelMin: targetIlvl,
        selectedMods: activeMods,
        item: targetItem,
        sort: getSortConfig(sortBy),
        fetchOffset: fetchOffset || 0,
        spiritMin: targetItem.spirit,
        waystoneTierMin: targetItem.waystoneTier,
        uncutGemTierMin: targetItem.uncutTier,
        runeSocketsMin: parseRuneSocketsMin(targetItem.runeSockets)
      });

      setAuthError(null);
      if (isLoadMore) {
        setTradeResults(prev => mergeTradeResults(prev, res));
      } else {
        setTradeResults(res);
        handleSaveRecent(targetItem, rawText, res, addRecentSearch);
      }
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const authErr = detectAuthErrorMessage(msg);
      if (authErr) setAuthError(authErr);
      onShowToast(msg || '查價失敗，請稍後再試');
      return null;
    } finally {
      setSearching(false);
      setLoadingMore(false);
    }
  }, [selectedLeague, tradeStatus, sortBy, rawText, addRecentSearch, onShowToast]);

  return {
    searching,
    loadingMore,
    tradeResults,
    setTradeResults,
    authError,
    clearAuthError: () => setAuthError(null),
    executeTradeSearch
  };
}
