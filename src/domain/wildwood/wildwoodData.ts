import type { WildwoodMajorNode, CharmAffixDef } from './types';

export const WILDWOOD_NODES: WildwoodMajorNode[] = [
  {
    id: 'warden_barkskin',
    nameZh: '樹皮防護 (Barkskin)',
    nameEn: 'Barkskin',
    ascendancy: 'warden',
    descriptionZh: '提供常駐樹皮防護，受擊時逐層脫落增加閃避，滿層提供大量物理傷害減免。',
    descriptionEn: 'Grants the Barkskin skill. Barkskin increases Armour, but loses Bark when hit to increase Evasion.',
    specialFlag: '樹皮防護生效 (Barkskin Active)',
    stats: { physicalDamageReduction: 20 }
  },
  {
    id: 'warden_oath_of_maji',
    nameZh: '瑪濟誓約 (Oath of the Maji)',
    nameEn: 'Oath of the Maji',
    ascendancy: 'warden',
    descriptionZh: '無插槽防具提供大量抗性與生命，未鑲嵌寶石的鞋子提供 25% 移動速度。',
    descriptionEn: 'Grants bonuses for equipped gear pieces with no socketed gems.',
    specialFlag: '瑪濟誓約 (Oath of the Maji)'
  },
  {
    id: 'warden_natures_concoction',
    nameZh: '自然調合 (Nature\'s Concoction)',
    nameEn: "Nature's Concoction",
    ascendancy: 'warden',
    descriptionZh: '使用藥劑時提供額外充能與元素增益。',
    descriptionEn: 'Flasks gain charges on hit and grant bonuses to weapon attacks.',
    specialFlag: '自然藥劑充能 (Nature Concoction Flasks)'
  },
  {
    id: 'warlock_sanguimancy',
    nameZh: '鮮血法術 (Sanguimancy)',
    nameEn: 'Sanguimancy',
    ascendancy: 'warlock',
    descriptionZh: '技能以生命替代魔力消耗，所有魔力保留轉化為生命保留。',
    descriptionEn: 'Skills Cost Life instead of Mana. 100% of Mana Reserved as Life Reserved instead.',
    specialFlag: '鮮血法術 (Sanguimancy: Life Cost)'
  },
  {
    id: 'warlock_ravenous',
    nameZh: '漆黑飢渴 (Ravenous)',
    nameEn: 'Ravenous',
    ascendancy: 'warlock',
    descriptionZh: '吞噬屍體獲取血之狩獵，對該種族怪物造成更多傷害並減少承受其傷害。',
    descriptionEn: 'Consume a corpse to gain Blood Hunt against that monster type.',
    specialFlag: '漆黑飢渴 (Ravenous Monster Debuff)'
  },
  {
    id: 'primalist_charms_1',
    nameZh: '符咒插槽 I (Charm Socket 1)',
    nameEn: 'Charm Socket 1',
    ascendancy: 'primalist',
    descriptionZh: '解鎖第一個符咒插槽。',
    descriptionEn: 'Unlocks the first Charm socket.',
    specialFlag: '解鎖符咒插槽 1'
  },
  {
    id: 'primalist_charms_2',
    nameZh: '符咒插槽 II (Charm Socket 2)',
    nameEn: 'Charm Socket 2',
    ascendancy: 'primalist',
    descriptionZh: '解鎖第二個符咒插槽。',
    descriptionEn: 'Unlocks the second Charm socket.',
    specialFlag: '解鎖符咒插槽 2'
  },
  {
    id: 'primalist_charms_3',
    nameZh: '符咒插槽 III (Charm Socket 3)',
    nameEn: 'Charm Socket 3',
    ascendancy: 'primalist',
    descriptionZh: '解鎖第三個符咒插槽。',
    descriptionEn: 'Unlocks the third Charm socket.',
    specialFlag: '解鎖符咒插槽 3'
  }
];

export const CHARM_AFFIXES: CharmAffixDef[] = [
  {
    id: 'charm_all_res',
    nameZh: '+% 全元素抗性',
    nameEn: '+% to all Elemental Resistances',
    archetypeZh: '通用生存',
    minRoll: 8,
    maxRoll: 15,
    statKey: 'allResist',
    descriptionZh: '提升角色火焰、冰冷與閃電抗性。'
  },
  {
    id: 'charm_max_life',
    nameZh: '+ 最大生命',
    nameEn: '+ to maximum Life',
    archetypeZh: '生命防護',
    minRoll: 30,
    maxRoll: 50,
    statKey: 'maxLife',
    descriptionZh: '增加角色基礎生命值上限。'
  },
  {
    id: 'charm_suppress',
    nameZh: '+% 法術傷害壓抑機率',
    nameEn: '+% chance to Suppress Spell Damage',
    archetypeZh: '欺詐/刺客',
    minRoll: 8,
    maxRoll: 14,
    statKey: 'spellSuppression',
    descriptionZh: '使承受的法術傷害減半。'
  },
  {
    id: 'charm_flask_effect',
    nameZh: '+% 藥劑效果',
    nameEn: '+% increased Flask Effect',
    archetypeZh: '追獵者',
    minRoll: 10,
    maxRoll: 20,
    statKey: 'flaskEffect',
    descriptionZh: '提高非唯一功能藥劑的增益數值。'
  },
  {
    id: 'charm_life_leech',
    nameZh: '生命偷取效果不中斷',
    nameEn: 'Life Leech effects are not removed when Unreserved Life is Filled',
    archetypeZh: '處刑者',
    minRoll: 1,
    maxRoll: 1,
    statKey: 'lifeLeech',
    descriptionZh: '滿血時依然持續偷取生命回復。'
  },
  {
    id: 'charm_fortify',
    nameZh: '近戰擊中獲得護體',
    nameEn: 'Melee Hits grant Fortify',
    archetypeZh: '冠軍',
    minRoll: 1,
    maxRoll: 1,
    statKey: 'fortify',
    descriptionZh: '近戰造成傷害時提供物理與元素全減傷護體。'
  },
  {
    id: 'charm_corpse_life',
    nameZh: '+% 召喚或生成之屍體生命',
    nameEn: '+% increased maximum Life of raised or spawned Corpses',
    archetypeZh: '死靈法師',
    minRoll: 20,
    maxRoll: 40,
    statKey: 'corpseLife',
    descriptionZh: '增加爆屍、火葬等屍體傷害技能的基底威力。'
  }
];
