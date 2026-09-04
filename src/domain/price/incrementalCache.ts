import type { PriceSnapshotItem } from './priceSnapshotEngine';

export interface PriceDelta {
  added: PriceSnapshotItem[];
  updated: PriceSnapshotItem[];
  removedIds: string[];
  baseTimestamp: number;
  targetTimestamp: number;
  deltaCount: number;
}

export interface PriceIndexLookup {
  byId: Map<string, PriceSnapshotItem>;
  byNameZh: Map<string, PriceSnapshotItem>;
  byNameEn: Map<string, PriceSnapshotItem>;
}

function isItemUpdated(base: PriceSnapshotItem, target: PriceSnapshotItem): boolean {
  return base.chaosValue !== target.chaosValue || base.divineValue !== target.divineValue;
}

/**
 * Computes difference (added, updated, removed) between base and target item snapshots
 */
export function computePriceDiff(
  baseItems: PriceSnapshotItem[],
  targetItems: PriceSnapshotItem[],
  baseTimestamp: number,
  targetTimestamp: number
): PriceDelta {
  const baseMap = new Map<string, PriceSnapshotItem>();
  baseItems.forEach(i => baseMap.set(i.id, i));

  const targetMap = new Map<string, PriceSnapshotItem>();
  const added: PriceSnapshotItem[] = [];
  const updated: PriceSnapshotItem[] = [];

  targetItems.forEach(target => {
    targetMap.set(target.id, target);
    const base = baseMap.get(target.id);
    if (!base) {
      added.push(target);
    } else if (isItemUpdated(base, target)) {
      updated.push(target);
    }
  });

  const removedIds: string[] = [];
  baseItems.forEach(base => {
    if (!targetMap.has(base.id)) {
      removedIds.push(base.id);
    }
  });

  return {
    added,
    updated,
    removedIds,
    baseTimestamp,
    targetTimestamp,
    deltaCount: added.length + updated.length + removedIds.length
  };
}

/**
 * Applies a price delta to base items to reconstitute the target items snapshot
 */
export function applyPriceDelta(
  baseItems: PriceSnapshotItem[],
  delta: PriceDelta
): PriceSnapshotItem[] {
  const itemMap = new Map<string, PriceSnapshotItem>();
  baseItems.forEach(item => itemMap.set(item.id, item));

  delta.removedIds.forEach(id => itemMap.delete(id));
  delta.updated.forEach(item => itemMap.set(item.id, item));
  delta.added.forEach(item => itemMap.set(item.id, item));

  return Array.from(itemMap.values());
}

/**
 * Builds multi-key fast O(1) in-memory lookup index
 */
export function buildPriceIndex(items: PriceSnapshotItem[]): PriceIndexLookup {
  const byId = new Map<string, PriceSnapshotItem>();
  const byNameZh = new Map<string, PriceSnapshotItem>();
  const byNameEn = new Map<string, PriceSnapshotItem>();

  items.forEach(item => {
    byId.set(item.id, item);
    if (item.nameZh) byNameZh.set(item.nameZh.toLowerCase().trim(), item);
    if (item.name) byNameEn.set(item.name.toLowerCase().trim(), item);
  });

  return { byId, byNameZh, byNameEn };
}

/**
 * Queries price index by ID, English name, or Chinese name
 */
export function queryPriceIndex(
  index: PriceIndexLookup,
  query: string
): PriceSnapshotItem | null {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  return index.byId.get(query) || index.byNameZh.get(q) || index.byNameEn.get(q) || null;
}

/**
 * Evaluates whether a delta has expired according to time-to-live threshold
 */
export function isDeltaExpired(
  delta: PriceDelta,
  ttlMs: number,
  currentTime: number = Date.now()
): boolean {
  return currentTime - delta.targetTimestamp > ttlMs;
}
