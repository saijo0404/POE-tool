import type { IStoragePort } from '../../application/ports/IStoragePort';
import { defaultStorage } from '../../infrastructure/storage/LocalStorageAdapter';

export interface CraftCustomOverride {
  unitPriceChaos?: number;
  customName?: string;
}

export const CRAFT_OVERRIDES_STORAGE_KEY = 'poe_atlas_craft_overrides_v1';

/**
 * Loads customized craft prices and names from local storage.
 */
export function loadCraftOverrides(
  storage: IStoragePort = defaultStorage
): Record<string, CraftCustomOverride> {
  const parsed = storage.getItem<Record<string, CraftCustomOverride> | null>(
    CRAFT_OVERRIDES_STORAGE_KEY,
    null
  );
  if (typeof parsed === 'object' && parsed !== null) {
    return parsed;
  }
  return {};
}

/**
 * Saves or updates a craft customization override by craft key (name or nameEn).
 */
export function saveCraftOverride(
  key: string,
  override: Partial<CraftCustomOverride>,
  storage: IStoragePort = defaultStorage
): Record<string, CraftCustomOverride> {
  const current = loadCraftOverrides(storage);
  const existing = current[key] || {};
  const updated = {
    ...current,
    [key]: {
      ...existing,
      ...override
    }
  };
  storage.setItem(CRAFT_OVERRIDES_STORAGE_KEY, updated);
  return updated;
}
