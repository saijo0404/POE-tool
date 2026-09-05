import type { ParsedItem } from '../item/types';

export interface ClipboardHistoryItem {
  id: string;
  rawText: string;
  item: ParsedItem;
  timestamp: number;
  priceChaos?: number;
}

export interface ComparisonItem {
  id: string;
  item: ParsedItem;
  priceChaos?: number;
  addedAt: number;
}

export interface AffixComparison {
  name: string;
  type: string;
  values: Record<string, number | string | undefined>;
}

export interface ComparisonMetrics {
  priceMin?: number;
  priceMax?: number;
  priceMedian?: number;
  priceCount: number;
  itemLevelMin?: number;
  itemLevelMax?: number;
  itemLevelAvg?: number;
}

export interface ComparisonResult {
  items: ComparisonItem[];
  metrics: ComparisonMetrics;
  affixes: AffixComparison[];
}
