import type { WaystoneModDefinition, PlayerDefensiveProfile } from './types';

export const WAYSTONE_MODS_CATALOG: WaystoneModDefinition[] = [
  {
    id: 'ele_penetration',
    nameZh: '怪物穿透元素抗性',
    nameEn: 'Monsters Penetrate Elemental Resistances',
    category: 'monster_damage',
    baseRisk: 'fatal',
    descriptionZh: '怪物攻擊與法術穿透 12~15% 元素抗性，極易秒殺抗性剛好合格的機體',
    descriptionEn: 'Monsters penetrate 12-15% elemental resistances',
    matchPatternsZh: ['穿透', '元素抗性', '穿透元素抗性'],
    matchPatternsEn: ['penetrate', 'elemental resistance', 'penetrates'],
    targetedDefense: 'fire'
  },
  {
    id: 'cannot_leech',
    nameZh: '無法偷取生命與魔力',
    nameEn: 'Cannot Leech Life or Mana',
    category: 'player_debuff',
    baseRisk: 'fatal',
    descriptionZh: '玩家無法透過攻擊或法術偷取生命與魔力，依賴偷取續航的流派極致命',
    descriptionEn: 'Players cannot leech Life or Mana',
    matchPatternsZh: ['無法偷取', '無法偷取生命', '無法吸取'],
    matchPatternsEn: ['cannot leech', 'cannot leech life', 'leech is disabled'],
    targetedDefense: 'leech'
  },
  {
    id: 'reduced_recovery',
    nameZh: '大幅降低生命與能量護盾回復',
    nameEn: 'Less Life and Energy Shield Recovery Rate',
    category: 'player_debuff',
    baseRisk: 'fatal',
    descriptionZh: '玩家的生命、魔力與能量護盾回復率降低 50~60%',
    descriptionEn: 'Players have 50-60% less Recovery Rate of Life and Energy Shield',
    matchPatternsZh: ['回復率降低', '降低回復速度', '無法回復'],
    matchPatternsEn: ['less recovery rate', 'reduced recovery', 'cannot recover'],
    targetedDefense: 'regen'
  },
  {
    id: 'extra_chaos',
    nameZh: '怪物附加額外混沌傷害與中毒',
    nameEn: 'Monsters Deal Extra Chaos Damage and Poison',
    category: 'monster_damage',
    baseRisk: 'warning',
    descriptionZh: '怪物附加 25~35% 物理傷害的混沌傷害，且擊中時有 30% 機率造成中毒',
    descriptionEn: 'Monsters gain extra physical damage as chaos and poison on hit',
    matchPatternsZh: ['混沌傷害', '額外混沌傷害', '中毒'],
    matchPatternsEn: ['as chaos', 'extra chaos', 'chaos damage', 'poison'],
    targetedDefense: 'chaos'
  },
  {
    id: 'monster_crit',
    nameZh: '怪物暴擊率與暴擊傷害加成',
    nameEn: 'Monsters Have Increased Critical Strike Chance and Multiplier',
    category: 'monster_damage',
    baseRisk: 'warning',
    descriptionZh: '怪物增加 200~300% 暴擊率與 +35~45% 暴擊傷害加成，顯著提升突發致死風險',
    descriptionEn: 'Monsters have increased critical strike chance and multiplier',
    matchPatternsZh: ['暴擊率', '暴擊加成', '暴擊傷害'],
    matchPatternsEn: ['critical strike chance', 'critical strike multiplier', 'crits'],
    targetedDefense: 'armor'
  },
  {
    id: 'hazard_lightning_storm',
    nameZh: '地圖環境：狂怒雷暴與電殛地面',
    nameEn: 'Environmental Hazard: Raging Lightning Storms',
    category: 'environmental',
    baseRisk: 'warning',
    descriptionZh: '地圖持續降下高感電傷害的落雷，並留存電殛感電地面',
    descriptionEn: 'Periodic lightning strikes target players with shocked ground',
    matchPatternsZh: ['雷暴', '落雷', '電殛地面', '感電'],
    matchPatternsEn: ['lightning storm', 'shocked ground', 'lightning strikes'],
    targetedDefense: 'lightning'
  },
  {
    id: 'hazard_chilled_ground',
    nameZh: '地圖環境：冰霜降速地面',
    nameEn: 'Environmental Hazard: Chilled and Frozen Ground',
    category: 'environmental',
    baseRisk: 'caution',
    descriptionZh: '地圖充滿冰緩地面，降低玩家 20~30% 移動與動作速度',
    descriptionEn: 'Patches of chilled ground reduce player action speed',
    matchPatternsZh: ['冰緩地面', '冰凍地面', '動作速度降低'],
    matchPatternsEn: ['chilled ground', 'action speed', 'less movement speed'],
    targetedDefense: 'cold'
  },
  {
    id: 'boss_extra_skills',
    nameZh: '地圖首領施放額外終局技能與狂怒',
    nameEn: 'Map Boss Uses Additional Endgame Mechanics and Enrages',
    category: 'boss_mechanic',
    baseRisk: 'warning',
    descriptionZh: '首領攻擊速度提高 25%，生命低於 50% 時狂怒並召喚精英衛隊',
    descriptionEn: 'Map Boss gains attack speed and enrages with extra mechanics',
    matchPatternsZh: ['首領', '首領狂怒', '額外技能', '首領攻擊速度'],
    matchPatternsEn: ['map boss', 'boss attacks', 'boss enrages', 'boss speed'],
    targetedDefense: 'armor'
  },
  {
    id: 'monster_freeze_stun_res',
    nameZh: '怪物具備高冰凍與暈眩抗性',
    nameEn: 'Monsters Have High Freeze and Stun Resistance',
    category: 'monster_defense',
    baseRisk: 'caution',
    descriptionZh: '怪物增加 60% 暈眩門檻且冰凍累積量降低 50%，控制型流派需注意',
    descriptionEn: 'Monsters have increased stun threshold and freeze resistance',
    matchPatternsZh: ['暈眩門檻', '冰凍抗性', '無法被冰凍', '免疫暈眩'],
    matchPatternsEn: ['stun threshold', 'freeze resistance', 'cannot be frozen'],
    targetedDefense: 'cold'
  },
  {
    id: 'curse_enfeeble',
    nameZh: '玩家受衰弱詛咒影響',
    nameEn: 'Players are Cursed with Enfeeble',
    category: 'player_debuff',
    baseRisk: 'caution',
    descriptionZh: '降低玩家 20% 傷害與暴擊率，延長刷圖戰鬥時間',
    descriptionEn: 'Players are cursed with Enfeeble, dealing less damage',
    matchPatternsZh: ['衰弱', '詛咒衰弱', '造成的傷害降低'],
    matchPatternsEn: ['cursed with enfeeble', 'enfeeble', 'deal less damage']
  }
];

export const DEFAULT_PLAYER_PROFILE: PlayerDefensiveProfile = {
  fireRes: 75,
  coldRes: 75,
  lightningRes: 75,
  chaosRes: 20,
  lifePool: 4200,
  energyShield: 500,
  primaryDefense: 'armor',
  recoveryMechanism: 'leech',
  spellSuppression: 80
};
