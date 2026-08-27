import { describe, it, expect } from 'vitest';
import { calculateAtlasTreeStats } from '../atlasTreeStats';
import { ATLAS_TREE_NODES_DATA } from '../atlasTreeDataset';

describe('atlasTreeStats', () => {
  it('calculates points spent excluding start node', () => {
    const allocated = new Set(['start_origin', 'map_sustain_1', 'map_sustain_2']);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.pointsSpent).toBe(2);
  });

  it('aggregates active keystones and stats list', () => {
    const allocated = new Set(['start_origin', 'map_sustain_1', 'ks_crop_rotation']);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.activeKeystones.length).toBe(1);
    expect(stats.activeKeystones[0].id).toBe('ks_crop_rotation');
    expect(stats.statsList.length).toBeGreaterThan(0);
  });

  it('computes category counts for active nodes', () => {
    const allocated = new Set(['start_origin', 'map_sustain_1', 'essence_hub_1', 'essence_hub_2']);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.categoryCounts.essence).toBe(2);
    expect(stats.categoryCounts.map).toBe(1);
  });
});
