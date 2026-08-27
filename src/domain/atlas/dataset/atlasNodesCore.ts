import type { AtlasNode } from '../types';

export const ATLAS_NODES_CORE: AtlasNode[] = [
  // ==================== 0. 起點 (Origin) ====================
  {
    id: 'start_origin',
    numId: 1000,
    name: '輿圖起點 (Atlas Origin)',
    nameEn: 'Atlas Origin',
    type: 'start',
    category: 'general',
    description: '輿圖探索的起點，所有開荒天賦與主幹線路皆由此向外延伸。',
    stats: ['輿圖探索起點，連接各大核心機制路徑'],
    x: 0,
    y: 0,
    connections: [
      'map_sustain_1',
      'map_sustain_2',
      'map_sustain_3',
      'map_sustain_4',
      'scarab_drop_1',
      'core_center_1',
      'core_center_2'
    ],
    icon: '🏛️'
  },
  {
    id: 'core_center_1',
    numId: 1011,
    name: '輿圖主幹．北 (Atlas Trunk North)',
    nameEn: 'Atlas Trunk North',
    type: 'small',
    category: 'general',
    description: '連接北部首領與機制樞紐的主幹線路。',
    stats: ['地圖掉落機率 +3%'],
    x: 0,
    y: -90,
    connections: ['start_origin', 'boss_eldritch_1'],
    icon: '🔹'
  },
  {
    id: 'core_center_2',
    numId: 1012,
    name: '輿圖主幹．南 (Atlas Trunk South)',
    nameEn: 'Atlas Trunk South',
    type: 'small',
    category: 'general',
    description: '連接南部聖甲蟲與深淵機制的主幹線路。',
    stats: ['地圖掉落機率 +3%'],
    x: 0,
    y: 60,
    connections: ['start_origin', 'scarab_drop_1'],
    icon: '🔹'
  },

  // ==================== 1. 地圖續圖 (Map Sustain) ====================
  {
    id: 'map_sustain_1',
    numId: 1001,
    name: '塑界之峰 (Shaping the Skies)',
    nameEn: 'Shaping the Skies',
    type: 'notable',
    category: 'map',
    description: '大幅提升相鄰與更高階地圖掉落機率，拓荒主幹必點。',
    stats: ['地圖階級提升機率 +15%', '地圖掉落率 +10%', '掉落相鄰地圖機率 +20%'],
    x: -80,
    y: -80,
    connections: [
      'start_origin',
      'map_sustain_2',
      'ambush_hub_1',
      'ambush_small_1',
      'harvest_hub_1',
      'harvest_small_1',
      'ks_wandering_path'
    ],
    icon: '🗺️'
  },
  {
    id: 'map_sustain_2',
    numId: 1002,
    name: '塑海之深 (Shaping the Seas)',
    nameEn: 'Shaping the Seas',
    type: 'notable',
    category: 'map',
    description: '保證地圖產出不斷檔，增加喜愛地圖掉落權重。',
    stats: ['地圖階級提升機率 +15%', '喜愛地圖掉落權重 +100%', '稀有怪掉落地圖機率 +10%'],
    x: 80,
    y: -80,
    connections: [
      'start_origin',
      'map_sustain_1',
      'essence_hub_1',
      'essence_small_1',
      'scarab_hub_1',
      'delirium_small_1',
      'delirium_hub_1',
      'ks_grand_design'
    ],
    icon: '🗺️'
  },
  {
    id: 'map_sustain_3',
    numId: 1003,
    name: '塑嶺之嶺 (Shaping the Mountains)',
    nameEn: 'Shaping the Mountains',
    type: 'notable',
    category: 'map',
    description: '中後期紅圖穩定自給自足核心天賦。',
    stats: ['地圖掉落機率 +20%', '掉落 T16 時 5% 機率轉換為 T17 堡壘/要塞地圖'],
    x: -80,
    y: 80,
    connections: [
      'start_origin',
      'map_sustain_4',
      'expedition_hub_1',
      'expedition_small_1',
      'ritual_small_1',
      'ritual_hub_1',
      'blight_hub_1',
      'ks_wandering_path'
    ],
    icon: '🗺️'
  },
  {
    id: 'map_sustain_4',
    numId: 1004,
    name: '塑谷之廣 (Shaping the Valleys)',
    nameEn: 'Shaping the Valleys',
    type: 'notable',
    category: 'map',
    description: '增加怪物掉落複製地圖與高等級地圖基底機率。',
    stats: ['掉落地圖有機率複製 1 份', '未鑑定地圖魔法物品掉落率 +30%'],
    x: 80,
    y: 80,
    connections: [
      'start_origin',
      'map_sustain_3',
      'legion_hub_1',
      'legion_small_1',
      'breach_small_1',
      'breach_hub_1',
      'torment_hub_1',
      'ks_grand_design'
    ],
    icon: '🗺️'
  },

  // ==================== 2. 聖甲蟲掉落 (Scarab Drop Hub) ====================
  {
    id: 'scarab_drop_1',
    numId: 1005,
    name: '追尋精妙 (Chasing Subtlety)',
    nameEn: 'Chasing Subtlety',
    type: 'notable',
    category: 'scarab',
    description: '輿圖中稀有怪物掉落聖甲蟲數量與稀有度提升。',
    stats: ['地圖中掉落聖甲蟲數量 +40%', '聖甲蟲掉落階級提升機率 +20%'],
    x: 0,
    y: 120,
    connections: [
      'start_origin',
      'core_center_2',
      'scarab_hub_1',
      'legion_hub_1',
      'expedition_hub_1',
      'beyond_hub_1',
      'ks_stream_of_consciousness',
      'ks_back_to_basics',
      'ks_all_hands'
    ],
    icon: '🐞'
  },
  {
    id: 'scarab_hub_1',
    numId: 1006,
    name: '顯著寶藏 (Significant Trove)',
    nameEn: 'Significant Trove',
    type: 'notable',
    category: 'scarab',
    description: '金怪與地圖首領掉落稀有特殊甲蟲機率倍增。',
    stats: ['地圖首領掉落 1 個額外聖甲蟲', '精華怪/金怪掉落特定甲蟲機率 +50%'],
    x: 180,
    y: 0,
    connections: ['scarab_drop_1', 'map_sustain_2', 'essence_hub_1', 'legion_hub_1'],
    icon: '🐞'
  }
];
