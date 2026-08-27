import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStrategiesFromStorage,
  saveStrategiesToStorage,
  ATLAS_STORAGE_KEY
} from '../atlasHelpers';
import { ATLAS_PRESET_STRATEGIES } from '../atlasPresets';
import type { AtlasStrategy } from '../types';

describe('Atlas Strategy Freedom & Empty State (Issue #4)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Empty State & Storage Persistence', () => {
    it('should return preset strategies when localStorage has no record (first load)', () => {
      expect(localStorage.getItem(ATLAS_STORAGE_KEY)).toBeNull();
      const loaded = loadStrategiesFromStorage();
      expect(loaded.length).toBe(ATLAS_PRESET_STRATEGIES.length);
      expect(loaded.length).toBeGreaterThan(0);
    });

    it('should preserve and return empty array [] when user clears all strategies', () => {
      // User deletes all strategies -> save empty array
      saveStrategiesToStorage([]);
      expect(localStorage.getItem(ATLAS_STORAGE_KEY)).toBe('[]');

      // Reloading from storage must NOT reset to preset strategies
      const loaded = loadStrategiesFromStorage();
      expect(loaded).toEqual([]);
      expect(loaded.length).toBe(0);
    });

    it('should preserve custom subset when user deletes some preset strategies', () => {
      const singleStrategy: AtlasStrategy[] = [ATLAS_PRESET_STRATEGIES[0]];
      saveStrategiesToStorage(singleStrategy);

      const loaded = loadStrategiesFromStorage();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe(ATLAS_PRESET_STRATEGIES[0].id);
    });
  });

  describe('Preset Strategies Data Integrity', () => {
    it('all preset strategies should be valid and resettable', () => {
      expect(ATLAS_PRESET_STRATEGIES.length).toBeGreaterThan(0);
      for (const strat of ATLAS_PRESET_STRATEGIES) {
        expect(strat.id).toBeDefined();
        expect(strat.name).toBeDefined();
        expect(strat.tiers.length).toBeGreaterThan(0);
      }
    });
  });
});
