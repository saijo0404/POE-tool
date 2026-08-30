import type { AtlasStrategy } from './types';
import { sanitizeExtraItems } from './atlasCraftRules';
import type { IStoragePort } from '../../application/ports/IStoragePort';
import { defaultStorage } from '../../infrastructure/storage/LocalStorageAdapter';

export const ATLAS_STORAGE_KEY = 'poe_atlas_custom_strategies_v1';
export const DEFAULT_ATLAS_TREE_URL = 'https://poeplanner.com/atlas-tree';

export function sanitizeAtlasTreeUrl(url?: string): string {
  if (!url || !url.trim()) {
    return DEFAULT_ATLAS_TREE_URL;
  }
  const trimmed = url.trim();
  // Sanitize legacy mock/corrupted BAAFA URLs
  if (trimmed.includes('poeplanner.com/atlas-tree/BAAFA') || trimmed.includes('BAAFA')) {
    return DEFAULT_ATLAS_TREE_URL;
  }
  return trimmed;
}

export function loadStrategiesFromStorage(storage: IStoragePort = defaultStorage): AtlasStrategy[] {
  const parsed = storage.getItem<AtlasStrategy[] | null>(ATLAS_STORAGE_KEY, null);
  if (Array.isArray(parsed)) {
    return parsed.map((strat: AtlasStrategy) => ({
      ...strat,
      tiers: (strat.tiers || []).map(tier => ({
        ...tier,
        atlasTreeUrl: sanitizeAtlasTreeUrl(tier.atlasTreeUrl),
        extraItems: sanitizeExtraItems(tier.extraItems)
      }))
    }));
  }
  return [];
}

export function saveStrategiesToStorage(
  strategies: AtlasStrategy[],
  storage: IStoragePort = defaultStorage
): void {
  storage.setItem(ATLAS_STORAGE_KEY, strategies);
}
