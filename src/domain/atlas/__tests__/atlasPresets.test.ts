import { describe, it, expect, beforeEach } from 'vitest';
import { ATLAS_PRESET_STRATEGIES } from '../atlasPresets';
import {
  sanitizeAtlasTreeUrl,
  loadStrategiesFromStorage,
  saveStrategiesToStorage
} from '../atlasHelpers';
import type { AtlasStrategy } from '../types';

describe('Atlas Presets & Tree URL Validation (Issue #2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('built-in preset strategies is clean and empty by default for user customization', () => {
    expect(ATLAS_PRESET_STRATEGIES).toBeDefined();
    expect(ATLAS_PRESET_STRATEGIES.length).toBe(0);
  });

  describe('sanitizeAtlasTreeUrl', () => {
    it('should return default URL when empty or undefined', () => {
      expect(sanitizeAtlasTreeUrl(undefined)).toBe('https://poeplanner.com/atlas-tree');
      expect(sanitizeAtlasTreeUrl('')).toBe('https://poeplanner.com/atlas-tree');
      expect(sanitizeAtlasTreeUrl('   ')).toBe('https://poeplanner.com/atlas-tree');
    });

    it('should sanitize legacy mock BAAFA URLs to clean poeplanner url', () => {
      const mockUrl1 = 'https://poeplanner.com/atlas-tree/BAAFAH4AT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiA==';
      const mockUrl2 = 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiAmb1';
      expect(sanitizeAtlasTreeUrl(mockUrl1)).toBe('https://poeplanner.com/atlas-tree');
      expect(sanitizeAtlasTreeUrl(mockUrl2)).toBe('https://poeplanner.com/atlas-tree');
    });

    it('should preserve valid custom URLs (such as poeplanner short links, official pathofexile, maxroll)', () => {
      const validPoePlanner = 'https://poeplanner.com/a/custom-id-123';
      const validOfficial = 'https://www.pathofexile.com/atlas-skill-tree/AAAA';
      const validMaxroll = 'https://maxroll.gg/poe/poe-atlas-tree/test';

      expect(sanitizeAtlasTreeUrl(validPoePlanner)).toBe(validPoePlanner);
      expect(sanitizeAtlasTreeUrl(validOfficial)).toBe(validOfficial);
      expect(sanitizeAtlasTreeUrl(validMaxroll)).toBe(validMaxroll);
    });
  });

  describe('loadStrategiesFromStorage migration', () => {
    it('should automatically sanitize legacy mock URLs when loading from localStorage', () => {
      const legacyStrategy: AtlasStrategy = {
        id: 'custom_legacy',
        name: '舊版自訂策略',
        category: 'essence',
        description: '測試舊版儲存資料',
        tags: ['精髓', '拓荒'],
        tiers: [
          {
            id: 'tier_1',
            name: '分級一',
            atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAH4AT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiA==',
            recommendedMaps: [],
            coreKeystones: [],
            scarabs: [],
            extraItems: []
          }
        ]
      };

      saveStrategiesToStorage([legacyStrategy]);
      const loaded = loadStrategiesFromStorage();

      expect(loaded.length).toBe(1);
      expect(loaded[0].tiers[0].atlasTreeUrl).toBe('https://poeplanner.com/atlas-tree');
    });

    it('should sanitize legacy multiple crafts and craft count > 1 when loading from localStorage', () => {
      const legacyStrategyWithCrafts: AtlasStrategy = {
        id: 'strat_crafts',
        name: '多工藝舊策略',
        category: 'ambush',
        description: '測試舊版多工藝資料清洗',
        tags: ['伏擊'],
        tiers: [
          {
            id: 'tier_1',
            name: '分級一',
            recommendedMaps: [],
            coreKeystones: [],
            scarabs: [],
            extraItems: [
              { id: 'c1', name: '地圖工藝：伏擊', category: 'craft', count: 3, unitPriceChaos: 7 },
              { id: 'c2', name: '地圖工藝：精髓', category: 'craft', count: 2, unitPriceChaos: 8 },
              { id: 'm1', name: 'T16 地圖', category: 'map', count: 1, unitPriceChaos: 4 }
            ]
          }
        ]
      };

      saveStrategiesToStorage([legacyStrategyWithCrafts]);
      const loaded = loadStrategiesFromStorage();

      expect(loaded.length).toBe(1);
      const tier = loaded[0].tiers[0];
      expect(tier.extraItems.length).toBe(2);
      expect(tier.extraItems[0].name).toBe('地圖工藝：伏擊');
      expect(tier.extraItems[0].count).toBe(1);
      expect(tier.extraItems[1].name).toBe('T16 地圖');
      expect(tier.extraItems[1].count).toBe(1);
    });
  });
});
