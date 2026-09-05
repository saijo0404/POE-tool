import type { StatDictionaryEntry } from './types';

export const POE2_STAT_ENTRIES: StatDictionaryEntry[] = [
  // Spirit (精魂)
  {
    id: 'explicit.stat_spirit',
    zhText: '+# 最大精魂',
    enText: '+# to maximum Spirit',
  },
  {
    id: 'explicit.stat_increased_spirit',
    zhText: '增加 #% 精魂',
    enText: '#% increased Spirit',
  },
  {
    id: 'explicit.stat_spirit_reservation_efficiency',
    zhText: '+#% 精魂保留效能',
    enText: '+#% Spirit Reservation Efficiency',
  },
  {
    id: 'explicit.stat_increased_max_spirit',
    zhText: '增加 #% 最大精魂',
    enText: '#% increased maximum Spirit',
  },
  {
    id: 'explicit.stat_reduced_spirit_reservation',
    zhText: '減少 #% 精魂保留',
    enText: '#% reduced Spirit Reservation',
  },

  // Dodge Roll (翻滾)
  {
    id: 'explicit.stat_dodge_roll_recovery_rate',
    zhText: '增加 #% 翻滾冷卻回復率',
    enText: '#% increased Dodge Roll Recovery Rate',
  },
  {
    id: 'explicit.stat_dodge_roll_distance',
    zhText: '+#% 翻滾移動距離',
    enText: '+#% increased Dodge Roll Distance',
  },
  {
    id: 'explicit.stat_dodge_roll_speed',
    zhText: '翻滾移動速度增加 #%',
    enText: 'Dodge Roll has #% increased Movement Speed',
  },

  // Energy Shield & Recharge
  {
    id: 'explicit.stat_es_recharge_rate',
    zhText: '增加 #% 能量護盾充能率',
    enText: '#% increased Energy Shield Recharge Rate',
  },
  {
    id: 'explicit.stat_faster_es_recharge_start',
    zhText: '+#% 能量護盾開始充能速度',
    enText: '+#% faster start of Energy Shield Recharge',
  },
  {
    id: 'explicit.stat_es_delay_recovery',
    zhText: '增加 #% 能量護盾延遲回復',
    enText: '#% increased Energy Shield Delay Recovery',
  },

  // Sockets & Gem Levels
  {
    id: 'explicit.stat_rune_sockets',
    zhText: '+# 個符文插槽',
    enText: '+# Rune Sockets',
  },
  {
    id: 'explicit.stat_socketed_skill_gem_level',
    zhText: '此物品上的技能石等級 +#',
    enText: '+# to Level of Socketed Skill Gems',
  },
  {
    id: 'explicit.stat_socketed_spirit_gem_level',
    zhText: '此物品上的精魂技能石等級 +#',
    enText: '+# to Level of Socketed Spirit Gems',
  },
  {
    id: 'explicit.stat_socketed_spell_gem_level',
    zhText: '此物品上的法術技能石等級 +#',
    enText: '+# to Level of Socketed Spell Gems',
  },
  {
    id: 'explicit.stat_socketed_melee_gem_level',
    zhText: '此物品上的近戰技能石等級 +#',
    enText: '+# to Level of Socketed Melee Gems',
  },

  // Buildup & Status Effects
  {
    id: 'explicit.stat_freeze_buildup',
    zhText: '+#% 冰凍積蓄',
    enText: '+#% Freeze Buildup',
  },
  {
    id: 'explicit.stat_ignite_buildup',
    zhText: '+#% 點燃積蓄',
    enText: '+#% Ignite Buildup',
  },
  {
    id: 'explicit.stat_shock_buildup',
    zhText: '+#% 感電積蓄',
    enText: '+#% Shock Buildup',
  },
  {
    id: 'explicit.stat_stun_buildup',
    zhText: '+#% 昏眩積蓄',
    enText: '+#% Stun Buildup',
  },
  {
    id: 'explicit.stat_armour_break_buildup',
    zhText: '+#% 護甲破壞積蓄',
    enText: '+#% Armour Break Buildup',
  },
  {
    id: 'explicit.stat_armour_break_damage',
    zhText: '增加 #% 護甲破壞傷害',
    enText: '#% increased Armour Break Damage',
  },
  {
    id: 'explicit.stat_stun_threshold',
    zhText: '增加 #% 昏眩閾值',
    enText: '#% increased Stun Threshold',
  },

  // Weapon Sets (武器配置)
  {
    id: 'explicit.stat_weapon_set_1_phys',
    zhText: '武器配置 1: 增加 #% 物理傷害',
    enText: 'Weapon Set 1: #% increased Physical Damage',
  },
  {
    id: 'explicit.stat_weapon_set_2_phys',
    zhText: '武器配置 2: 增加 #% 物理傷害',
    enText: 'Weapon Set 2: #% increased Physical Damage',
  },
  {
    id: 'explicit.stat_weapon_set_1_elem',
    zhText: '武器配置 1: 增加 #% 元素傷害',
    enText: 'Weapon Set 1: #% increased Elemental Damage',
  },
  {
    id: 'explicit.stat_weapon_set_2_elem',
    zhText: '武器配置 2: 增加 #% 元素傷害',
    enText: 'Weapon Set 2: #% increased Elemental Damage',
  },
];
