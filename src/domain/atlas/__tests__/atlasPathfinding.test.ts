import { describe, it, expect } from 'vitest';
import {
  findShortestPath,
  validateTreeConnectivity,
  pruneDisconnectedNodes,
  calculatePathToTarget
} from '../atlasPathfinding';
import { ATLAS_TREE_NODES_DATA } from '../atlasTreeDataset';

describe('atlasPathfinding', () => {
  it('finds the shortest path between start_origin and connected neighbor', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === 'start_origin')!;
    const neighborId = origin.connections[0];
    expect(neighborId).toBeDefined();

    const path = findShortestPath('start_origin', neighborId, ATLAS_TREE_NODES_DATA);
    expect(path).not.toBeNull();
    expect(path).toContain('start_origin');
    expect(path).toContain(neighborId);
  });

  it('calculates path to target from an existing allocated set of nodes', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === 'start_origin')!;
    const neighborId = origin.connections[0];
    const neighborNode = ATLAS_TREE_NODES_DATA.find(n => n.id === neighborId)!;
    const targetId = neighborNode.connections.find(c => c !== 'start_origin') || neighborId;

    const allocated = new Set(['start_origin']);
    const nodesToAdd = calculatePathToTarget(allocated, targetId, ATLAS_TREE_NODES_DATA);

    expect(nodesToAdd.length).toBeGreaterThan(0);
    expect(nodesToAdd).toContain(targetId);
  });

  it('validates tree connectivity from origin', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === 'start_origin')!;
    const neighborId = origin.connections[0];

    const validTree = new Set(['start_origin', neighborId]);
    const isConnected = validateTreeConnectivity(validTree, ATLAS_TREE_NODES_DATA);
    expect(isConnected).toBe(true);

    const isolatedId = ATLAS_TREE_NODES_DATA.find(n => n.y < -1500 && n.type === 'keystone')!.id;
    const disconnectedTree = new Set(['start_origin', isolatedId]);
    const isDiscConnected = validateTreeConnectivity(disconnectedTree, ATLAS_TREE_NODES_DATA);
    expect(isDiscConnected).toBe(false);
  });

  it('prunes disconnected orphan nodes when bridge node is removed', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === 'start_origin')!;
    const neighborId = origin.connections[0];
    const isolatedId = ATLAS_TREE_NODES_DATA.find(n => n.y < -1500 && n.type === 'keystone')!.id;

    const currentAllocated = new Set(['start_origin', neighborId, isolatedId]);
    const pruned = pruneDisconnectedNodes(currentAllocated, ATLAS_TREE_NODES_DATA);

    expect(pruned.has('start_origin')).toBe(true);
    expect(pruned.has(neighborId)).toBe(true);
    expect(pruned.has(isolatedId)).toBe(false);
  });
});
