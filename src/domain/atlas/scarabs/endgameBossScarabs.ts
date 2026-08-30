import type { ScarabDef } from './types';

export const ENDGAME_BOSS_SCARABS: ScarabDef[] = [
  // ================= Bestiary (野獸/獵魔) =================
  {
    id: 'bestiary_scarab',
    name: '野獸甲蟲',
    nameEn: 'Bestiary Scarab',
    category: 'bestiary',
    limit: 2,
    description: '區域包含額外 4 隻紅野獸與獵魔大師埃哈。',
    basePriceChaos: 6
  },
  {
    id: 'bestiary_scarab_duplicating',
    name: '複製之野獸甲蟲',
    nameEn: 'Bestiary Scarab of Duplicating',
    category: 'bestiary',
    limit: 2,
    description: '捕獲野獸時有 100% 機率複製一隻（拓印蛛、深海奇美拉）。',
    basePriceChaos: 75
  },

  // ================= Boss & Influenced (輿圖王與守護者) =================
  {
    id: 'cartography_scarab_duplication',
    name: '複製之製圖甲蟲',
    nameEn: 'Cartography Scarab of Duplication',
    category: 'boss',
    limit: 2,
    description: '地圖掉落時有機率複製一份（適用於 T16/T17 地圖）。',
    basePriceChaos: 18
  },
  {
    id: 'influencing_scarab_shaper',
    name: '塑界者影響甲蟲',
    nameEn: 'Influencing Scarab of the Shaper',
    category: 'boss',
    limit: 1,
    description: '區域增加塑界者怪物群與守護者地圖掉落機率。',
    basePriceChaos: 12
  },
  {
    id: 'influencing_scarab_elder',
    name: '尊師影響甲蟲',
    nameEn: 'Influencing Scarab of the Elder',
    category: 'boss',
    limit: 1,
    description: '區域增加尊師守護者地圖與碎片掉落機率。',
    basePriceChaos: 12
  },

  // ================= Titanic & Horned (泰坦與角質神聖甲蟲) =================
  {
    id: 'titanic_scarab',
    name: '泰坦甲蟲',
    nameEn: 'Titanic Scarab',
    category: 'boss',
    limit: 2,
    description: '傳奇怪物獲得更多生命值與傷害，但掉落大量額外通貨與獎勵。',
    basePriceChaos: 35
  },
  {
    id: 'horned_scarab_nemesis',
    name: '角質甲蟲：宿敵',
    nameEn: 'Horned Scarab of Nemesis',
    category: 'boss',
    limit: 1,
    description: '區域內稀有怪物額外獲得 2 個詞綴，且怪物群數量增加。',
    basePriceChaos: 65
  },
  {
    id: 'horned_scarab_pandemonium',
    name: '角質甲蟲：大混亂',
    nameEn: 'Horned Scarab of Pandemonium',
    category: 'boss',
    limit: 1,
    description: '區域內的怪物群轉化為多種致命且掉落豐厚的特殊遭遇。',
    basePriceChaos: 90
  }
];
