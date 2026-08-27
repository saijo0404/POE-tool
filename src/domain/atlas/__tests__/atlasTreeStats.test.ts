import { describe, it, expect } from 'vitest';
import { calculateAtlasTreeStats } from '../atlasTreeStats';
import { ATLAS_TREE_NODES_DATA } from '../atlasTreeDataset';

describe('atlasTreeStats', () => {
  it('calculates points spent excluding start node', () => {
    const allocated = new Set(['start_origin', ATLAS_TREE_NODES_DATA[1].id, ATLAS_TREE_NODES_DATA[2].id]);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.pointsSpent).toBe(2);
  });

  it('aggregates active keystones and stats list', () => {
    const keystone = ATLAS_TREE_NODES_DATA.find(n => n.type === 'keystone')!;
    const allocated = new Set(['start_origin', keystone.id]);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.activeKeystones.length).toBe(1);
    expect(stats.activeKeystones[0].id).toBe(keystone.id);
  });

  it('computes category counts for active nodes', () => {
    const allocated = new Set(['start_origin', ATLAS_TREE_NODES_DATA[1].id, ATLAS_TREE_NODES_DATA[2].id]);
    const stats = calculateAtlasTreeStats(allocated, ATLAS_TREE_NODES_DATA);

    expect(stats.pointsSpent).toBe(2);
    expect(Object.keys(stats.categoryCounts).length).toBeGreaterThan(0);
  });
});
