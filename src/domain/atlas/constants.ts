/**
 * Atlas Passive Tree Domain Constants
 * Standardized for PoE 1 current live version
 */

/**
 * Maximum allocatable Atlas Passive Skill points in PoE 1
 * (115 map completion + 12 voidstones & invitation rewards + 11 T17 map & maven boss rewards = 138)
 */
export const MAX_ATLAS_POINTS = 138;

/**
 * Official Atlas Origin starting node ID
 */
export const ATLAS_ORIGIN_NODE_ID = '29045';

/**
 * Origin aliases for points calculation exclusions
 */
export const ATLAS_ORIGIN_ALIASES: readonly string[] = ['start_origin', '29045'];

/**
 * Checks if a given node ID is an origin node
 */
export function isOriginNodeId(nodeId: string): boolean {
  return ATLAS_ORIGIN_ALIASES.includes(nodeId);
}
