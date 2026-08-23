import { useState, useCallback } from 'react';
import { LocalStorageAdapter } from '../infrastructure/storage/LocalStorageAdapter';

const RECENT_SEARCHES_KEY = 'poe_tool_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export interface RecentSearchItem {
  id: string;
  timestamp: number;
  name: string;
  baseType: string;
  rarity: string;
  rawText: string;
  minPriceDivine?: number;
  minPriceChaos?: number;
}

const storage = new LocalStorageAdapter();

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() =>
    storage.getItem<RecentSearchItem[]>(RECENT_SEARCHES_KEY, [])
  );

  const addRecentSearch = useCallback((item: RecentSearchItem) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(r => r.id !== item.id && r.rawText !== item.rawText);
      const updated = [item, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      storage.setItem(RECENT_SEARCHES_KEY, updated);
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    storage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  };
}
