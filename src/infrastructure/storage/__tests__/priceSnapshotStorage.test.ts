import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePriceSnapshot,
  loadPriceSnapshot,
  clearPriceSnapshot
} from '../priceSnapshotStorage';
import { createPriceSnapshot } from '../../../domain/price/priceSnapshotEngine';

describe('priceSnapshotStorage (Issue #100)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads price snapshot from storage', () => {
    const snapshot = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: [
        { id: '1', name: 'Divine Orb', nameZh: '神聖石', category: 'Currency', chaosValue: 150 }
      ]
    });

    savePriceSnapshot(snapshot);
    const loaded = loadPriceSnapshot();

    expect(loaded).not.toBeNull();
    expect(loaded?.league).toBe('Settlers');
    expect(loaded?.items.length).toBe(1);
    expect(loaded?.items[0].name).toBe('Divine Orb');
  });

  it('clears stored price snapshot', () => {
    const snapshot = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: []
    });

    savePriceSnapshot(snapshot);
    clearPriceSnapshot();
    expect(loadPriceSnapshot()).toBeNull();
  });
});
