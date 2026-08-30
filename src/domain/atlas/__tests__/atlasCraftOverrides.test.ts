import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCraftOverrides,
  saveCraftOverride,
  CRAFT_OVERRIDES_STORAGE_KEY
} from '../atlasCraftOverrides';

describe('Atlas Craft Overrides Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty object when storage is empty or invalid', () => {
    expect(loadCraftOverrides()).toEqual({});
    localStorage.setItem(CRAFT_OVERRIDES_STORAGE_KEY, 'invalid json');
    expect(loadCraftOverrides()).toEqual({});
  });

  it('saves and updates craft price and name overrides', () => {
    saveCraftOverride('Ambush Craft', { unitPriceChaos: 10 });
    let overrides = loadCraftOverrides();
    expect(overrides['Ambush Craft']).toEqual({ unitPriceChaos: 10 });

    saveCraftOverride('Ambush Craft', { customName: '伏擊 (6分產出)' });
    overrides = loadCraftOverrides();
    expect(overrides['Ambush Craft']).toEqual({
      unitPriceChaos: 10,
      customName: '伏擊 (6分產出)'
    });
  });

  it('supports 0c price override', () => {
    saveCraftOverride('Essence Craft', { unitPriceChaos: 0 });
    const overrides = loadCraftOverrides();
    expect(overrides['Essence Craft']?.unitPriceChaos).toBe(0);
  });
});
