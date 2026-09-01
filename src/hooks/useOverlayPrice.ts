import { useState, useEffect, useCallback } from 'react';
import type { ParsedItem, ParsedItemMod, TradeSearchResult, TradeListing } from '../types/poe';
import { poeApi } from '../services/api';
import { isTauri } from '../utils/tauri';
import { useSettings } from './useSettings';

export function useOverlayPrice() {
  const { settings, activeLeague } = useSettings();
  const [rawText, setRawText] = useState<string>('');
  const [parsedItem, setParsedItem] = useState<ParsedItem | null>(null);
  const [mods, setMods] = useState<ParsedItemMod[]>([]);
  const [tradeResults, setTradeResults] = useState<TradeSearchResult | null>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pinned, setPinned] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(settings.overlayOpacity ?? 0.92);
  const [scale, setScale] = useState<number>(settings.overlayScale ?? 1.0);
  const [clickThrough, setClickThrough] = useState<boolean>(settings.overlayClickThrough ?? false);

  const autoClose = settings.overlayAutoCloseOnBlur ?? true;

  const handleCloseOverlay = useCallback(async () => {
    try {
      await poeApi.hideOverlayWindow();
    } catch {
      // Ignore fallback in web mode
    }
  }, []);

  const executeSearch = useCallback(async (item: ParsedItem, targetMods: ParsedItemMod[]) => {
    setSearching(true);
    try {
      const activeMods = targetMods.filter(m => m.enabled);
      const res = await poeApi.searchTrade({
        league: activeLeague || 'Standard',
        tradeStatus: 'instant',
        name: item.name,
        baseType: item.baseType,
        rarity: item.rarity,
        selectedMods: activeMods,
        item,
        fetchOffset: 0
      });
      setTradeResults(res);
    } catch {
      // Fallback
    } finally {
      setSearching(false);
    }
  }, [activeLeague]);

  const loadAndParseItem = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRawText(trimmed);
    try {
      const parsed = await poeApi.parseItem(trimmed);
      setParsedItem(parsed);
      const initialMods: ParsedItemMod[] = [
        ...parsed.implicits.map((m, i) => ({
          id: `implicit.${i}`,
          text: m.text,
          englishText: m.englishText || m.text,
          type: 'implicit' as const,
          value: m.value,
          minValue: m.minValue,
          maxValue: m.maxValue,
          enabled: false
        })),
        ...parsed.explicits.map((m, i) => ({
          id: `explicit.${i}`,
          text: m.text,
          englishText: m.englishText || m.text,
          type: 'explicit' as const,
          tier: m.tier,
          value: m.value,
          minValue: m.minValue,
          maxValue: m.maxValue,
          enabled: parsed.rarity === 'Rare'
        }))
      ];
      setMods(initialMods);
      executeSearch(parsed, initialMods);
      try {
        await poeApi.showOverlayWindow(undefined, undefined, trimmed);
      } catch {
        // Ignore in web fallback
      }
    } catch {
      // Parse error
    }
  }, [executeSearch]);


  // Esc key and Window Blur listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseOverlay();
      }
    };

    const handleBlur = () => {
      if (autoClose && !pinned) {
        handleCloseOverlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, [autoClose, pinned, handleCloseOverlay]);

  // Listen to Tauri events for new item queries
  useEffect(() => {
    if (!isTauri()) return;
    let unmounted = false;
    let unlistens: Array<() => void> = [];

    import('@tauri-apps/api/event').then(({ listen }) => {
      if (unmounted) return;
      listen<string>('overlay-show-item', (ev) => {
        if (ev.payload) loadAndParseItem(ev.payload);
      }).then(u => unlistens.push(u));

      listen<{ text?: string }>('poe-item-copied', (ev) => {
        const t = typeof ev.payload === 'string' ? ev.payload : ev.payload?.text;
        if (t) loadAndParseItem(t);
      }).then(u => unlistens.push(u));
    });

    return () => {
      unmounted = true;
      unlistens.forEach(u => u());
    };
  }, [loadAndParseItem]);

  const toggleMod = useCallback((idx: number) => {
    setMods(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx] = { ...next[idx], enabled: !next[idx].enabled };
        if (parsedItem) executeSearch(parsedItem, next);
      }
      return next;
    });
  }, [parsedItem, executeSearch]);

  const handleCopyWhisper = useCallback((listing: TradeListing) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(listing.whisper);
    }
    setCopiedId(listing.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleTravelToHideout = useCallback(async (listing: TradeListing) => {
    try {
      await poeApi.travelToHideout({
        token: listing.id,
        characterName: listing.characterName,
        league: activeLeague
      });
      setCopiedId(listing.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  }, [activeLeague]);

  const handleOpenOfficialTrade = useCallback(async () => {
    if (!parsedItem) return;
    const query = {
      query: {
        status: { option: 'online' },
        name: parsedItem.name || undefined,
        type: parsedItem.baseType || undefined
      }
    };
    await poeApi.createTradeSearchUrl(activeLeague || 'Standard', JSON.stringify(query));
  }, [parsedItem, activeLeague]);

  const handleToggleClickThrough = useCallback(async () => {
    const next = !clickThrough;
    setClickThrough(next);
    await poeApi.setOverlayClickThrough(next);
  }, [clickThrough]);

  return {
    rawText, parsedItem, mods, tradeResults, searching, copiedId,
    pinned, setPinned, opacity, setOpacity, scale, setScale,
    clickThrough, handleToggleClickThrough,
    handleCloseOverlay, handleSearchTrade: () => parsedItem && executeSearch(parsedItem, mods),
    toggleMod, handleCopyWhisper, handleTravelToHideout, handleOpenOfficialTrade,
    loadAndParseItem
  };
}
