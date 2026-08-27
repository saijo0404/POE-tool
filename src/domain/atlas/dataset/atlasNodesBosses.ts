import type { AtlasNode } from '../types';

export const ATLAS_NODES_BOSSES: AtlasNode[] = [
  // ==================== 首領與異能祭壇 (Boss, Eldritch, Maven) ====================
  {
    id: 'boss_eldritch_1',
    numId: 1601,
    name: '飢餓陰影 (Shadow of Hunger)',
    nameEn: 'Shadow of Hunger',
    type: 'notable',
    category: 'altar',
    description: '滅界者祭壇出現率與金怪數量增加，刷圖打寶主幹。',
    stats: ['滅界者祭壇出現機率 +50%', '祭壇提供【受影響怪物掉落甲蟲/通貨】權重增加'],
    x: 0,
    y: -360,
    connections: [
      'core_center_1',
      'harvest_hub_2',
      'delirium_hub_1',
      'delirium_hub_2',
      'boss_destructive_play',
      'ks_twist_of_fate'
    ],
    icon: '👁️'
  },
  {
    id: 'boss_destructive_play',
    numId: 1602,
    name: '釋界見證 (The Maven Witness)',
    nameEn: 'The Maven Witness',
    type: 'notable',
    category: 'boss',
    description: '釋界見證地圖時，首領戰難度與掉落稀有物品機率提高。',
    stats: ['釋界見證首領戰物品數量 +30%', '首領戰召喚額外菁英守衛'],
    x: 0,
    y: -440,
    connections: ['boss_eldritch_1', 'ks_destructive_play', 'ks_twist_of_fate'],
    icon: '👑'
  }
];
