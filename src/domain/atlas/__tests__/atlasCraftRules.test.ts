import { describe, it, expect } from 'vitest';
import type { AtlasTierExtraItem } from '../types';
import {
  isCraftItem,
  clampExtraItemCount,
  addOrReplaceExtraItem,
  sanitizeExtraItems
} from '../atlasCraftRules';

describe('Atlas Map Craft Rules (Issue #12)', () => {
  const craftAmbush: AtlasTierExtraItem = {
    id: 'craft_ambush',
    name: '地圖工藝：伏擊 (Ambush)',
    nameEn: 'Ambush Craft',
    category: 'craft',
    count: 1,
    unitPriceChaos: 7
  };

  const craftEssence: AtlasTierExtraItem = {
    id: 'craft_essence',
    name: '地圖工藝：精髓 (Essence)',
    nameEn: 'Essence Craft',
    category: 'craft',
    count: 1,
    unitPriceChaos: 8
  };

  const t16Map: AtlasTierExtraItem = {
    id: 'map_t16',
    name: 'T16 地圖',
    category: 'map',
    count: 1,
    unitPriceChaos: 4
  };

  const scarabItem: AtlasTierExtraItem = {
    id: 'delirium_orb',
    name: '精髓瞻妄玉',
    category: 'delirium',
    count: 2,
    unitPriceChaos: 14
  };

  describe('isCraftItem', () => {
    it('identifies items with category craft', () => {
      expect(isCraftItem(craftAmbush)).toBe(true);
      expect(isCraftItem({ category: 'craft', name: 'Custom Craft' } as AtlasTierExtraItem)).toBe(true);
    });

    it('returns false for non-craft items', () => {
      expect(isCraftItem(t16Map)).toBe(false);
      expect(isCraftItem(scarabItem)).toBe(false);
    });
  });

  describe('clampExtraItemCount', () => {
    it('always clamps craft items to count of 1', () => {
      expect(clampExtraItemCount(craftAmbush, 0)).toBe(1);
      expect(clampExtraItemCount(craftAmbush, 1)).toBe(1);
      expect(clampExtraItemCount(craftAmbush, 5)).toBe(1);
    });

    it('allows non-craft items to have counts >= 1', () => {
      expect(clampExtraItemCount(t16Map, 0)).toBe(1);
      expect(clampExtraItemCount(t16Map, 3)).toBe(3);
      expect(clampExtraItemCount(scarabItem, 10)).toBe(10);
    });
  });

  describe('addOrReplaceExtraItem', () => {
    it('adds a craft item when no craft exists and locks count to 1', () => {
      const existing: AtlasTierExtraItem[] = [t16Map];
      const craftWithCount5: AtlasTierExtraItem = { ...craftAmbush, count: 5 };
      const result = addOrReplaceExtraItem(existing, craftWithCount5);

      expect(result.isReplaced).toBe(false);
      expect(result.replacedCraftName).toBeUndefined();
      expect(result.items).toHaveLength(2);
      expect(result.items[1].name).toBe(craftAmbush.name);
      expect(result.items[1].count).toBe(1);
    });

    it('replaces existing craft item when a new craft item is added (mutual exclusion)', () => {
      const existing: AtlasTierExtraItem[] = [t16Map, craftAmbush, scarabItem];
      const result = addOrReplaceExtraItem(existing, craftEssence);

      expect(result.isReplaced).toBe(true);
      expect(result.replacedCraftName).toBe(craftAmbush.name);
      expect(result.items).toHaveLength(3);

      const craftsInList = result.items.filter(i => isCraftItem(i));
      expect(craftsInList).toHaveLength(1);
      expect(craftsInList[0].name).toBe(craftEssence.name);
      expect(craftsInList[0].count).toBe(1);
    });

    it('adds non-craft items normally without replacing crafts', () => {
      const existing: AtlasTierExtraItem[] = [craftAmbush];
      const result = addOrReplaceExtraItem(existing, t16Map);

      expect(result.isReplaced).toBe(false);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual(craftAmbush);
      expect(result.items[1]).toEqual(t16Map);
    });
  });

  describe('sanitizeExtraItems', () => {
    it('preserves single craft with count 1 and non-craft items', () => {
      const input: AtlasTierExtraItem[] = [
        t16Map,
        { ...craftAmbush, count: 1 },
        scarabItem
      ];
      const sanitized = sanitizeExtraItems(input);
      expect(sanitized).toHaveLength(3);
      expect(sanitized[1].count).toBe(1);
    });

    it('fixes craft item with count > 1 to 1', () => {
      const input: AtlasTierExtraItem[] = [
        { ...craftAmbush, count: 4 }
      ];
      const sanitized = sanitizeExtraItems(input);
      expect(sanitized).toHaveLength(1);
      expect(sanitized[0].count).toBe(1);
    });

    it('deduplicates multiple crafts, keeping only the first valid craft and forcing count to 1', () => {
      const input: AtlasTierExtraItem[] = [
        t16Map,
        { ...craftAmbush, count: 2 },
        { ...craftEssence, count: 3 },
        scarabItem
      ];
      const sanitized = sanitizeExtraItems(input);

      expect(sanitized).toHaveLength(3);
      const crafts = sanitized.filter(i => isCraftItem(i));
      expect(crafts).toHaveLength(1);
      expect(crafts[0].name).toBe(craftAmbush.name);
      expect(crafts[0].count).toBe(1);
    });

    it('handles empty or undefined arrays gracefully', () => {
      expect(sanitizeExtraItems([])).toEqual([]);
      expect(sanitizeExtraItems(undefined as unknown as AtlasTierExtraItem[])).toEqual([]);
    });
  });
});
