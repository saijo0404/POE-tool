import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStrategiesFromStorage,
  saveStrategiesToStorage,
  ATLAS_STORAGE_KEY
} from '../atlasHelpers';
import type { AtlasStrategy } from '../types';

describe('Atlas Strategy Clean Slate & Storage Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Clean Slate & Storage Persistence', () => {
    it('should return empty array [] by default when localStorage has no record (clean slate)', () => {
      expect(localStorage.getItem(ATLAS_STORAGE_KEY)).toBeNull();
      const loaded = loadStrategiesFromStorage();
      expect(loaded).toEqual([]);
      expect(loaded.length).toBe(0);
    });

    it('should preserve and return empty array [] when user clears all strategies', () => {
      saveStrategiesToStorage([]);
      expect(localStorage.getItem(ATLAS_STORAGE_KEY)).toBe('[]');

      const loaded = loadStrategiesFromStorage();
      expect(loaded).toEqual([]);
      expect(loaded.length).toBe(0);
    });

    it('should preserve custom strategy when saved to storage', () => {
      const customStrategy: AtlasStrategy[] = [
        {
          id: 'custom_1',
          name: '自訂策略 1',
          category: 'custom',
          description: '自訂測試',
          tags: ['自訂'],
          isCustom: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tiers: [
            {
              id: 'tier_1',
              name: '基礎分級',
              description: '分級測試',
              recommendedMaps: ['幽閉墓穴'],
              coreKeystones: ['專注單一'],
              scarabs: [],
              extraItems: []
            }
          ]
        }
      ];
      saveStrategiesToStorage(customStrategy);

      const loaded = loadStrategiesFromStorage();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe('custom_1');
      expect(loaded[0].name).toBe('自訂策略 1');
    });
  });
});
