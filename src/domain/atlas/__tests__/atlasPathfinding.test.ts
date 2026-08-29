import { describe, it, expect } from 'vitest';
import {
  findShortestPath,
  validateTreeConnectivity,
  pruneDisconnectedNodes,
  calculatePathToTarget,
  buildAdjacencyMap
} from '../atlasPathfinding';
import { ATLAS_TREE_NODES_DATA } from '../atlasTreeDataset';

describe('atlasPathfinding', () => {
  it('finds the shortest path between origin node 29045 and connected neighbor', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === '29045')!;
    expect(origin).toBeDefined();
    const neighborId = origin.connections[0];
    expect(neighborId).toBeDefined();

    const path = findShortestPath('29045', neighborId, ATLAS_TREE_NODES_DATA);
    expect(path).not.toBeNull();
    expect(path).toContain('29045');
    expect(path).toContain(neighborId);
  });

  it('calculates path to target from an existing allocated set of nodes using multi-source BFS', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === '29045')!;
    const neighborId = origin.connections[0];
    const neighborNode = ATLAS_TREE_NODES_DATA.find(n => n.id === neighborId)!;
    const targetId = neighborNode.connections.find(c => c !== '29045') || neighborId;

    const allocated = new Set(['29045', neighborId]);
    const nodesToAdd = calculatePathToTarget(allocated, targetId, ATLAS_TREE_NODES_DATA, '29045');

    if (neighborId === targetId) {
      expect(nodesToAdd).toEqual([]);
    } else {
      expect(nodesToAdd).toContain(targetId);
      // Target should be directly reachable in 1 hop from neighborId
      expect(nodesToAdd.length).toBe(1);
    }
  });

  it('guarantees minimal incremental hops from closest allocated frontier', () => {
    // Pick a chain of nodes
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === '29045')!;
    const n1 = origin.connections[0];
    const n1Node = ATLAS_TREE_NODES_DATA.find(n => n.id === n1)!;
    const n2 = n1Node.connections.find(c => c !== '29045') || n1;
    const n2Node = ATLAS_TREE_NODES_DATA.find(n => n.id === n2)!;
    const n3 = n2Node.connections.find(c => c !== n1 && c !== '29045');

    if (n3) {
      // If 29045, n1, n2 are allocated, clicking n3 should only return [n3]
      const allocated = new Set(['29045', n1, n2]);
      const path = calculatePathToTarget(allocated, n3, ATLAS_TREE_NODES_DATA, '29045');
      expect(path).toEqual([n3]);
    }
  });

  it('validates tree connectivity from origin', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === '29045')!;
    const neighborId = origin.connections[0];

    const validTree = new Set(['29045', neighborId]);
    const isConnected = validateTreeConnectivity(validTree, ATLAS_TREE_NODES_DATA, '29045');
    expect(isConnected).toBe(true);

    const isolatedId = ATLAS_TREE_NODES_DATA.find(n => n.y < -1500 && n.type === 'keystone')!.id;
    const disconnectedTree = new Set(['29045', isolatedId]);
    const isDiscConnected = validateTreeConnectivity(disconnectedTree, ATLAS_TREE_NODES_DATA, '29045');
    expect(isDiscConnected).toBe(false);
  });

  it('prunes disconnected orphan nodes when bridge node is removed', () => {
    const origin = ATLAS_TREE_NODES_DATA.find(n => n.id === '29045')!;
    const neighborId = origin.connections[0];
    const isolatedId = ATLAS_TREE_NODES_DATA.find(n => n.y < -1500 && n.type === 'keystone')!.id;

    const currentAllocated = new Set(['29045', neighborId, isolatedId]);
    const pruned = pruneDisconnectedNodes(currentAllocated, ATLAS_TREE_NODES_DATA, '29045');

    expect(pruned.has('29045')).toBe(true);
    expect(pruned.has(neighborId)).toBe(true);
    expect(pruned.has(isolatedId)).toBe(false);
  });

  it('builds a fully bidirectional adjacency map', () => {
    const adj = buildAdjacencyMap(ATLAS_TREE_NODES_DATA);
    ATLAS_TREE_NODES_DATA.forEach(node => {
      const neighbors = adj.get(node.id) || [];
      neighbors.forEach(nbId => {
        const nbNeighbors = adj.get(nbId) || [];
        expect(nbNeighbors).toContain(node.id);
      });
    });
  });
});
