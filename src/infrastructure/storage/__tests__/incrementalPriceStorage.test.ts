import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePriceDeltas,
  loadPriceDeltas,
  appendPriceDelta,
  clearPriceDeltas
} from '../IncrementalPriceStorage';
import type { IStoragePort } from '../../../application/ports/IStoragePort';
import type { PriceDelta } from '../../../domain/price/incrementalCache';

class MockStorage implements IStoragePort {
  private store = new Map<string, unknown>();

  getItem<T>(key: string, defaultValue: T): T {
    const val = this.store.get(key);
    return val !== undefined ? (val as T) : defaultValue;
  }

  setItem<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('IncrementalPriceStorage', () => {
  let storage: MockStorage;
  const mockDelta: PriceDelta = {
    added: [],
    updated: [],
    removedIds: ['item-1'],
    baseTimestamp: 1000,
    targetTimestamp: 2000,
    deltaCount: 1
  };

  beforeEach(() => {
    storage = new MockStorage();
  });

  it('saves and loads price deltas', () => {
    savePriceDeltas([mockDelta], storage);
    const loaded = loadPriceDeltas(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].removedIds).toEqual(['item-1']);
  });

  it('appends price deltas and respects max limit', () => {
    for (let i = 0; i < 5; i++) {
      appendPriceDelta({ ...mockDelta, targetTimestamp: 2000 + i }, 3, storage);
    }
    const loaded = loadPriceDeltas(storage);
    expect(loaded).toHaveLength(3);
    expect(loaded[2].targetTimestamp).toBe(2004);
  });

  it('clears deltas properly', () => {
    savePriceDeltas([mockDelta], storage);
    clearPriceDeltas(storage);
    expect(loadPriceDeltas(storage)).toEqual([]);
  });
});
