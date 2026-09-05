import type { IStoragePort } from '../../application/ports/IStoragePort';
import { namespacedStorage } from './StorageNamespaceAdapter';
import type { PriceSnapshot } from '../../domain/price/priceSnapshotEngine';
import { deserializePriceSnapshot, serializePriceSnapshot } from '../../domain/price/priceSnapshotEngine';

const STORAGE_KEY_SNAPSHOT = 'poe_price_snapshot_cache';

export function savePriceSnapshot(
  snapshot: PriceSnapshot,
  storage: IStoragePort = namespacedStorage
): void {
  const json = serializePriceSnapshot(snapshot);
  storage.setItem(STORAGE_KEY_SNAPSHOT, json);
}

export function loadPriceSnapshot(
  storage: IStoragePort = namespacedStorage
): PriceSnapshot | null {
  const raw = storage.getItem<string | null>(STORAGE_KEY_SNAPSHOT, null);
  if (!raw) return null;

  const result = deserializePriceSnapshot(raw);
  return result.isOk() ? result.value : null;
}

export function clearPriceSnapshot(
  storage: IStoragePort = namespacedStorage
): void {
  storage.removeItem(STORAGE_KEY_SNAPSHOT);
}
