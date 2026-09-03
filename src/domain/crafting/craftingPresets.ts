import type { CraftPreset } from './types';

export const CRAFT_PRESETS: CraftPreset[] = [
  {
    id: 'suppress_life_res_body',
    name: 'T1 Suppress + Life + Resist Body Armour',
    nameZh: '壓抑生命抗性敏捷胸甲',
    description: '熱門生存神裝：哀傷皮甲 + T1 生命 + T1 法術壓抑 + T1 火焰抗性',
    baseItemId: 'sadist_garb',
    ilvl: 86,
    targetMods: [
      { modId: 'maximum_life', maxTier: 1 },
      { modId: 'spell_suppression', maxTier: 1 },
      { modId: 'fire_resistance', maxTier: 1 },
    ],
  },
  {
    id: 'ms_life_dual_res_boots',
    name: '35% MS + T1 Life + Resist Boots',
    nameZh: '35% 跑速生命抗性雙色鞋',
    description: '核心走位鞋：雙色鞋 + 35% 跑速 + T1 生命 + T1 冰冷抗性',
    baseItemId: 'two_toned_boots',
    ilvl: 86,
    targetMods: [
      { modId: 'movement_speed', maxTier: 1 },
      { modId: 'maximum_life', maxTier: 1 },
      { modId: 'cold_resistance', maxTier: 1 },
    ],
  },
  {
    id: 'phys_spine_bow',
    name: 'Endgame Physical Spine Bow',
    nameZh: '大傷物理脊骨弓',
    description: '頂級物理龍捲/狙擊弓：脊骨弓 + T1 物傷% + T1 附加點傷 + T1 攻速',
    baseItemId: 'spine_bow',
    ilvl: 86,
    targetMods: [
      { modId: 'increased_physical_damage', maxTier: 1 },
      { modId: 'flat_physical_damage', maxTier: 1 },
      { modId: 'attack_speed', maxTier: 1 },
    ],
  },
  {
    id: 'chaos_res_ring',
    name: 'Life + T1 Chaos Res Amethyst Ring',
    nameZh: '滿混抗生命紫晶戒指',
    description: '防禦補滿必備：紫晶戒指 + T1 生命 + T1 混沌抗性 + T1 閃電抗性',
    baseItemId: 'amethyst_ring',
    ilvl: 84,
    targetMods: [
      { modId: 'maximum_life', maxTier: 1 },
      { modId: 'chaos_resistance', maxTier: 1 },
      { modId: 'lightning_resistance', maxTier: 1 },
    ],
  },
  {
    id: 'spell_gems_wand',
    name: '+1 All Spell Skill Gems Wand',
    nameZh: '+1 全法術寶石等級狂靈法杖',
    description: '法系必備權杖：狂靈法杖 + +1 全法術寶石 + T2 法術傷害% + 施法速度',
    baseItemId: 'profane_wand',
    ilvl: 84,
    targetMods: [
      { modId: 'all_spell_gems_level', maxTier: 1 },
      { modId: 'increased_spell_damage', maxTier: 2 },
      { modId: 'cast_speed', maxTier: 2 },
    ],
  },
  {
    id: 'high_armour_plate',
    name: 'High Armour Astral Plate',
    nameZh: '萬盾破甲星辰皮甲',
    description: '純護甲防禦底：星辰皮甲 + T1 增加護甲% + T1 附加護甲 + T1 生命',
    baseItemId: 'astral_plate',
    ilvl: 86,
    targetMods: [
      { modId: 'increased_defences', maxTier: 1 },
      { modId: 'flat_defences', maxTier: 1 },
      { modId: 'maximum_life', maxTier: 1 },
    ],
  },
];
