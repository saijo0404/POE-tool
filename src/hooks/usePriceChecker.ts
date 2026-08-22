import { useState, useEffect, useCallback, useRef } from 'react';
import type { ParsedItem, ParsedItemMod, TradeSearchResult } from '../types/poe';
import { poeApi } from '../services/api';
import { useAppState } from './useAppState';

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

function loadRecentSearches(): RecentSearchItem[] {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(items: RecentSearchItem[]): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, MAX_RECENT_SEARCHES)));
  } catch {}
}

export function formatModText(mod: any): string {
  if (!mod) return '';
  if (typeof mod === 'string') return mod;
  if (typeof mod === 'object') {
    if (typeof mod.text === 'string') return mod.text;
    if (typeof mod.name === 'string') return mod.name;
    if (typeof mod.description === 'string') return mod.description;
    if (Array.isArray(mod.mods)) return mod.mods.map(formatModText).join(', ');
    return mod.id || mod.hash || '';
  }
  return String(mod);
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
  let appState: any = null;
  try {
    appState = useAppState();
  } catch {}

  const cached = appState?.priceCheckerState;
  const [selectedLeague, setSelectedLeague] = useState<string>(league || 'Standard');
  const [tradeStatus, setTradeStatus] = useState<'instant' | 'securable' | 'any_buyout' | 'onlineleague' | 'online' | 'any'>(cached?.tradeStatus || 'instant');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'indexed_desc'>(cached?.sortBy || 'price_asc');
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>(cached?.rawText || '');
  const [parsedItem, setParsedItem] = useState<ParsedItem | null>(cached?.parsedItem || null);
  const [mods, setMods] = useState<ParsedItemMod[]>(cached?.mods || []);
  const [linksMin, setLinksMin] = useState<number | undefined>(cached?.linksMin);
  const [corruptedFilter, setCorruptedFilter] = useState<boolean | undefined>(cached?.corruptedFilter);
  const [itemLevelMin, setItemLevelMin] = useState<number | undefined>(cached?.itemLevelMin);
  const [searching, setSearching] = useState<boolean>(false);
  const [tradeResults, setTradeResults] = useState<TradeSearchResult | null>(cached?.tradeResults || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(loadRecentSearches);
  const updatePriceCheckerState = appState?.updatePriceCheckerState;
  const lastSyncedKeyRef = useRef<string>('');
  const lastParsedRawTextRef = useRef<string>('');

  // Sync state to AppStateContext cache only when tradeResults or rawText changes to avoid re-render loops
  useEffect(() => {
    if (updatePriceCheckerState && rawText) {
      const syncKey = `${rawText}:${tradeResults?.id || ''}`;
      if (lastSyncedKeyRef.current !== syncKey) {
        lastSyncedKeyRef.current = syncKey;
        updatePriceCheckerState({
          rawText,
          parsedItem,
          mods,
          tradeStatus,
          sortBy,
          linksMin,
          corruptedFilter,
          itemLevelMin,
          tradeResults
        });
      }
    }
  }, [tradeResults, rawText, updatePriceCheckerState]);

  // Sync league from props
  useEffect(() => {
    if (league && league !== selectedLeague) {
      setSelectedLeague(league);
    }
  }, [league, selectedLeague]);

  // Sync external text (e.g. from hotkey clipboard read)
  useEffect(() => {
    if (externalText && externalText !== rawText) {
      setRawText(externalText);
    }
  }, [externalText, rawText]);

  const getSortConfig = (sortMode: 'price_asc' | 'price_desc' | 'indexed_desc') => {
    if (sortMode === 'price_desc') return { price: 'desc' as const };
    if (sortMode === 'indexed_desc') return { indexed: 'desc' as const };
    return { price: 'asc' as const };
  };

  // Parse item text ONLY when rawText actually changes
  useEffect(() => {
    const trimmed = rawText ? rawText.trim() : '';
    if (!trimmed) {
      lastParsedRawTextRef.current = '';
      setParsedItem(null);
      setMods([]);
      setLinksMin(undefined);
      setCorruptedFilter(undefined);
      setItemLevelMin(undefined);
      setTradeResults(null);
      return;
    }

    if (trimmed === lastParsedRawTextRef.current) {
      return; // Already parsed this exact text, avoid redundant parsing & query loops
    }
    lastParsedRawTextRef.current = trimmed;

    let isSubscribed = true;
    console.log('[usePriceChecker] 📋 Triggering poeApi.parseItem for rawText length:', trimmed.length);
    poeApi.parseItem(trimmed)
      .then((parsed) => {
        if (!isSubscribed) return;
        console.log('[usePriceChecker] 🎯 Parsed item received:', parsed);
        setParsedItem(parsed);

        let autoLinks: number | undefined = undefined;
        if (parsed.sockets && (parsed.sockets.includes('W-W-W-W-W-W') || parsed.sockets.split('-').length === 6)) {
          autoLinks = 6;
        } else if (parsed.sockets && parsed.sockets.split('-').length === 5) {
          autoLinks = 5;
        }
        setLinksMin(autoLinks);

        const autoCorrupted = parsed.corrupted;
        setCorruptedFilter(autoCorrupted);

        const isCraftingBase = parsed.rarity === 'Normal' || parsed.rarity === 'Magic';
        const autoIlvl = (isCraftingBase && parsed.itemLevel && parsed.itemLevel >= 84) ? parsed.itemLevel : undefined;
        setItemLevelMin(autoIlvl);

        const isRare = parsed.rarity === 'Rare';
        const allMods: ParsedItemMod[] = [];
        if (parsed.implicits && Array.isArray(parsed.implicits)) {
          allMods.push(...parsed.implicits.map(m => ({
            ...m,
            enabled: false,
            minValue: m.minValue ?? m.value,
            maxValue: undefined
          })));
        }
        if (parsed.explicits && Array.isArray(parsed.explicits)) {
          allMods.push(...parsed.explicits.map(m => {
            const isValidStat = m.id && !m.id.startsWith('custom.') && !m.id.startsWith('explicit.custom');
            const textLower = (m.text || '').toLowerCase();
            const isMinorStat = textLower.includes('stun and block recovery')
              || textLower.includes('light radius')
              || textLower.includes('reduced attribute')
              || textLower.includes('life per enemy');

            return {
              ...m,
              enabled: Boolean(isValidStat && (!isRare || !isMinorStat)),
              minValue: m.minValue ?? m.value,
              maxValue: undefined
            };
          }));
        }
        console.log('[usePriceChecker] 🧩 Initialized allMods (count =', allMods.length, '):', allMods);
        setMods(allMods);

        // Automatically trigger live trade market search immediately upon parsing
        const initialActiveMods = allMods.filter(m => m.enabled);
        console.log('[usePriceChecker] 🚀 Auto-searching official trade with initialActiveMods (count =', initialActiveMods.length, '):', initialActiveMods);
        setSearching(true);
        poeApi.searchTrade({
          league: selectedLeague,
          name: parsed.name,
          baseType: parsed.baseType,
          rarity: parsed.rarity,
          item: parsed,
          selectedMods: initialActiveMods,
          tradeStatus,
          linksMin: autoLinks,
          corrupted: autoCorrupted,
          itemLevelMin: autoIlvl,
          sort: getSortConfig(sortBy)
        }).then(res => {
          if (!isSubscribed) return;
          console.log('[usePriceChecker] ✅ Auto search success, total results =', res?.total);
          setTradeResults(res);
        }).catch(err => {
          if (!isSubscribed) return;
          console.warn('[usePriceChecker] ⚠️ Auto trade search error:', err);
        }).finally(() => {
          if (isSubscribed) setSearching(false);
        });
      })
      .catch((err) => {
        console.warn('[usePriceChecker] ❌ Item parsing error:', err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [rawText, selectedLeague]);

  // Search official trade API
  const handleSearchTrade = useCallback(async () => {
    if (!parsedItem) return;

    setSearching(true);
    try {
      const selectedMods = mods.filter(m => m.enabled);
      console.log('[usePriceChecker] 🔎 Manual handleSearchTrade triggered. Selected mods (count =', selectedMods.length, '):', selectedMods);
      const res = await poeApi.searchTrade({
        league: selectedLeague,
        name: parsedItem.name,
        baseType: parsedItem.baseType,
        rarity: parsedItem.rarity,
        item: parsedItem,
        selectedMods,
        tradeStatus,
        linksMin,
        corrupted: corruptedFilter,
        itemLevelMin,
        sort: getSortConfig(sortBy)
      });

      console.log('[usePriceChecker] 📊 Trade search result received:', res);
      setTradeResults(res);

      // Save to recent search history
      const newEntry: RecentSearchItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        name: parsedItem.name || parsedItem.baseType || 'Unknown Item',
        baseType: parsedItem.baseType || '',
        rarity: parsedItem.rarity || 'Rare',
        rawText,
        minPriceDivine: res.estimatedMinPriceDivine > 0 ? res.estimatedMinPriceDivine : undefined,
        minPriceChaos: res.estimatedMinPriceChaos > 0 ? res.estimatedMinPriceChaos : undefined
      };

      setRecentSearches(prev => {
        const filtered = prev.filter(p => p.rawText.trim() !== rawText.trim());
        const nextList = [newEntry, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        saveRecentSearches(nextList);
        return nextList;
      });

      if (res.total > 0) {
        onShowToast(`查詢成功！找到 ${res.total} 筆刊登資料`);
      } else {
        onShowToast('未找到符合條件的拍賣品，請嘗試放寬篩選');
      }
    } catch (err: any) {
      console.error('Trade search error:', err);
      onShowToast(`查價失敗: ${err.message || '請確認網路與 POESESSID 設定'}`);
    } finally {
      setSearching(false);
    }
  }, [parsedItem, mods, selectedLeague, tradeStatus, linksMin, corruptedFilter, itemLevelMin, sortBy, rawText, onShowToast]);

  // Load more trade listings (pagination)
  const handleLoadMore = useCallback(async () => {
    if (!tradeResults || !parsedItem || loadingMore) return;
    const currentCount = tradeResults.listings.length;
    if (currentCount >= tradeResults.total) {
      onShowToast('已載入全部搜尋結果！');
      return;
    }

    setLoadingMore(true);
    try {
      const selectedMods = mods.filter(m => m.enabled);
      const res = await poeApi.searchTrade({
        league: selectedLeague,
        name: parsedItem.name,
        baseType: parsedItem.baseType,
        rarity: parsedItem.rarity,
        item: parsedItem,
        selectedMods,
        tradeStatus,
        linksMin,
        corrupted: corruptedFilter,
        itemLevelMin,
        sort: getSortConfig(sortBy),
        fetchOffset: currentCount,
        searchId: tradeResults.searchId || tradeResults.id
      });

      if (res && res.listings && res.listings.length > 0) {
        setTradeResults(prev => {
          if (!prev) return res;
          const existingIds = new Set(prev.listings.map(l => l.id));
          const newUniqueListings = res.listings.filter(l => !existingIds.has(l.id));
          return {
            ...prev,
            listings: [...prev.listings, ...newUniqueListings]
          };
        });
        onShowToast(`已載入更多 ${res.listings.length} 筆刊登！`);
      } else {
        onShowToast('沒有更多刊登資料了');
      }
    } catch (err: any) {
      console.error('Load more listings error:', err);
      onShowToast('載入更多失敗');
    } finally {
      setLoadingMore(false);
    }
  }, [tradeResults, parsedItem, loadingMore, mods, selectedLeague, tradeStatus, linksMin, corruptedFilter, itemLevelMin, sortBy, onShowToast]);

  // Read item text directly from system clipboard
  const handleReadClipboard = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.includes('Rarity:') || text.includes('稀有度:'))) {
          setRawText(text);
          onShowToast('已成功從剪貼簿讀取 PoE 裝備資料！');
          return;
        }
      }
      // Fallback to backend clipboard service
      const res = await poeApi.readClipboard();
      if (res && res.text) {
        setRawText(res.text);
        onShowToast('已從後端剪貼簿取得裝備資料！');
      } else {
        onShowToast('剪貼簿中未偵測到 PoE 裝備文字');
      }
    } catch (err) {
      console.error('Clipboard read failed:', err);
      onShowToast('無法讀取剪貼簿，請手動貼上');
    }
  }, [onShowToast]);

  // Mod toggle and min/max handlers
  const handleToggleMod = useCallback((index: number) => {
    setMods(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], enabled: !next[index].enabled };
        if (next[index].enabled && next[index].value !== undefined && next[index].minValue === undefined) {
          next[index].minValue = Math.floor(next[index].value! * 0.85);
        }
      }
      return next;
    });
  }, []);

  const handleChangeMinValue = useCallback((index: number, val: number | undefined) => {
    setMods(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], minValue: val };
      }
      return next;
    });
  }, []);

  const handleChangeMaxValue = useCallback((index: number, val: number | undefined) => {
    setMods(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], maxValue: val };
      }
      return next;
    });
  }, []);

  const handleAddCustomMod = useCallback((newMod: { text: string; englishText?: string; value?: number; minValue?: number; maxValue?: number }) => {
    const mod: ParsedItemMod = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text: newMod.text,
      englishText: newMod.englishText || newMod.text,
      type: 'explicit' as const,
      value: newMod.value,
      minValue: newMod.minValue ?? (newMod.value ? Math.floor(newMod.value * 0.85) : undefined),
      maxValue: newMod.maxValue,
      enabled: true
    };
    setMods(prev => [...prev, mod]);
    onShowToast(`已新增自訂篩選詞綴：「${newMod.text}」`);
  }, [onShowToast]);

  const handleRemoveMod = useCallback((index: number) => {
    setMods(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCopyWhisper = useCallback(async (listing: any) => {
    if (!listing || !listing.whisper) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(listing.whisper);
      }
      setCopiedId(listing.id);
      onShowToast('已複製密語！可直接在遊戲聊天室按 Ctrl+V 貼上');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      onShowToast('複製密語失敗');
    }
  }, [onShowToast]);

  const handleSelectRecentSearch = useCallback((item: RecentSearchItem) => {
    setRawText(item.rawText);
    onShowToast(`已載入歷史查價紀錄：${item.name}`);
  }, [onShowToast]);

  const handleClearRecentSearches = useCallback(() => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
    setRecentSearches([]);
    onShowToast('已清除最近查價歷史紀錄');
  }, [onShowToast]);

  return {
    selectedLeague,
    setSelectedLeague,
    tradeStatus,
    setTradeStatus,
    sortBy,
    setSortBy,
    loadingMore,
    handleLoadMore,
    rawText,
    setRawText,
    parsedItem,
    mods,
    linksMin,
    setLinksMin,
    corruptedFilter,
    setCorruptedFilter,
    itemLevelMin,
    setItemLevelMin,
    searching,
    tradeResults,
    copiedId,
    recentSearches,
    handleSearchTrade,
    handleReadClipboard,
    handleToggleMod,
    handleChangeMinValue,
    handleChangeMaxValue,
    handleCopyWhisper,
    handleSelectRecentSearch,
    handleClearRecentSearches,
    handleAddCustomMod,
    handleRemoveMod
  };
}
