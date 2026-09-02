import type { MapDangerModDefinition, BuildArchetypePreset, MapDangerConfig } from './types';

export const MAP_DANGER_MODS: MapDangerModDefinition[] = [
  // 1. 反傷 (Reflect)
  {
    id: 'ele_reflect',
    nameZh: '元素反傷',
    nameEn: 'Elemental Reflect',
    category: 'reflect',
    severity: 'deadly',
    descriptionZh: '怪物反射元素傷害，對純元素攻擊/法術流派為秒殺詞綴',
    descriptionEn: 'Monsters reflect % of Elemental Damage',
    matchPatternsZh: ['反射.*元素傷害', '元素傷害.*反射'],
    matchPatternsEn: ['reflect.*elemental damage', 'elemental damage.*reflect'],
    regexTokenZh: '反.*元',
    regexTokenEn: 'ele.*ref'
  },
  {
    id: 'phys_reflect',
    nameZh: '物理反傷',
    nameEn: 'Physical Reflect',
    category: 'reflect',
    severity: 'deadly',
    descriptionZh: '怪物反射物理傷害，對純物理近戰/弓箭流派為秒殺詞綴',
    descriptionEn: 'Monsters reflect % of Physical Damage',
    matchPatternsZh: ['反射.*物理傷害', '物理傷害.*反射'],
    matchPatternsEn: ['reflect.*physical damage', 'physical damage.*reflect'],
    regexTokenZh: '反.*物',
    regexTokenEn: 'phys.*ref'
  },

  // 2. 回復無效 / 降低回復 (Recovery)
  {
    id: 'no_regen',
    nameZh: '無法回復生命/魔力/ES',
    nameEn: 'No Life/Mana/ES Regen',
    category: 'recovery',
    severity: 'deadly',
    descriptionZh: '玩家無法回復生命、魔力或能量護盾（正火、回魔依賴流派致命）',
    descriptionEn: 'Players cannot Regenerate Life, Mana or Energy Shield',
    matchPatternsZh: ['無法回復生命', '無法回復魔力', '無法回復能量護盾', '無法回復生命、魔力'],
    matchPatternsEn: ['cannot regenerate life', 'cannot regenerate mana', "can't regen"],
    regexTokenZh: '無法回復',
    regexTokenEn: "can't regen"
  },
  {
    id: 'reduced_recovery',
    nameZh: '降低生命與ES回復率',
    nameEn: 'Reduced Recovery Rate',
    category: 'recovery',
    severity: 'dangerous',
    descriptionZh: '減少玩家 50%~60% 生命與能量護盾的回復速度',
    descriptionEn: 'less Recovery Rate of Life and Energy Shield',
    matchPatternsZh: ['回復率降低', '減少生命與能量護盾的回復率', '減少生命的回復率'],
    matchPatternsEn: ['less recovery rate of life', 'reduced recovery rate'],
    regexTokenZh: '回復率降',
    regexTokenEn: 'less rec'
  },
  {
    id: 'no_leech',
    nameZh: '無法偷取生命/魔力',
    nameEn: 'Cannot Leech',
    category: 'recovery',
    severity: 'deadly',
    descriptionZh: '怪物無法被偷取生命、魔力或能量護盾（偷取流派致命）',
    descriptionEn: 'Cannot Leech Life, Mana or Energy Shield from Monsters',
    matchPatternsZh: ['無法被偷取生命', '無法偷取生命', '無法偷取魔力', '無法被偷取'],
    matchPatternsEn: ['cannot leech life', 'cannot leech mana', 'immune to leech'],
    regexTokenZh: '無法.*偷取',
    regexTokenEn: 'not leech'
  },

  // 3. 防禦弱化 (Defense)
  {
    id: 'minus_max_res',
    nameZh: '降低玩家最大抗性',
    nameEn: 'Minus Max Resistances',
    category: 'defense',
    severity: 'deadly',
    descriptionZh: '玩家最大抗性降低 -9% ~ -12%，大幅增加承受的元素/混沌傷害',
    descriptionEn: '-% maximum Player Resistances',
    matchPatternsZh: ['最大抗性', '降低最大抗性', '所有最大抗性'],
    matchPatternsEn: ['maximum player resistances', 'to all maximum resistances', 'max.*res'],
    regexTokenZh: '大抗',
    regexTokenEn: 'x.*res'
  },
  {
    id: 'reduced_aura_effect',
    nameZh: '降低光環效果 / 增益效果',
    nameEn: 'Reduced Aura Effect',
    category: 'defense',
    severity: 'dangerous',
    descriptionZh: '減少非詛咒光環效果，破壞光環俠與光環堆疊流派防禦',
    descriptionEn: 'reduced effect of Non-Curse Auras from your Skills',
    matchPatternsZh: ['非詛咒光環', '光環效果'],
    matchPatternsEn: ['effect of non-curse auras', 'reduced effect of non-curse'],
    regexTokenZh: '非詛咒光環',
    regexTokenEn: 'auras'
  },
  {
    id: 'reduced_armour_block',
    nameZh: '降低護甲與格擋率',
    nameEn: 'Reduced Armour & Block',
    category: 'defense',
    severity: 'warning',
    descriptionZh: '減少玩家 20%~40% 護甲值並降低攻擊與法術格擋機率',
    descriptionEn: 'less Armour / reduced Chance to Block',
    matchPatternsZh: ['護甲值降低', '格擋機率降低', '減少護甲'],
    matchPatternsEn: ['less armour', 'reduced chance to block'],
    regexTokenZh: '護甲值降',
    regexTokenEn: 'less arm'
  },

  // 4. 怪物強化 (Monster Buff)
  {
    id: 'crit_extra_dmg',
    nameZh: '怪物暴擊率與暴擊加成',
    nameEn: 'Monster Crit Chance & Multiplier',
    category: 'monster_buff',
    severity: 'dangerous',
    descriptionZh: '怪物暴擊率大幅提高，暴擊傷害加成提高 +300%~+400%，極易猝死',
    descriptionEn: 'Monsters have +% to Critical Strike Multiplier / Chance',
    matchPatternsZh: ['暴擊傷害加成', '暴擊率'],
    matchPatternsEn: ['critical strike multiplier', 'critical strike chance'],
    regexTokenZh: '暴擊傷害加成',
    regexTokenEn: 'crit.*mult'
  },
  {
    id: 'monster_extra_as_ele',
    nameZh: '怪物附加額外元素傷害',
    nameEn: 'Monsters Extra Damage as Ele/Chaos',
    category: 'monster_buff',
    severity: 'dangerous',
    descriptionZh: '怪物附加 70%~110% 額外火/冰/電或混沌傷害',
    descriptionEn: 'Monsters deal % extra Physical Damage as Fire/Cold/Lightning',
    matchPatternsZh: ['額外造成.*傷害', '附加.*元素傷害'],
    matchPatternsEn: ['extra.*damage as fire', 'extra.*damage as cold', 'extra.*damage as lightning'],
    regexTokenZh: '額外造成',
    regexTokenEn: 'extra.*dam'
  },
  {
    id: 'monsters_steal_charges',
    nameZh: '怪物擊中偷取充能球',
    nameEn: 'Monsters Steal Charges',
    category: 'monster_buff',
    severity: 'warning',
    descriptionZh: '怪物擊中時偷取耐力/狂怒/暴擊球，打亂充能球循環流派',
    descriptionEn: 'Monsters steal Power, Frenzy and Endurance Charges on Hit',
    matchPatternsZh: ['偷取耐力', '偷取狂怒', '偷取暴擊球', '偷取充能球'],
    matchPatternsEn: ['steal power', 'steal frenzy', 'steal.*charges'],
    regexTokenZh: '偷取.*球',
    regexTokenEn: 'steal.*char'
  },

  // 5. 異常與詛咒免疫 (Curse & Ailments)
  {
    id: 'hexproof',
    nameZh: '怪物免疫詛咒 (Hexproof)',
    nameEn: 'Monsters are Hexproof',
    category: 'curse',
    severity: 'warning',
    descriptionZh: '怪物無法被詛咒，對詛咒流派 (Occultist/Hexblast) 大幅降低傷害',
    descriptionEn: 'Monsters are Hexproof',
    matchPatternsZh: ['免疫詛咒', '不受詛咒影響'],
    matchPatternsEn: ['hexproof', 'immune to curses'],
    regexTokenZh: '免疫詛咒',
    regexTokenEn: 'hexproof'
  },
  {
    id: 'avoid_ailments',
    nameZh: '怪物避免元素異常狀態',
    nameEn: 'Monsters Avoid Elemental Ailments',
    category: 'curse',
    severity: 'dangerous',
    descriptionZh: '怪物有 60%~70% 機率避免感電、點燃、冰凍狀態（點燃/感電流派重傷）',
    descriptionEn: 'Monsters have % chance to Avoid Elemental Ailments',
    matchPatternsZh: ['避免元素異常狀態', '避免異常狀態'],
    matchPatternsEn: ['avoid elemental ailments', 'avoid elemental status ailments'],
    regexTokenZh: '避免元素異常',
    regexTokenEn: 'avoid.*ail'
  },
  {
    id: 'temporal_chains',
    nameZh: '玩家受到時空鎖鏈詛咒',
    nameEn: 'Players Cursed with Temporal Chains',
    category: 'curse',
    severity: 'warning',
    descriptionZh: '玩家被施加時空鎖鏈詛咒，動作速度與冷卻大幅減緩',
    descriptionEn: 'Players are Cursed with Temporal Chains',
    matchPatternsZh: ['時空鎖鏈'],
    matchPatternsEn: ['temporal chains'],
    regexTokenZh: '時空鎖鏈',
    regexTokenEn: 'temporal chains'
  },
  {
    id: 'reduced_flask_charges',
    nameZh: '藥劑充能獲取減少',
    nameEn: 'Reduced Flask Charges Gained',
    category: 'other',
    severity: 'warning',
    descriptionZh: '減少 40%~50% 藥劑充能獲取，對藥俠/水保流派為致命打擊',
    descriptionEn: 'Players gain % reduced Flask Charges',
    matchPatternsZh: ['藥劑充能', '減少藥劑充能'],
    matchPatternsEn: ['reduced flask charges', 'gain.*reduced flask'],
    regexTokenZh: '藥劑充能',
    regexTokenEn: 'flask charges'
  }
];

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
