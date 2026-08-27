import type { AtlasNode } from './types';

// Build bidirectional graph adjacency map
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

// Find shortest path between two nodes using BFS
export function findShortestPath(
  startId: string,
  targetId: string,
  nodes: AtlasNode[]
): string[] | null {
  if (startId === targetId) return [startId];
  const adj = buildAdjacencyMap(nodes);
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

// Calculate the shortest path from any allocated node to target
export function calculatePathToTarget(
  allocatedIds: Set<string>,
  targetId: string,
  nodes: AtlasNode[]
): string[] {
  if (allocatedIds.has(targetId)) return [];
  const startList = allocatedIds.size > 0 ? Array.from(allocatedIds) : ['start_origin'];

  let shortestPath: string[] | null = null;
  for (const start of startList) {
    const path = findShortestPath(start, targetId, nodes);
    if (path && (!shortestPath || path.length < shortestPath.length)) {
      shortestPath = path;
    }
  }
  if (!shortestPath) return [targetId];
  return shortestPath.filter(id => !allocatedIds.has(id));
}

// Check if all allocated nodes are reachable from origin
export function validateTreeConnectivity(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): boolean {
  if (!allocatedIds.has(originId)) return false;
  const connected = getReachableAllocatedNodes(allocatedIds, nodes, originId);
  return connected.size === allocatedIds.size;
}

// Get set of all nodes reachable from origin within allocated set
export function getReachableAllocatedNodes(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): Set<string> {
  const reachable = new Set<string>();
  if (!allocatedIds.has(originId)) return reachable;

  const adj = buildAdjacencyMap(nodes);
  const queue: string[] = [originId];
  reachable.add(originId);

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

// Prune any orphan/disconnected nodes from the tree
export function pruneDisconnectedNodes(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  originId: string = 'start_origin'
): Set<string> {
  return getReachableAllocatedNodes(allocatedIds, nodes, originId);
}
