import type { AtlasNode } from './types';

// Build robust bidirectional graph adjacency map
export function buildAdjacencyMap(nodes: AtlasNode[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  nodes.forEach(n => map.set(n.id, []));

  nodes.forEach(n => {
    const fromList = map.get(n.id) || [];
    n.connections.forEach(tId => {
      if (!fromList.includes(tId)) {
        fromList.push(tId);
      }
      const toList = map.get(tId);
      if (toList && !toList.includes(n.id)) {
        toList.push(n.id);
      }
    });
    map.set(n.id, fromList);
  });
  return map;
}

function findTreeRoots(allocatedIds: Set<string>, nodes: AtlasNode[], originId: string): string[] {
  const roots: string[] = [];
  if (allocatedIds.has(originId)) roots.push(originId);
  nodes.forEach(n => {
    if (n.type === 'start' && allocatedIds.has(n.id) && !roots.includes(n.id)) {
      roots.push(n.id);
    }
  });
  return roots;
}

function traverseReachable(roots: string[], allocatedIds: Set<string>, adj: Map<string, string[]>): Set<string> {
  const reachable = new Set<string>(roots);
  const queue = [...roots];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj.get(curr) || [];
    for (const nb of neighbors) {
      if (allocatedIds.has(nb) && !reachable.has(nb)) {
        reachable.add(nb);
        queue.push(nb);
      }
    }
  }
  return reachable;
}

/**
 * Get all reachable allocated nodes starting from tree roots (start_origin or any start node)
 */
export function getReachableAllocatedNodes(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): Set<string> {
  if (allocatedIds.size === 0) return new Set<string>();
  const roots = findTreeRoots(allocatedIds, nodes, originId);
  if (roots.length === 0) {
    return new Set(allocatedIds);
  }
  const adj = buildAdjacencyMap(nodes);
  return traverseReachable(roots, allocatedIds, adj);
}

// Check if all allocated nodes are connected to roots
export function validateTreeConnectivity(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): boolean {
  if (allocatedIds.size === 0) return true;
  const reachable = getReachableAllocatedNodes(allocatedIds, nodes, originId);
  return reachable.size === allocatedIds.size;
}

// Prune any orphan/disconnected nodes from the tree
export function pruneDisconnectedNodes(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): Set<string> {
  return getReachableAllocatedNodes(allocatedIds, nodes, originId);
}
