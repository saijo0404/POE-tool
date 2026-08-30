import { describe, it, expect, vi } from 'vitest';
import { loadStrategiesFromStorage, saveStrategiesToStorage, ATLAS_STORAGE_KEY } from '../atlasStorage';
import type { IStoragePort } from '../../../application/ports/IStoragePort';
import type { AtlasStrategy } from '../types';

describe('atlasStorage with IStoragePort', () => {
  it('loads strategies using injected mock storage', () => {
    const mockData: AtlasStrategy[] = [
      {
        id: 'strat_test_1',
        name: 'Test Strategy',
        category: 'essence',
        description: 'Testing',
        tags: [],
        createdAt: 1000,
        updatedAt: 1000,
        tiers: [
          {
            id: 'tier_1',
            name: 'Budget',
            description: '',
            recommendedMaps: [],
            coreKeystones: [],
            scarabs: [],
            extraItems: [],
            atlasTreeUrl: 'https://poeplanner.com/atlas-tree'
          }
        ]
      }
    ];

    const mockStorage: IStoragePort = {
      getItem: vi.fn().mockReturnValue(mockData),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const loaded = loadStrategiesFromStorage(mockStorage);
    expect(mockStorage.getItem).toHaveBeenCalledWith(ATLAS_STORAGE_KEY, null);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('strat_test_1');
  });

  it('saves strategies using injected mock storage', () => {
    const mockStrategies: AtlasStrategy[] = [
      {
        id: 'strat_save_test',
        name: 'Save Test',
        category: 'ambush',
        description: '',
        tags: [],
        createdAt: 2000,
        updatedAt: 2000,
        tiers: []
      }
    ];

    const mockStorage: IStoragePort = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    saveStrategiesToStorage(mockStrategies, mockStorage);
    expect(mockStorage.setItem).toHaveBeenCalledWith(ATLAS_STORAGE_KEY, mockStrategies);
  });
});
