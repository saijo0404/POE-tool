import { useState, useCallback, useRef } from 'react';
import type { ParsedItem, ParsedItemMod, TradeSearchResult, TradeListing } from '../types/poe';
import { poeApi } from '../services/api';
import { useSettings } from './useSettings';
import { useOverlayWindowEvents } from './useOverlayWindowEvents';
import { buildSmartDefaultMods } from '../domain/trade/smartModFilter';
import { parseRuneSocketsMin } from '../domain/trade/tradeSearchHelpers';
import { evaluateMapDanger } from '../domain/mapMod/dangerEvaluator';
import { DEFAULT_MAP_DANGER_CONFIG } from '../domain/mapMod/dangerPresets';
import { playDangerAlertSound } from '../application/audio/alertSound';
import type { MapDangerEvaluation } from '../domain/mapMod/types';

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
  const [dangerEvaluation, setDangerEvaluation] = useState<MapDangerEvaluation | null>(null);

  const autoClose = settings.overlayAutoCloseOnBlur ?? true;
  const activeLeagueRef = useRef(activeLeague);
  activeLeagueRef.current = activeLeague;

  const handleCloseOverlay = useCallback(async () => {
    try {
      await poeApi.hideOverlayWindow();
    } catch {
      // Ignore fallback in web mode
    }
  }, []);

  const executeSearch = useCallback(async (item: ParsedItem, targetMods: ParsedItemMod[]) => {
    setSearching(true);
    setTradeResults(null);
    try {
      const activeMods = targetMods.filter(m => m.enabled);
      const res = await poeApi.searchTrade({
        league: activeLeagueRef.current || 'Standard',
        engine: item.engine,
        tradeStatus: 'instant',
        name: item.name,
        baseType: item.baseType,
        rarity: item.rarity,
        selectedMods: activeMods,
        item,
        fetchOffset: 0,
        spiritMin: item.spirit,
        waystoneTierMin: item.waystoneTier,
        uncutGemTierMin: item.uncutTier,
        runeSocketsMin: parseRuneSocketsMin(item.runeSockets)
      });
      setTradeResults(res);
    } catch (err) {
      console.error('[Overlay] searchTrade error:', err);
      setTradeResults(null);
    } finally {
      setSearching(false);
    }
  }, []);

  const loadAndParseItem = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRawText(trimmed);
    setTradeResults(null);
    setSearching(true);
    try {
      const parsed = await poeApi.parseItem(trimmed);
      setParsedItem(parsed);

      const cfg = settings.mapDangerConfig || DEFAULT_MAP_DANGER_CONFIG;
      const evalRes = evaluateMapDanger(parsed, cfg);
      setDangerEvaluation(evalRes);
      if (evalRes.isMap && evalRes.hasDanger && cfg.soundAlertEnabled) {
        playDangerAlertSound();
      }

      const initialMods: ParsedItemMod[] = buildSmartDefaultMods(parsed, 80);
      setMods(initialMods);
      await executeSearch(parsed, initialMods);
    } catch (err) {
      console.error('[Overlay] parseItem error:', err);
      setSearching(false);
    }
  }, [executeSearch, settings.mapDangerConfig]);

  useOverlayWindowEvents({
    autoClose,
    pinned,
    handleCloseOverlay,
    onLoadItem: loadAndParseItem
  });

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
    dangerEvaluation,
    handleCloseOverlay, handleSearchTrade: () => parsedItem && executeSearch(parsedItem, mods),
    toggleMod, handleCopyWhisper, handleTravelToHideout, handleOpenOfficialTrade,
    loadAndParseItem
  };
}
