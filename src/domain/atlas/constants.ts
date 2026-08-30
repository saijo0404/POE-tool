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

export type AtlasCategoryKey =
  | 'all'
  | 'essence'
  | 'ambush'
  | 'harvest'
  | 'expedition'
  | 'legion'
  | 'breach'
  | 'delirium'
  | 'divination'
  | 'boss'
  | 'torment'
  | 'ritual'
  | 'bestiary'
  | 'ultimatum'
  | 'beyond'
  | 'scarab'
  | 'map'
  | 'altar'
  | 'blight'
  | 'general'
  | 'custom';

export interface CategoryMetadata {
  id: AtlasCategoryKey;
  label: string;
  labelEn: string;
  icon: string;
}

export const ATLAS_CATEGORIES_METADATA: Record<AtlasCategoryKey, CategoryMetadata> = {
  all: { id: 'all', label: '全部機制', labelEn: 'All Mechanics', icon: '🌐' },
  essence: { id: 'essence', label: '精髓', labelEn: 'Essence', icon: '💎' },
  ambush: { id: 'ambush', label: '伏擊開箱', labelEn: 'Ambush', icon: '📦' },
  harvest: { id: 'harvest', label: '莊園收割', labelEn: 'Harvest', icon: '🌾' },
  expedition: { id: 'expedition', label: '探險炸墳', labelEn: 'Expedition', icon: '💣' },
  legion: { id: 'legion', label: '戰亂軍團', labelEn: 'Legion', icon: '⚔️' },
  breach: { id: 'breach', label: '破滅裂痕', labelEn: 'Breach', icon: '🌀' },
  delirium: { id: 'delirium', label: '瞻妄之霧', labelEn: 'Delirium', icon: '🌫️' },
  divination: { id: 'divination', label: '命運卡', labelEn: 'Divination Cards', icon: '🃏' },
  boss: { id: 'boss', label: '輿圖王速刷', labelEn: 'Boss Rush', icon: '👑' },
  torment: { id: 'torment', label: '苦痛流亡者', labelEn: 'Torment', icon: '👻' },
  ritual: { id: 'ritual', label: '儀式祭壇', labelEn: 'Ritual', icon: '🩸' },
  bestiary: { id: 'bestiary', label: '野獸獵魔', labelEn: 'Bestiary', icon: '🦁' },
  ultimatum: { id: 'ultimatum', label: '致命通牒', labelEn: 'Ultimatum', icon: '🏛️' },
  beyond: { id: 'beyond', label: '超越之境', labelEn: 'Beyond', icon: '🌌' },
  scarab: { id: 'scarab', label: '聖甲蟲', labelEn: 'Scarab', icon: '🪲' },
  map: { id: 'map', label: '地圖掉落', labelEn: 'Map Drops', icon: '🗺️' },
  altar: { id: 'altar', label: '祭壇昇華', labelEn: 'Eldritch Altar', icon: '⛩️' },
  blight: { id: 'blight', label: '菌潮枯疫', labelEn: 'Blight', icon: '🍄' },
  general: { id: 'general', label: '綜合通用', labelEn: 'General', icon: '🧭' },
  custom: { id: 'custom', label: '我的自訂策略', labelEn: 'Custom Strategy', icon: '⭐' }
};

export function getCategoryMetadata(category: string): { label: string; icon: string } {
  const meta = (ATLAS_CATEGORIES_METADATA as Record<string, CategoryMetadata | undefined>)[category];
  return meta ? { label: meta.label, icon: meta.icon } : { label: category, icon: '🏷️' };
}

