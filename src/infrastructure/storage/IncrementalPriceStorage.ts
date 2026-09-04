import type { IStoragePort } from '../../application/ports/IStoragePort';
import { defaultStorage } from './LocalStorageAdapter';
import type { PriceDelta } from '../../domain/price/incrementalCache';

const STORAGE_KEY_DELTAS = 'poe_incremental_price_deltas';

export function savePriceDeltas(
  deltas: PriceDelta[],
  storage: IStoragePort = defaultStorage
): void {
  storage.setItem(STORAGE_KEY_DELTAS, JSON.stringify(deltas));
}

export function loadPriceDeltas(
  storage: IStoragePort = defaultStorage
): PriceDelta[] {
  const raw = storage.getItem<string | null>(STORAGE_KEY_DELTAS, null);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendPriceDelta(
  delta: PriceDelta,
  maxDeltas: number = 20,
  storage: IStoragePort = defaultStorage
): void {
  const existing = loadPriceDeltas(storage);
  const updated = [...existing, delta].slice(-maxDeltas);
  savePriceDeltas(updated, storage);
}

export function clearPriceDeltas(
  storage: IStoragePort = defaultStorage
): void {
  storage.removeItem(STORAGE_KEY_DELTAS);
}
