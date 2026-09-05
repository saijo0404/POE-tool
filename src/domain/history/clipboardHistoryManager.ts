import type { ParsedItem } from '../item/types';
import type {
  ClipboardHistoryItem,
  ComparisonItem,
  AffixComparison,
  ComparisonResult,
  ComparisonMetrics
} from './types';

function generateHistoryId(rawText: string, timestamp: number): string {
  let hash = 0;
  for (let i = 0; i < rawText.length; i++) {
    hash = ((hash << 5) - hash + rawText.charCodeAt(i)) | 0;
  }
  return `hist_${timestamp}_${Math.abs(hash).toString(36)}`;
}

export function createHistoryItem(
  rawText: string,
  item: ParsedItem,
  priceChaos?: number,
  timestamp: number = Date.now()
): ClipboardHistoryItem {
  return {
    id: generateHistoryId(rawText, timestamp),
    rawText,
    item,
    timestamp,
    priceChaos
  };
}

export function addHistoryItem(
  history: ClipboardHistoryItem[],
  newItem: ClipboardHistoryItem,
  maxItems = 20
): ClipboardHistoryItem[] {
  const filtered = history.filter(h => h.rawText !== newItem.rawText);
  return [newItem, ...filtered].slice(0, maxItems);
}

export function addToComparison(
  tray: ComparisonItem[],
  item: ParsedItem,
  priceChaos?: number,
  maxTray = 4
): { tray: ComparisonItem[]; success: boolean; reason?: string } {
  const exists = tray.some(t => t.item.rawText === item.rawText);
  if (exists) {
    return { tray, success: false, reason: 'ALREADY_EXISTS' };
  }
  if (tray.length >= maxTray) {
    return { tray, success: false, reason: 'TRAY_FULL' };
  }
  const newItem: ComparisonItem = {
    id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    item,
    priceChaos,
    addedAt: Date.now()
  };
  return { tray: [...tray, newItem], success: true };
}

export function removeFromComparison(tray: ComparisonItem[], itemId: string): ComparisonItem[] {
  return tray.filter(item => item.id !== itemId);
}

export function clearComparison(): ComparisonItem[] {
  return [];
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function computePriceMetrics(tray: ComparisonItem[]): Partial<ComparisonMetrics> {
  const prices = tray.map(t => t.priceChaos).filter((p): p is number => p != null && !Number.isNaN(p));
  if (prices.length === 0) return { priceCount: 0 };
  return {
    priceMin: Math.min(...prices),
    priceMax: Math.max(...prices),
    priceMedian: calculateMedian(prices),
    priceCount: prices.length
  };
}

function computeItemLevelMetrics(tray: ComparisonItem[]): Partial<ComparisonMetrics> {
  const ilvls = tray.map(t => t.item.itemLevel).filter((l): l is number => l != null && !Number.isNaN(l));
  if (ilvls.length === 0) return {};
  const avg = ilvls.reduce((sum, n) => sum + n, 0) / ilvls.length;
  return {
    itemLevelMin: Math.min(...ilvls),
    itemLevelMax: Math.max(...ilvls),
    itemLevelAvg: avg
  };
}

function extractAffixComparisons(tray: ComparisonItem[]): AffixComparison[] {
  const affixMap = new Map<string, AffixComparison>();
  for (const comp of tray) {
    const allMods = [...comp.item.implicits, ...comp.item.explicits];
    for (const mod of allMods) {
      const cleanName = mod.text.replace(/^[+-]?\d+(\.\d+)?%?\s*/, '').trim() || mod.text;
      let entry = affixMap.get(cleanName);
      if (!entry) {
        entry = { name: cleanName, type: mod.type, values: {} };
        affixMap.set(cleanName, entry);
      }
      entry.values[comp.id] = mod.value ?? mod.text;
    }
  }
  return Array.from(affixMap.values());
}

export function compareItems(tray: ComparisonItem[]): ComparisonResult {
  if (tray.length === 0) {
    return { items: [], metrics: { priceCount: 0 }, affixes: [] };
  }
  const priceMetrics = computePriceMetrics(tray);
  const ilvlMetrics = computeItemLevelMetrics(tray);
  const affixes = extractAffixComparisons(tray);
  return {
    items: tray,
    metrics: { priceCount: 0, ...priceMetrics, ...ilvlMetrics },
    affixes
  };
}
