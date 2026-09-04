/**
 * Faustus Currency Exchange Domain Constants & Gold Fee Tables
 */
import type { ExchangeCategory } from './types';

export const EXCHANGE_CATEGORIES: readonly { id: ExchangeCategory; label: string }[] = [
  { id: 'All', label: '全部物資' },
  { id: 'Currency', label: '基礎通貨' },
  { id: 'Scarab', label: '聖甲蟲' },
  { id: 'Essence', label: '精髓' },
  { id: 'DivinationCard', label: '命運卡' },
  { id: 'Fragment', label: '碎片/頭目' },
  { id: 'DeliriumOrb', label: '譫妄玉' },
  { id: 'Catalyst', label: '催化劑' },
  { id: 'Oil', label: '瓶中之油' },
];

/**
 * PoE 3.25+ Official Faustus Gold Fee per item unit
 */
export const OFFICIAL_GOLD_FEE_TABLE: Record<string, number> = {
  // Top tier
  'Mirror of Kalandra': 50000,
  "Hinekora's Lock": 25000,
  'Divine Orb': 1250,
  'Sacred Orb': 1000,
  'Reflecting Mist': 800,
  'Valdo\'s Puzzle Box': 600,

  // Mid tier
  'Exalted Orb': 125,
  'Orb of Annulment': 100,
  'Ancient Orb': 100,
  'Veiled Orb': 150,
  'Awakener\'s Orb': 250,
  'Orb of Dominance': 350,
  'Fracturing Orb': 500,

  // Standard currency
  'Chaos Orb': 25,
  'Orb of Unmaking': 25,
  'Orb of Regret': 25,
  'Vaal Orb': 20,
  'Gemcutter\'s Prism': 20,
  'Orb of Scouring': 15,
  'Blessed Orb': 15,
  'Regal Orb': 10,
  'Orb of Alchemy': 10,
  'Orb of Fusing': 5,
  'Orb of Alteration': 5,
  'Chromatic Orb': 5,
  'Jeweller\'s Orb': 5,
  'Orb of Chance': 5,
  'Orb of Transmutation': 2,
  'Orb of Augmentation': 2,
  'Portal Scroll': 1,
  'Scroll of Wisdom': 1,
};

export const DEFAULT_T16_MAP_GOLD_YIELD = 25000;

export const KNOWN_ITEM_ZH_NAMES: Record<string, string> = {
  'Divine Orb': '神聖石',
  'Chaos Orb': '混沌石',
  'Mirror of Kalandra': '卡蘭德的魔鏡',
  'Exalted Orb': '崇高石',
  'Orb of Annulment': '無效石',
  'Orb of Scouring': '重鑄石',
  'Vaal Orb': '瓦爾寶石',
  'Orb of Regret': '後悔石',
  'Orb of Unmaking': '重塑之玉',
  'Veiled Orb': '隱匿石',
  'Ancient Orb': '古老石',
  'Awakener\'s Orb': '喚醒者之玉',
  'Fracturing Orb': '破裂之玉',
  'Sacred Orb': '崇聖石',
  "Hinekora's Lock": '辛克拉的髮絲',
  'Orb of Alchemy': '點金石',
  'Orb of Alteration': '改造石',
  'Orb of Fusing': '鏈結石',
  'Chromatic Orb': '幻色石',
  'Jeweller\'s Orb': '工匠石',
  'Gemcutter\'s Prism': '寶石匠的稜鏡',
  'Blessed Orb': '祝福石',
  'Regal Orb': '富豪石',
  'Orb of Chance': '機會石',
  'Orb of Transmutation': '蛻變石',
  'Orb of Augmentation': '增幅石',
  'Portal Scroll': '傳送卷軸',
  'Scroll of Wisdom': '知識卷軸',
  'Valdo\'s Puzzle Box': '瓦爾多謎盒',
};
