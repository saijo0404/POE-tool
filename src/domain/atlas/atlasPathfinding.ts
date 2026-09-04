import type { AtlasNode } from './types';
import { buildAdjacencyMap, getReachableAllocatedNodes, validateTreeConnectivity, pruneDisconnectedNodes } from './atlasGraph';

export {
  buildAdjacencyMap,
  getReachableAllocatedNodes,
  validateTreeConnectivity,
  pruneDisconnectedNodes
};

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

function resolveInitialSources(
  allocatedIds: Set<string>,
  nodes: AtlasNode[],
  adj: Map<string, string[]>,
  originId: string,
  targetId: string
): string[] {
  const valid = Array.from(allocatedIds).filter(id => adj.has(id));
  if (valid.length > 0) return valid;
  if (adj.has(originId)) return [originId];
  const startNodes = nodes.filter(n => n.type === 'start');
  return startNodes.length > 0 ? startNodes.map(n => n.id) : [nodes[0]?.id || targetId];
}

function runBfsPathSearch(
  sources: string[],
  targetId: string,
  adj: Map<string, string[]>
): { reached: boolean; parent: Map<string, string> } {
  const queue: string[] = [...sources];
  const visited = new Set<string>(sources);
  const parent = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) return { reached: true, parent };
    for (const nb of adj.get(current) || []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        parent.set(nb, current);
        queue.push(nb);
      }
    }
  }
  return { reached: false, parent };
}

function backtrackToAllocated(targetId: string, parent: Map<string, string>, allocatedIds: Set<string>): string[] {
  const path: string[] = [];
  let curr: string | undefined = targetId;
  while (curr !== undefined && !allocatedIds.has(curr)) {
    path.unshift(curr);
    curr = parent.get(curr);
  }
  return path;
}

function resolveFallbackSearch(
  validAllocated: boolean,
  originId: string,
  targetId: string,
  nodes: AtlasNode[],
  allocatedIds: Set<string>,
  adj: Map<string, string[]>
): string[] {
  if (validAllocated && adj.has(originId) && !allocatedIds.has(originId)) {
    const fallbackPath = findShortestPath(originId, targetId, nodes);
    if (fallbackPath) return fallbackPath.filter(id => !allocatedIds.has(id));
  }
  return [targetId];
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

  const sources = resolveInitialSources(allocatedIds, nodes, adj, originId, targetId);
  const { reached, parent } = runBfsPathSearch(sources, targetId, adj);
  if (!reached) {
    const hasValidAllocated = Array.from(allocatedIds).some(id => adj.has(id));
    return resolveFallbackSearch(hasValidAllocated, originId, targetId, nodes, allocatedIds, adj);
  }
  return backtrackToAllocated(targetId, parent, allocatedIds);
}
