import type { AtlasStrategy } from './types';
import { sanitizeExtraItems } from './atlasCraftRules';

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

export function loadStrategiesFromStorage(): AtlasStrategy[] {
  try {
    const raw = localStorage.getItem(ATLAS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
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
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStrategiesToStorage(strategies: AtlasStrategy[]): void {
  try {
    localStorage.setItem(ATLAS_STORAGE_KEY, JSON.stringify(strategies));
  } catch {
    // ignore
  }
}
