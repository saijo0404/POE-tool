import type { AtlasNode } from './types';
import officialNodesJson from './data/officialAtlasTree.json';

// Re-export type for convenience
export type { AtlasNode } from './types';

// Complete consolidated official Atlas passive tree dataset (860+ nodes)
export const ATLAS_TREE_NODES_DATA: AtlasNode[] = officialNodesJson as AtlasNode[];

// Quick index map by string ID & aliases
export const ATLAS_NODES_MAP: Record<string, AtlasNode> = ATLAS_TREE_NODES_DATA.reduce<Record<string, AtlasNode>>(
  (acc, node) => {
    acc[node.id] = node;
    return acc;
  },
  {}
);

// Quick index map by numeric ID
export const ATLAS_NODES_BY_NUMID: Record<number, AtlasNode> = ATLAS_TREE_NODES_DATA.reduce<Record<number, AtlasNode>>(
  (acc, node) => {
    acc[node.numId] = node;
    return acc;
  },
  {}
);

// Pre-defined node allocations for built-in strategies using official node IDs
export const PRESET_ALLOCATED_MAP: Record<string, string[]> = {
  // Essence Preset
  preset_essence: ['start_origin', '63311', '44775', '28346', '7157', '43934', '51495'],
  essence_tier_budget: ['start_origin', '63311', '44775', '28346'],
  essence_tier_mid: ['start_origin', '63311', '44775', '28346', '7157', '43934'],
  essence_tier_high: ['start_origin', '63311', '44775', '28346', '7157', '43934', '51495'],

  // Ambush Preset
  preset_ambush: ['start_origin', '63311', '28346', '24555', '60692'],
  ambush_tier_budget: ['start_origin', '63311', '28346'],
  ambush_tier_mid: ['start_origin', '63311', '28346', '24555'],
  ambush_tier_high: ['start_origin', '63311', '28346', '24555', '60692'],

  // Harvest Preset
  preset_harvest: ['start_origin', '63311', '28346', '24555', '58854'],
  harvest_tier_budget: ['start_origin', '63311', '28346'],
  harvest_tier_mid: ['start_origin', '63311', '28346', '24555'],
  harvest_tier_high: ['start_origin', '63311', '28346', '24555', '58854'],

  // Expedition Preset
  preset_expedition: ['start_origin', '44775', '22530', '29688', '35120'],
  expedition_tier_budget: ['start_origin', '44775', '22530'],
  expedition_tier_mid: ['start_origin', '44775', '22530', '29688'],
  expedition_tier_high: ['start_origin', '44775', '22530', '29688', '35120'],

  // Legion Preset
  preset_legion: ['start_origin', '44775', '43934', '34644'],
  legion_tier_budget: ['start_origin', '44775', '43934'],
  legion_tier_mid: ['start_origin', '44775', '43934', '34644'],
  legion_tier_high: ['start_origin', '44775', '43934', '34644', '51495'],

  // Delirium & Boss Presets
  preset_delirium: ['start_origin', '63311', '44775', '28346', '43934'],
  preset_bossrush: ['start_origin', '63311', '44775', '28346', '43934', '7157', '51495']
};
