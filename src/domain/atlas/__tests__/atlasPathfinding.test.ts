import { describe, it, expect } from 'vitest';
import {
  findShortestPath,
  validateTreeConnectivity,
  pruneDisconnectedNodes,
  calculatePathToTarget
} from '../atlasPathfinding';
import { ATLAS_TREE_NODES_DATA } from '../atlasTreeDataset';

describe('atlasPathfinding', () => {
  it('finds the shortest path between start_origin and connected target node', () => {
    const path = findShortestPath('start_origin', 'essence_hub_1', ATLAS_TREE_NODES_DATA);
    expect(path).not.toBeNull();
    expect(path).toContain('start_origin');
    expect(path).toContain('essence_hub_1');
  });

  it('calculates path to target from an existing allocated set of nodes', () => {
    const allocated = new Set(['start_origin']);
    const nodesToAdd = calculatePathToTarget(allocated, 'ambush_hub_2', ATLAS_TREE_NODES_DATA);

    expect(nodesToAdd.length).toBeGreaterThan(0);
    expect(nodesToAdd).toContain('ambush_hub_2');
    expect(nodesToAdd).toContain('map_sustain_1');
  });

  it('validates tree connectivity from origin', () => {
    const validTree = new Set(['start_origin', 'map_sustain_1', 'ambush_hub_1']);
    const isConnected = validateTreeConnectivity(validTree, ATLAS_TREE_NODES_DATA);
    expect(isConnected).toBe(true);

    const disconnectedTree = new Set(['start_origin', 'essence_hub_4']);
    const isDiscConnected = validateTreeConnectivity(disconnectedTree, ATLAS_TREE_NODES_DATA);
    expect(isDiscConnected).toBe(false);
  });

  it('prunes disconnected orphan nodes when bridge node is removed', () => {
    // start_origin -> map_sustain_1 -> ambush_hub_1 -> ambush_hub_2
    const currentAllocated = new Set(['start_origin', 'ambush_hub_1', 'ambush_hub_2']);
    // Without map_sustain_1, ambush_hub_1 and 2 are disconnected
    const pruned = pruneDisconnectedNodes(currentAllocated, ATLAS_TREE_NODES_DATA);

    expect(pruned.has('start_origin')).toBe(true);
    expect(pruned.has('ambush_hub_1')).toBe(false);
    expect(pruned.has('ambush_hub_2')).toBe(false);
  });
});
