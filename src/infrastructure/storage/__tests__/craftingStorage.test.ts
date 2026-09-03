import { describe, it, expect, beforeEach } from 'vitest';
import { CraftingStorage } from '../craftingStorage';
import type { CraftPreset } from '../../../domain/crafting/types';

describe('CraftingStorage Infrastructure Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty list when no custom presets stored', () => {
    expect(CraftingStorage.getCustomPresets()).toEqual([]);
  });

  it('should save, retrieve, and delete a custom preset', () => {
    const mockPreset: CraftPreset = {
      id: 'my_custom_craft',
      name: 'My Custom Craft',
      nameZh: '我的自訂工藝',
      description: '測試配方',
      baseItemId: 'sadist_garb',
      ilvl: 86,
      targetMods: [{ modId: 'maximum_life', maxTier: 1 }],
    };

    expect(CraftingStorage.saveCustomPreset(mockPreset)).toBe(true);
    const presets = CraftingStorage.getCustomPresets();
    expect(presets.length).toBe(1);
    expect(presets[0].id).toBe('my_custom_craft');

    expect(CraftingStorage.deleteCustomPreset('my_custom_craft')).toBe(true);
    expect(CraftingStorage.getCustomPresets()).toEqual([]);
  });

  it('should save and load last session state', () => {
    CraftingStorage.saveLastSession({
      baseItemId: 'spine_bow',
      ilvl: 85,
      targetMods: [{ modId: 'flat_physical_damage', maxTier: 1 }],
    });

    const session = CraftingStorage.getLastSession();
    expect(session).toBeDefined();
    expect(session?.baseItemId).toBe('spine_bow');
    expect(session?.ilvl).toBe(85);
  });
});
