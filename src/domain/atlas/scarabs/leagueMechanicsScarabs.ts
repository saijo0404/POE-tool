import type { ScarabDef } from './types';

export const LEAGUE_MECHANICS_SCARABS: ScarabDef[] = [
  // ================= Essence (精髓) =================
  {
    id: 'essence_scarab',
    name: '精髓甲蟲',
    nameEn: 'Essence Scarab',
    category: 'essence',
    limit: 4,
    description: '區域包含額外 2 個受精髓禁錮的怪物群。',
    basePriceChaos: 3
  },
  {
    id: 'essence_scarab_ascent',
    name: '飛升之精髓甲蟲',
    nameEn: 'Essence Scarab of Ascent',
    category: 'essence',
    limit: 2,
    description: '區域中找到的精髓階級提高 1 階。',
    basePriceChaos: 12
  },
  {
    id: 'essence_scarab_calcification',
    name: '鈣化之精髓甲蟲',
    nameEn: 'Essence Scarab of Calcification',
    category: 'essence',
    limit: 1,
    description: '區域中所有稀有怪物都被精髓禁錮。',
    basePriceChaos: 45
  },
  {
    id: 'essence_scarab_stability',
    name: '穩定之精髓甲蟲',
    nameEn: 'Essence Scarab of Stability',
    category: 'essence',
    limit: 1,
    description: '對區域中被精髓禁錮的怪物使用瓦爾寶珠時，精髓不會被破壞或釋放。',
    basePriceChaos: 8
  },
  {
    id: 'essence_scarab_adaptation',
    name: '適應之精髓甲蟲',
    nameEn: 'Essence Scarab of Adaptation',
    category: 'essence',
    limit: 2,
    description: '區域中被禁錮的怪物每擁有一個精髓，擊殺時有額外機率掉落隨機精髓。',
    basePriceChaos: 15
  },

  // ================= Ambush (伏擊/強盜寶箱) =================
  {
    id: 'ambush_scarab',
    name: '伏擊甲蟲',
    nameEn: 'Ambush Scarab',
    category: 'ambush',
    limit: 4,
    description: '區域包含額外 4 個保險箱。',
    basePriceChaos: 5
  },
  {
    id: 'ambush_scarab_hidden_compartments',
    name: '隱密之伏擊甲蟲',
    nameEn: 'Ambush Scarab of Hidden Compartments',
    category: 'ambush',
    limit: 1,
    description: '區域中的保險箱有 15% 機率可以再次開啟。',
    basePriceChaos: 28
  },
  {
    id: 'ambush_scarab_potency',
    name: '效能之伏擊甲蟲',
    nameEn: 'Ambush Scarab of Potency',
    category: 'ambush',
    limit: 2,
    description: '區域中保險箱上的詞綴效果提高 75%。',
    basePriceChaos: 18
  },
  {
    id: 'ambush_scarab_discernment',
    name: '洞察之伏擊甲蟲',
    nameEn: 'Ambush Scarab of Discernment',
    category: 'ambush',
    limit: 1,
    description: '區域中的保險箱更有可能是稀有且較高階的類型（如製圖師、占卜師）。',
    basePriceChaos: 35
  },
  {
    id: 'ambush_scarab_containment',
    name: '圍堵之伏擊甲蟲',
    nameEn: 'Ambush Scarab of Containment',
    category: 'ambush',
    limit: 1,
    description: '區域中所有怪物都被封印在保險箱中，保險箱數量大幅提升。',
    basePriceChaos: 120
  },

  // ================= Harvest (收割/莊園) =================
  {
    id: 'harvest_scarab',
    name: '收割甲蟲',
    nameEn: 'Harvest Scarab',
    category: 'harvest',
    limit: 1,
    description: '區域包含聖林莊園。',
    basePriceChaos: 6
  },
  {
    id: 'harvest_scarab_doubling',
    name: '豐富之收割甲蟲',
    nameEn: 'Harvest Scarab of Doubling',
    category: 'harvest',
    limit: 2,
    description: '聖林莊園怪物掉落的原始命能數量翻倍。',
    basePriceChaos: 42
  },
  {
    id: 'harvest_scarab_cornucopia',
    name: '覺醒之收割甲蟲',
    nameEn: 'Harvest Scarab of Cornucopia',
    category: 'harvest',
    limit: 1,
    description: '聖林莊園若包含 T4 頭目，產生的命能額外增加。',
    basePriceChaos: 95
  },
  {
    id: 'harvest_scarab_early_crop',
    name: '早期之收割甲蟲',
    nameEn: 'Harvest Scarab of Early Crop',
    category: 'harvest',
    limit: 2,
    description: '聖林莊園作物有額外機率長出高階怪物。',
    basePriceChaos: 20
  },

  // ================= Expedition (探險/炸墳) =================
  {
    id: 'expedition_scarab',
    name: '探險甲蟲',
    nameEn: 'Expedition Scarab',
    category: 'expedition',
    limit: 1,
    description: '區域包含 1 個探險遭遇戰。',
    basePriceChaos: 6
  },
  {
    id: 'expedition_scarab_runefinding',
    name: '符文之探險甲蟲',
    nameEn: 'Expedition Scarab of Runefinding',
    category: 'expedition',
    limit: 2,
    description: '探險遭遇戰中發現符文怪物的數量增加 20%，日誌掉落率提高。',
    basePriceChaos: 25
  },
  {
    id: 'expedition_scarab_verisium',
    name: '挖掘之探險甲蟲',
    nameEn: 'Expedition Scarab of the Skiff',
    category: 'expedition',
    limit: 1,
    description: '探險遭遇戰由丹尼格 (Dannig) 率領。',
    basePriceChaos: 55
  },
  {
    id: 'expedition_scarab_archaeology',
    name: '考古之探險甲蟲',
    nameEn: 'Expedition Scarab of Archaeology',
    category: 'expedition',
    limit: 2,
    description: '探險遺物詞綴效果增加 20%，產出大幅增加。',
    basePriceChaos: 30
  }
];
