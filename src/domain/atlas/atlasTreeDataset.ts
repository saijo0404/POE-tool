import type { AtlasNode } from './types';
import { loadCachedAtlasTreeData } from './atlasOfficialSyncService';

// Re-export type for convenience
export type { AtlasNode } from './types';

// Complete consolidated official Atlas passive tree dataset (860+ nodes)
// Automatically initializes with cached official data or falls back to bundled officialNodesJson
export let ATLAS_TREE_NODES_DATA: AtlasNode[] = loadCachedAtlasTreeData();

// Build index maps
export let ATLAS_NODES_MAP: Record<string, AtlasNode> = ATLAS_TREE_NODES_DATA.reduce<Record<string, AtlasNode>>(
  (acc, node) => {
    acc[node.id] = node;
    return acc;
  },
  {}
);

export let ATLAS_NODES_BY_NUMID: Record<number, AtlasNode> = ATLAS_TREE_NODES_DATA.reduce<Record<number, AtlasNode>>(
  (acc, node) => {
    acc[node.numId] = node;
    return acc;
  },
  {}
);

/**
 * Reload dataset dynamically in memory when a new official league update is synced
 */
export function reloadAtlasTreeDataset(newNodes: AtlasNode[]): void {
  ATLAS_TREE_NODES_DATA = newNodes;
  ATLAS_NODES_MAP = newNodes.reduce<Record<string, AtlasNode>>((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});
  ATLAS_NODES_BY_NUMID = newNodes.reduce<Record<number, AtlasNode>>((acc, node) => {
    acc[node.numId] = node;
    return acc;
  }, {});
}

