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

// Find shortest path between two specific nodes using standard BFS
export function findShortestPath(
  startId: string,
  targetId: string,
  nodes: AtlasNode[]
): string[] | null {
  if (startId === targetId) return [startId];
  const adj = buildAdjacencyMap(nodes);
  if (!adj.has(startId) || !adj.has(targetId)) return null;

  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      return reconstructPath(startId, targetId, parent);
    }
    const neighbors = adj.get(current) || [];
    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        visited.add(nb);
        parent.set(nb, current);
        queue.push(nb);
      }
    }
  }
  return null;
}

function reconstructPath(start: string, target: string, parent: Map<string, string>): string[] {
  const path: string[] = [];
  let curr: string | undefined = target;
  while (curr !== undefined) {
    path.unshift(curr);
    if (curr === start) break;
    curr = parent.get(curr);
  }
  return path;
}

/**
 * Calculate the optimal shortest path from any existing allocated node to target
 * Uses Multi-Source BFS starting from all currently allocated nodes simultaneously.
 * This guarantees the absolute minimum number of newly allocated nodes and continuous connection.
 */
export function calculatePathToTarget(
  allocatedIds: Set<string>,
  targetId: string,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): string[] {
  if (allocatedIds.has(targetId)) return [];

  const adj = buildAdjacencyMap(nodes);
  if (!adj.has(targetId)) return [targetId];

  // Determine starting source set
  const validAllocated = Array.from(allocatedIds).filter(id => adj.has(id));
  let sources: string[] = [];

  if (validAllocated.length > 0) {
    sources = validAllocated;
  } else {
    // If no nodes allocated yet, start from originId or start nodes
    if (adj.has(originId)) {
      sources = [originId];
    } else {
      const startNodes = nodes.filter(n => n.type === 'start');
      sources = startNodes.length > 0 ? startNodes.map(n => n.id) : [nodes[0]?.id || targetId];
    }
  }

  // Multi-Source BFS
  const queue: string[] = [];
  const visited = new Set<string>();
  const parent = new Map<string, string>();

  for (const src of sources) {
    queue.push(src);
    visited.add(src);
  }

  let reached = false;
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      reached = true;
      break;
    }
    const neighbors = adj.get(current) || [];
    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        visited.add(nb);
        parent.set(nb, current);
        queue.push(nb);
      }
    }
  }

  // If unreachable from current allocated set, try searching from originId
  if (!reached) {
    if (validAllocated.length > 0 && adj.has(originId) && !allocatedIds.has(originId)) {
      const fallbackPath = findShortestPath(originId, targetId, nodes);
      if (fallbackPath) {
        return fallbackPath.filter(id => !allocatedIds.has(id));
      }
    }
    return [targetId];
  }

  // Reconstruct path from targetId back to the nearest allocated node
  const incrementalPath: string[] = [];
  let curr: string | undefined = targetId;

  while (curr !== undefined) {
    if (allocatedIds.has(curr)) {
      break;
    }
    incrementalPath.unshift(curr);
    curr = parent.get(curr);
  }

  return incrementalPath;
}

/**
 * Get all reachable allocated nodes starting from tree roots (start_origin or any start node)
 */
export function getReachableAllocatedNodes(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): Set<string> {
  const reachable = new Set<string>();
  if (allocatedIds.size === 0) return reachable;

  const adj = buildAdjacencyMap(nodes);

  // Identify roots present in allocatedIds
  const roots: string[] = [];
  if (allocatedIds.has(originId)) {
    roots.push(originId);
  }
  nodes.forEach(n => {
    if (n.type === 'start' && allocatedIds.has(n.id) && !roots.includes(n.id)) {
      roots.push(n.id);
    }
  });

  // If none of the formal roots are in allocatedIds, retain all allocated nodes so custom trees aren't lost
  if (roots.length === 0) {
    return new Set(allocatedIds);
  }

  const queue = [...roots];
  roots.forEach(r => reachable.add(r));

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
