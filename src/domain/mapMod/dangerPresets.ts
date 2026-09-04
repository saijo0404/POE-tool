import type { BuildArchetypePreset, MapDangerConfig } from './types';
export { MAP_DANGER_MODS } from './dangerModsData';

export const BUILD_ARCHETYPE_PRESETS: BuildArchetypePreset[] = [
  {
    id: 'elemental_build',
    nameZh: '純元素攻擊 / 法術流',
    nameEn: 'Elemental Attack / Caster',
    icon: '⚡',
    descriptionZh: '排除元素反傷、避免元素異常狀態與降最大抗',
    descriptionEn: 'Excludes Ele Reflect, Ailment Avoidance, and Minus Max Res',
    defaultBlacklistIds: ['ele_reflect', 'avoid_ailments', 'minus_max_res']
  },
  {
    id: 'physical_build',
    nameZh: '純物理攻擊 / 暴擊流',
    nameEn: 'Physical Melee / Bow',
    icon: '⚔️',
    descriptionZh: '排除物理反傷、無法偷取與降低護甲格擋',
    descriptionEn: 'Excludes Phys Reflect, Cannot Leech, and Reduced Armour',
    defaultBlacklistIds: ['phys_reflect', 'no_leech', 'reduced_armour_block']
  },
  {
    id: 'rf_recovery_build',
    nameZh: '正義之火 / 生命回復流 (RF)',
    nameEn: 'Righteous Fire / High Regen',
    icon: '🔥',
    descriptionZh: '排除無法回復、降低回復率、降低最大抗性與元素反傷',
    descriptionEn: 'Excludes No Regen, Less Recovery, Minus Max Res, and Ele Reflect',
    defaultBlacklistIds: ['no_regen', 'reduced_recovery', 'minus_max_res', 'ele_reflect']
  },
  {
    id: 'leech_build',
    nameZh: '偷取依賴型流派 (Leech)',
    nameEn: 'Leech Dependent Builds',
    icon: '🩸',
    descriptionZh: '排除無法偷取生命/魔力與無法回復',
    descriptionEn: 'Excludes Cannot Leech and No Regen',
    defaultBlacklistIds: ['no_leech', 'no_regen']
  },
  {
    id: 'curse_ailment_build',
    nameZh: '點燃 / 詛咒專精流 (Ignite/Hex)',
    nameEn: 'Ignite / Hexblast Specialist',
    icon: '🔮',
    descriptionZh: '排除元素反傷、怪物免疫詛咒 (Hexproof) 與避免元素異常',
    descriptionEn: 'Excludes Ele Reflect, Hexproof, and Ailment Avoidance',
    defaultBlacklistIds: ['ele_reflect', 'hexproof', 'avoid_ailments']
  },
  {
    id: 'glass_cannon_hc',
    nameZh: '專家模式 / 玻璃大砲防猝死',
    nameEn: 'Hardcore / Glass Cannon Safe',
    icon: '🛡️',
    descriptionZh: '全面排除反傷、暴擊加成、降低最大抗、無法回復與額外傷害',
    descriptionEn: 'Strict protection: Reflect, Crit Multi, Minus Max Res, No Regen, Extra Dmg',
    defaultBlacklistIds: ['ele_reflect', 'phys_reflect', 'minus_max_res', 'crit_extra_dmg', 'no_regen', 'monster_extra_as_ele']
  }
];

export const DEFAULT_MAP_DANGER_CONFIG: MapDangerConfig = {
  blacklistedModIds: ['ele_reflect', 'phys_reflect', 'no_regen', 'minus_max_res'],
  customKeywords: [],
  soundAlertEnabled: true,
  visualAlertEnabled: true,
  activePresetId: 'elemental_build'
};
