import type { AtlasNode } from './types';
import { ATLAS_NODES_CORE } from './dataset/atlasNodesCore';
import { ATLAS_NODES_BOSSES } from './dataset/atlasNodesBosses';
import { ATLAS_NODES_KEYSTONES } from './dataset/atlasNodesKeystones';
import { ATLAS_NODES_ESSENCE } from './dataset/atlasNodesEssence';
import { ATLAS_NODES_AMBUSH } from './dataset/atlasNodesAmbush';
import { ATLAS_NODES_HARVEST_EXPEDITION_LEGION } from './dataset/atlasNodesHarvestExpeditionLegion';
import { ATLAS_NODES_MECHANICS_2 } from './dataset/atlasNodesMechanics2';

// Re-export type for convenience
export type { AtlasNode } from './types';

// Complete consolidated Atlas passive tree dataset
export const ATLAS_TREE_NODES_DATA: AtlasNode[] = [
  ...ATLAS_NODES_CORE,
  ...ATLAS_NODES_BOSSES,
  ...ATLAS_NODES_KEYSTONES,
  ...ATLAS_NODES_ESSENCE,
  ...ATLAS_NODES_AMBUSH,
  ...ATLAS_NODES_HARVEST_EXPEDITION_LEGION,
  ...ATLAS_NODES_MECHANICS_2
];

// Quick index map by string ID
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

// Pre-defined node allocations for built-in strategies
export const PRESET_ALLOCATED_MAP: Record<string, string[]> = {
  // Essence Preset
  preset_essence: ['start_origin', 'map_sustain_2', 'scarab_drop_1', 'scarab_hub_1', 'essence_hub_1', 'essence_hub_2', 'essence_hub_3', 'essence_hub_4', 'essence_corrupted', 'ks_seventh_gate'],
  essence_tier_budget: ['start_origin', 'map_sustain_2', 'essence_hub_1', 'essence_hub_3', 'essence_corrupted'],
  essence_tier_mid: ['start_origin', 'map_sustain_2', 'scarab_hub_1', 'essence_hub_1', 'essence_hub_2', 'essence_hub_3', 'essence_hub_4', 'essence_corrupted', 'ks_seventh_gate'],
  essence_tier_high: ['start_origin', 'map_sustain_2', 'scarab_drop_1', 'scarab_hub_1', 'essence_hub_1', 'essence_hub_2', 'essence_hub_3', 'essence_hub_4', 'essence_corrupted', 'ks_seventh_gate', 'ks_twist_of_fate'],

  // Ambush Preset
  preset_ambush: ['start_origin', 'map_sustain_1', 'ambush_hub_1', 'ambush_hub_2', 'ambush_hub_3', 'ambush_hub_4', 'ambush_vault', 'ks_singular_focus'],
  ambush_tier_budget: ['start_origin', 'map_sustain_1', 'ambush_hub_1', 'ambush_hub_2', 'ks_singular_focus'],
  ambush_tier_mid: ['start_origin', 'map_sustain_1', 'ambush_hub_1', 'ambush_hub_2', 'ambush_hub_3', 'ambush_hub_4', 'ks_singular_focus'],
  ambush_tier_high: ['start_origin', 'map_sustain_1', 'scarab_drop_1', 'ambush_hub_1', 'ambush_hub_2', 'ambush_hub_3', 'ambush_hub_4', 'ambush_vault', 'ks_singular_focus', 'boss_eldritch_1'],

  // Harvest Preset
  preset_harvest: ['start_origin', 'map_sustain_1', 'harvest_hub_1', 'harvest_hub_2', 'ks_crop_rotation', 'boss_eldritch_1'],
  harvest_tier_budget: ['start_origin', 'map_sustain_1', 'harvest_hub_1', 'harvest_hub_2'],
  harvest_tier_mid: ['start_origin', 'map_sustain_1', 'harvest_hub_1', 'harvest_hub_2', 'ks_crop_rotation', 'boss_eldritch_1'],
  harvest_tier_high: ['start_origin', 'map_sustain_1', 'scarab_drop_1', 'harvest_hub_1', 'harvest_hub_2', 'ks_crop_rotation', 'boss_eldritch_1', 'boss_destructive_play', 'ks_destructive_play'],

  // Expedition Preset
  preset_expedition: ['start_origin', 'map_sustain_3', 'scarab_drop_1', 'expedition_hub_1', 'expedition_hub_2', 'ks_extreme_arch'],
  expedition_tier_budget: ['start_origin', 'map_sustain_3', 'expedition_hub_1', 'ks_extreme_arch'],
  expedition_tier_mid: ['start_origin', 'map_sustain_3', 'scarab_drop_1', 'expedition_hub_1', 'expedition_hub_2', 'ks_extreme_arch'],
  expedition_tier_high: ['start_origin', 'map_sustain_3', 'scarab_drop_1', 'expedition_hub_1', 'expedition_hub_2', 'ks_extreme_arch', 'scarab_hub_1'],

  // Legion Preset
  preset_legion: ['start_origin', 'map_sustain_4', 'scarab_drop_1', 'scarab_hub_1', 'legion_hub_1', 'legion_hub_2', 'ks_unwavering_vision'],
  legion_tier_budget: ['start_origin', 'map_sustain_4', 'legion_hub_1', 'ks_unwavering_vision'],
  legion_tier_mid: ['start_origin', 'map_sustain_4', 'scarab_drop_1', 'legion_hub_1', 'legion_hub_2', 'ks_unwavering_vision'],
  legion_tier_high: ['start_origin', 'map_sustain_4', 'scarab_drop_1', 'scarab_hub_1', 'legion_hub_1', 'legion_hub_2', 'ks_unwavering_vision'],

  // Delirium & Boss Presets
  preset_delirium: ['start_origin', 'map_sustain_1', 'map_sustain_2', 'scarab_drop_1', 'delirium_hub_1', 'delirium_hub_2', 'boss_eldritch_1', 'ks_twist_of_fate'],
  preset_bossrush: ['start_origin', 'map_sustain_1', 'map_sustain_2', 'map_sustain_3', 'map_sustain_4', 'boss_eldritch_1', 'boss_destructive_play', 'ks_destructive_play']
};
