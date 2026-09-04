import { describe, it, expect } from 'vitest';
import {
  createPriceSnapshot,
  evaluateSnapshotFreshness,
  serializePriceSnapshot,
  deserializePriceSnapshot,
  querySnapshotPrice
} from '../priceSnapshotEngine';
import type { PriceSnapshotItem } from '../priceSnapshotEngine';

describe('priceSnapshotEngine (Issue #100)', () => {
  const mockItems: PriceSnapshotItem[] = [
    { id: '1', name: 'Divine Orb', nameZh: '神聖石', category: 'Currency', chaosValue: 150, divineValue: 1 },
    { id: '2', name: 'Mirror of Kalandra', nameZh: '卡蘭德的魔鏡', category: 'Currency', chaosValue: 120000, divineValue: 800 },
    { id: '3', name: 'Mageblood', nameZh: '魔血', category: 'UniqueAccessory', chaosValue: 45000, divineValue: 300 }
  ];

  it('creates valid price snapshot with metadata and item counts', () => {
    const now = Date.now();
    const snapshot = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: mockItems,
      timestamp: now
    });

    expect(snapshot.version).toBe(1);
    expect(snapshot.league).toBe('Settlers');
    expect(snapshot.divinePriceChaos).toBe(150);
    expect(snapshot.itemCount).toBe(3);
    expect(snapshot.items.length).toBe(3);
    expect(snapshot.timestamp).toBe(now);
  });

  it('evaluates snapshot freshness and detects stale data accurately', () => {
    const now = 1725450000000;
    
    // Fresh snapshot: 2 hours ago
    const freshSnap = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: mockItems,
      timestamp: now - 2 * 60 * 60 * 1000
    });
    const freshStatus = evaluateSnapshotFreshness(freshSnap, now);
    expect(freshStatus.isStale).toBe(false);
    expect(freshStatus.ageHours).toBe(2);
    expect(freshStatus.relativeTimeText).toContain('2 小時前');

    // Stale snapshot: 30 hours ago (> 24h)
    const staleSnap = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: mockItems,
      timestamp: now - 30 * 60 * 60 * 1000
    });
    const staleStatus = evaluateSnapshotFreshness(staleSnap, now);
    expect(staleStatus.isStale).toBe(true);
    expect(staleStatus.ageHours).toBe(30);
    expect(staleStatus.relativeTimeText).toContain('1 天前');
  });

  it('serializes to JSON and deserializes back safely using Result<T, DomainError>', () => {
    const snapshot = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: mockItems
    });

    const json = serializePriceSnapshot(snapshot);
    expect(json).toContain('Divine Orb');

    const result = deserializePriceSnapshot(json);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.league).toBe('Settlers');
      expect(result.value.items.length).toBe(3);
    }
  });

  it('rejects invalid or corrupted snapshot JSON with DomainError', () => {
    const invalidJson = deserializePriceSnapshot('INVALID-JSON-NOT-PARSABLE');
    expect(invalidJson.isErr()).toBe(true);

    const missingProps = deserializePriceSnapshot(JSON.stringify({ foo: 'bar' }));
    expect(missingProps.isErr()).toBe(true);
  });

  it('queries price item by Chinese or English name flexibly', () => {
    const snapshot = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: mockItems
    });

    const byEn = querySnapshotPrice(snapshot, 'divine orb');
    expect(byEn?.nameZh).toBe('神聖石');

    const byZh = querySnapshotPrice(snapshot, '魔血');
    expect(byZh?.name).toBe('Mageblood');

    const notFound = querySnapshotPrice(snapshot, 'NonExistentItem');
    expect(notFound).toBeNull();
  });
});
