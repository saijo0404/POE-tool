import { useState, useCallback } from 'react';
import type { ParsedItem, ParsedItemMod } from '../types/poe';

export interface UseItemFiltersProps {
  initialMods?: ParsedItemMod[];
  initialLinksMin?: number;
  initialCorrupted?: boolean;
  initialItemLevelMin?: number;
}

export function useItemFilters(initial?: UseItemFiltersProps) {
  const [mods, setMods] = useState<ParsedItemMod[]>(initial?.initialMods || []);
  const [linksMin, setLinksMin] = useState<number | undefined>(initial?.initialLinksMin);
  const [corruptedFilter, setCorruptedFilter] = useState<boolean | undefined>(initial?.initialCorrupted);
  const [itemLevelMin, setItemLevelMin] = useState<number | undefined>(initial?.initialItemLevelMin);

  const setModEnabled = useCallback((id: string, enabled: boolean) => {
    setMods(prev => prev.map(m => (m.id === id ? { ...m, enabled } : m)));
  }, []);

  const setModMinValue = useCallback((id: string, minValue?: number) => {
    setMods(prev => prev.map(m => (m.id === id ? { ...m, minValue } : m)));
  }, []);

  const setModMaxValue = useCallback((id: string, maxValue?: number) => {
    setMods(prev => prev.map(m => (m.id === id ? { ...m, maxValue } : m)));
  }, []);

  const resetFilters = useCallback((parsed: ParsedItem | null) => {
    if (!parsed) {
      setMods([]);
      setLinksMin(undefined);
      setCorruptedFilter(undefined);
      setItemLevelMin(undefined);
      return [];
    }

    const autoLinks = calculateAutoLinks(parsed.sockets);
    setLinksMin(autoLinks);
    setCorruptedFilter(parsed.corrupted);

    const isCraftingBase = parsed.rarity === 'Normal' || parsed.rarity === 'Magic';
    setItemLevelMin(isCraftingBase ? parsed.itemLevel : undefined);

    const initialActive = buildInitialMods(parsed);
    setMods(initialActive);
    return initialActive.filter(m => m.enabled);
  }, []);

  return {
    mods,
    setMods,
    linksMin,
    setLinksMin,
    corruptedFilter,
    setCorruptedFilter,
    itemLevelMin,
    setItemLevelMin,
    setModEnabled,
    setModMinValue,
    setModMaxValue,
    resetFilters
  };
}

function calculateAutoLinks(sockets?: string): number | undefined {
  if (!sockets) return undefined;
  if (sockets.includes('W-W-W-W-W-W') || sockets.split('-').length === 6) return 6;
  if (sockets.split('-').length === 5) return 5;
  return undefined;
}

function buildInitialMods(parsed: ParsedItem): ParsedItemMod[] {
  const isUnique = parsed.rarity === 'Unique';
  const implicits = (parsed.implicits || []).map(m => ({
    ...m,
    enabled: false,
    minValue: m.minValue ?? m.value,
    maxValue: m.maxValue
  }));

  const explicits = (parsed.explicits || []).map((m, idx) => ({
    ...m,
    enabled: isUnique ? idx < 2 : true,
    minValue: m.minValue ?? m.value,
    maxValue: m.maxValue
  }));

  return [...implicits, ...explicits];
}
