export interface CraftCustomOverride {
  unitPriceChaos?: number;
  customName?: string;
}

export const CRAFT_OVERRIDES_STORAGE_KEY = 'poe_atlas_craft_overrides_v1';

/**
 * Loads customized craft prices and names from local storage.
 */
export function loadCraftOverrides(): Record<string, CraftCustomOverride> {
  try {
    const raw = localStorage.getItem(CRAFT_OVERRIDES_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, CraftCustomOverride>;
      }
    }
  } catch {
    // fallback to empty record
  }
  return {};
}

/**
 * Saves or updates a craft customization override by craft key (name or nameEn).
 */
export function saveCraftOverride(
  key: string,
  override: Partial<CraftCustomOverride>
): Record<string, CraftCustomOverride> {
  try {
    const current = loadCraftOverrides();
    const existing = current[key] || {};
    const updated = {
      ...current,
      [key]: {
        ...existing,
        ...override
      }
    };
    localStorage.setItem(CRAFT_OVERRIDES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return {};
  }
}
