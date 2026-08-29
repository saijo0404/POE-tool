import type { AtlasNode } from './types';
import { calculatePathToTarget } from './atlasPathfinding';
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

// Helper to construct fully connected contiguous preset trees from single origin (node 29045)
function createConnectedPreset(targetKeyNodes: string[]): string[] {
  const tree = new Set<string>(['29045']);
  targetKeyNodes.forEach(target => {
    if (ATLAS_NODES_MAP[target]) {
      const path = calculatePathToTarget(tree, target, ATLAS_TREE_NODES_DATA, '29045');
      path.forEach(id => tree.add(id));
    }
  });
  return Array.from(tree);
}

// Pre-defined node allocations for built-in strategies using contiguous official node paths
export const PRESET_ALLOCATED_MAP: Record<string, string[]> = {
  // Essence Preset (Left-branch Essence cluster)
  preset_essence: createConnectedPreset(['63311', '28346', '24555', '60692', '929', '474']),
  essence_tier_budget: createConnectedPreset(['63311', '28346', '24555']),
  essence_tier_mid: createConnectedPreset(['63311', '28346', '24555', '60692']),
  essence_tier_high: createConnectedPreset(['63311', '28346', '24555', '60692', '929', '474']),

  // Ambush Preset (Strongbox clusters)
  preset_ambush: createConnectedPreset(['63311', '28346', '24555', '605']),
  ambush_tier_budget: createConnectedPreset(['63311', '28346']),
  ambush_tier_mid: createConnectedPreset(['63311', '28346', '24555']),
  ambush_tier_high: createConnectedPreset(['63311', '28346', '24555', '605']),

  // Harvest Preset (Grove cluster)
  preset_harvest: createConnectedPreset(['63311', '28346', '24555', '58854']),
  harvest_tier_budget: createConnectedPreset(['63311', '28346', '24555']),
  harvest_tier_mid: createConnectedPreset(['63311', '28346', '24555', '58854']),
  harvest_tier_high: createConnectedPreset(['63311', '28346', '24555', '58854']),

  // Expedition Preset (Right-branch Expedition cluster)
  preset_expedition: createConnectedPreset(['44775', '22530', '29688', '35120']),
  expedition_tier_budget: createConnectedPreset(['44775', '22530']),
  expedition_tier_mid: createConnectedPreset(['44775', '22530', '29688']),
  expedition_tier_high: createConnectedPreset(['44775', '22530', '29688', '35120']),

  // Legion Preset (Right-branch Legion cluster)
  preset_legion: createConnectedPreset(['44775', '43934', '34644', '51495']),
  legion_tier_budget: createConnectedPreset(['44775', '43934']),
  legion_tier_mid: createConnectedPreset(['44775', '43934', '34644']),
  legion_tier_high: createConnectedPreset(['44775', '43934', '34644', '51495']),

  // Delirium & Boss Presets
  preset_delirium: createConnectedPreset(['63311', '44775', '28346', '43934', '266']),
  preset_bossrush: createConnectedPreset(['63311', '44775', '28346', '43934', '788', '63460'])
};
