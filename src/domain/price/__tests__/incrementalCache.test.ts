import { describe, it, expect } from 'vitest';
import {
  computePriceDiff,
  applyPriceDelta,
  buildPriceIndex,
  queryPriceIndex,
  isDeltaExpired
} from '../incrementalCache';
import type { PriceSnapshotItem } from '../priceSnapshotEngine';

describe('incrementalCache (Issue #109)', () => {
  const itemA: PriceSnapshotItem = {
    id: 'item-a',
    name: 'Mirror of Kalandra',
    nameZh: '卡蘭德的魔鏡',
    category: 'Currency',
    chaosValue: 120000,
    divineValue: 800
  };

  const itemB: PriceSnapshotItem = {
    id: 'item-b',
    name: 'Divine Orb',
    nameZh: '神聖石',
    category: 'Currency',
    chaosValue: 150,
    divineValue: 1
  };

  const itemC: PriceSnapshotItem = {
    id: 'item-c',
    name: 'Exalted Orb',
    nameZh: '崇高石',
    category: 'Currency',
    chaosValue: 15,
    divineValue: 0.1
  };

  const itemD: PriceSnapshotItem = {
    id: 'item-d',
    name: 'Chaos Orb',
    nameZh: '混沌石',
    category: 'Currency',
    chaosValue: 1,
    divineValue: 0.006
  };

  it('computes accurate price diff between two snapshots', () => {
    const baseItems = [itemA, itemB, itemC];
    const updatedA = { ...itemA, chaosValue: 130000, divineValue: 850 };
    const targetItems = [updatedA, itemB, itemD]; // itemC removed, itemD added, itemA updated

    const delta = computePriceDiff(baseItems, targetItems, 1000, 2000);

    expect(delta.baseTimestamp).toBe(1000);
    expect(delta.targetTimestamp).toBe(2000);
    expect(delta.added).toHaveLength(1);
    expect(delta.added[0].id).toBe('item-d');

    expect(delta.updated).toHaveLength(1);
    expect(delta.updated[0].id).toBe('item-a');
    expect(delta.updated[0].chaosValue).toBe(130000);

    expect(delta.removedIds).toEqual(['item-c']);
    expect(delta.deltaCount).toBe(3);
  });

  it('reconstructs target items by applying delta to base items', () => {
    const baseItems = [itemA, itemB, itemC];
    const updatedA = { ...itemA, chaosValue: 130000 };
    const targetItems = [updatedA, itemB, itemD];

    const delta = computePriceDiff(baseItems, targetItems, 1000, 2000);
    const reconstructed = applyPriceDelta(baseItems, delta);

    expect(reconstructed).toHaveLength(3);
    const recA = reconstructed.find(i => i.id === 'item-a');
    expect(recA?.chaosValue).toBe(130000);

    const recB = reconstructed.find(i => i.id === 'item-b');
    expect(recB).toBeDefined();

    const recC = reconstructed.find(i => i.id === 'item-c');
    expect(recC).toBeUndefined();

    const recD = reconstructed.find(i => i.id === 'item-d');
    expect(recD).toBeDefined();
  });

  it('builds fast index and queries item by ID, English name, or Chinese name', () => {
    const index = buildPriceIndex([itemA, itemB]);

    // Query by ID
    expect(queryPriceIndex(index, 'item-a')?.nameZh).toBe('卡蘭德的魔鏡');
    // Query by English name
    expect(queryPriceIndex(index, 'mirror of kalandra')?.id).toBe('item-a');
    // Query by Chinese name
    expect(queryPriceIndex(index, '神聖石')?.id).toBe('item-b');
    // Query unknown item
    expect(queryPriceIndex(index, 'unknown')).toBeNull();
  });

  it('detects empty diff when two snapshots are identical', () => {
    const items = [itemA, itemB];
    const delta = computePriceDiff(items, items, 1000, 1000);

    expect(delta.added).toHaveLength(0);
    expect(delta.updated).toHaveLength(0);
    expect(delta.removedIds).toHaveLength(0);
    expect(delta.deltaCount).toBe(0);
  });

  it('evaluates TTL expiration accurately', () => {
    const delta = computePriceDiff([itemA], [itemA], 1000, 2000);
    const ttlMs = 1000 * 60 * 60; // 1 hour

    expect(isDeltaExpired(delta, ttlMs, 2000 + 1000 * 60 * 30)).toBe(false); // 30 mins later: not expired
    expect(isDeltaExpired(delta, ttlMs, 2000 + 1000 * 60 * 90)).toBe(true); // 90 mins later: expired
  });
});
