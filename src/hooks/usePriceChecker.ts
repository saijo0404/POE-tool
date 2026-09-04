import { useState, useEffect, useRef } from 'react';
import type { ParsedItem, TradeListing, TradeStatusOption } from '../types/poe';
import { poeApi } from '../services/api';
import { useAppState } from './useAppState';
import { useRecentSearches, type RecentSearchItem } from './useRecentSearches';
import { useItemFilters } from './useItemFilters';
import { useSyncAppState } from '../domain/trade/tradeSearchHelpers';
import { useTradeSearchExecution } from './useTradeSearchExecution';

export { formatModText } from '../domain/item/modFormatter';
export type { RecentSearchItem } from './useRecentSearches';

function useAppStateSafe() {
  try { return useAppState(); } catch { return null; }
}

export function usePriceChecker({
  league,
  onShowToast,
  externalText
}: {
  league: string;
  onShowToast: (msg: string) => void;
  externalText?: string;
}) {
  const appState = useAppStateSafe();
  const cached = appState?.priceCheckerState;

  const [selectedLeague, setSelectedLeague] = useState<string>(league || 'Standard');
  const [tradeStatus, setTradeStatus] = useState<TradeStatusOption>(cached?.tradeStatus || 'instant');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'indexed_desc'>(cached?.sortBy || 'price_asc');
  const [rawText, setRawText] = useState<string>(cached?.rawText || '');
  const [parsedItem, setParsedItem] = useState<ParsedItem | null>(cached?.parsedItem || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const filters = useItemFilters({
    initialMods: cached?.mods,
    initialLinksMin: cached?.linksMin,
    initialCorrupted: cached?.corruptedFilter,
    initialItemLevelMin: cached?.itemLevelMin
  });

  const {
    searching,
    loadingMore,
    tradeResults,
    setTradeResults,
    authError,
    clearAuthError,
    executeTradeSearch
  } = useTradeSearchExecution({
    selectedLeague,
    tradeStatus,
    sortBy,
    rawText,
    initialResults: cached?.tradeResults || null,
    addRecentSearch,
    onShowToast
  });

  const lastSyncedKeyRef = useRef<string>('');
  const lastParsedRawTextRef = useRef<string>('');
  const lastExternalTextRef = useRef<string>('');
  const resetFiltersRef = useRef(filters.resetFilters);
  resetFiltersRef.current = filters.resetFilters;

  useSyncAppState(appState, rawText, parsedItem, filters.mods, tradeStatus, sortBy, filters.linksMin, filters.corruptedFilter, filters.itemLevelMin, tradeResults, lastSyncedKeyRef);

  useEffect(() => {
    if (league && league !== selectedLeague) setSelectedLeague(league);
  }, [league, selectedLeague]);

  useEffect(() => {
    if (externalText && externalText.trim() !== lastExternalTextRef.current.trim()) {
      lastExternalTextRef.current = externalText.trim();
      setRawText(externalText);
    }
  }, [externalText]);

  const executeRef = useRef(executeTradeSearch);
  executeRef.current = executeTradeSearch;

  useEffect(() => {
    const trimmed = rawText ? rawText.trim() : '';
    if (!trimmed) {
      lastParsedRawTextRef.current = '';
      setParsedItem(null);
      resetFiltersRef.current(null);
      setTradeResults(null);
      return;
    }
    if (trimmed === lastParsedRawTextRef.current) return;
    lastParsedRawTextRef.current = trimmed;

    let isSubscribed = true;
    poeApi.parseItem(trimmed).then(parsed => {
      if (!isSubscribed) return;
      setParsedItem(parsed);
      const activeMods = resetFiltersRef.current(parsed);
      const autoLinks = parsed.sockets && (parsed.sockets.includes('W-W-W-W-W-W') || parsed.sockets.split('-').length === 6) ? 6 : undefined;
      const isCraftingBase = parsed.rarity === 'Normal' || parsed.rarity === 'Magic';
      executeRef.current(parsed, activeMods, autoLinks, parsed.corrupted, isCraftingBase ? parsed.itemLevel : undefined);
    });

    return () => { isSubscribed = false; };
  }, [rawText, setTradeResults]);

  return {
    selectedLeague, setSelectedLeague,
    tradeStatus, setTradeStatus,
    sortBy, setSortBy, loadingMore,
    rawText, setRawText, parsedItem, setParsedItem,
    mods: filters.mods, setMods: filters.setMods,
    linksMin: filters.linksMin, setLinksMin: filters.setLinksMin,
    corruptedFilter: filters.corruptedFilter, setCorruptedFilter: filters.setCorruptedFilter,
    itemLevelMin: filters.itemLevelMin, setItemLevelMin: filters.setItemLevelMin,
    rollPercentage: filters.rollPercentage, setRollPercentage: filters.setRollPercentage,
    searching, tradeResults, copiedId, authError, clearAuthError,
    recentSearches, clearRecentSearches,
    handleSearchTrade: () => executeTradeSearch(parsedItem, filters.mods, filters.linksMin, filters.corruptedFilter, filters.itemLevelMin),
    retrySearch: () => executeTradeSearch(parsedItem, filters.mods, filters.linksMin, filters.corruptedFilter, filters.itemLevelMin),
    handleLoadMore: () => {
      if (!tradeResults || loadingMore || tradeResults.listings.length >= tradeResults.total) return;
      executeTradeSearch(parsedItem, filters.mods, filters.linksMin, filters.corruptedFilter, filters.itemLevelMin, tradeResults.listings.length);
    },
    handleCopyWhisper: (listing: TradeListing) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(listing.whisper);
      setCopiedId(listing.id);
      onShowToast('已複製密語！可直接至遊戲內貼上。');
      setTimeout(() => setCopiedId(null), 2500);
    },
    handleSelectRecent: (item: RecentSearchItem) => setRawText(item.rawText),
    handleToggleMod: (idx: number) => {
      const m = filters.mods[idx];
      if (m) filters.setModEnabled(m.id, !m.enabled);
    },
    handleChangeMinValue: (idx: number, val?: number) => {
      const m = filters.mods[idx];
      if (m) filters.setModMinValue(m.id, val);
    },
    handleChangeMaxValue: (idx: number, val?: number) => {
      const m = filters.mods[idx];
      if (m) filters.setModMaxValue(m.id, val);
    },
    toggleMod: filters.setModEnabled,
    updateModMinValue: filters.setModMinValue,
    updateModMaxValue: filters.setModMaxValue,
    handleSelectRecentSearch: (item: RecentSearchItem) => setRawText(item.rawText),
    handleClearRecentSearches: clearRecentSearches,
    handleAddCustomMod: (mod: { text: string; englishText?: string; value?: number; minValue?: number; maxValue?: number }) => {
      filters.setMods(prev => [...prev, {
        id: `custom.${Date.now()}`, text: mod.text, englishText: mod.englishText || mod.text,
        type: 'explicit', value: mod.value, minValue: mod.minValue, maxValue: mod.maxValue, enabled: true
      }]);
    },
    handleRemoveMod: (idx: number) => filters.setMods(prev => prev.filter((_, i) => i !== idx))
  };
}
