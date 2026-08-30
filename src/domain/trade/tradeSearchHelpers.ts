import { useEffect } from 'react';
import type { ParsedItem, ParsedItemMod } from '../item/types';
import type { TradeSearchResult, TradeStatusOption } from './types';
import type { AppStateContextType } from '../../context/AppStateContext';

export function getSortConfig(sortMode: 'price_asc' | 'price_desc' | 'indexed_desc') {
  if (sortMode === 'price_desc') return { price: 'desc' as const };
  if (sortMode === 'indexed_desc') return { indexed: 'desc' as const };
  return { price: 'asc' as const };
}

export function mergeTradeResults(prev: TradeSearchResult | null, next: TradeSearchResult | null): TradeSearchResult | null {
  if (!prev) return next;
  if (!next) return prev;
  const existingIds = new Set(prev.listings.map(l => l.id));
  const newUnique = next.listings.filter(l => !existingIds.has(l.id));
  return { ...prev, listings: [...prev.listings, ...newUnique] };
}

export function useSyncAppState(
  appState: AppStateContextType | null,
  rawText: string,
  parsedItem: ParsedItem | null,
  mods: ParsedItemMod[],
  tradeStatus: TradeStatusOption,
  sortBy: 'price_asc' | 'price_desc' | 'indexed_desc',
  linksMin: number | undefined,
  corruptedFilter: boolean | undefined,
  itemLevelMin: number | undefined,
  tradeResults: TradeSearchResult | null,
  lastSyncedKeyRef: React.MutableRefObject<string>
) {

  useEffect(() => {
    if (appState?.updatePriceCheckerState && rawText) {
      const syncKey = `${rawText}:${tradeResults?.id || ''}`;
      if (lastSyncedKeyRef.current !== syncKey) {
        lastSyncedKeyRef.current = syncKey;
        appState.updatePriceCheckerState({ rawText, parsedItem, mods, tradeStatus, sortBy, linksMin, corruptedFilter, itemLevelMin, tradeResults });
      }
    }
  }, [appState, rawText, parsedItem, mods, tradeStatus, sortBy, linksMin, corruptedFilter, itemLevelMin, tradeResults, lastSyncedKeyRef]);
}
