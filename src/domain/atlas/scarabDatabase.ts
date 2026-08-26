export interface ScarabDef {
  id: string;
  name: string; // 繁體中文名稱
  nameEn: string; // 英文名稱 (poe.ninja key)
  category: string;
  limit: number;
  description: string;
  basePriceChaos?: number;
}

export const SCARAB_DATABASE: ScarabDef[] = [
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
  },

  // ================= Legion (戰亂/軍團) =================
  {
    id: 'legion_scarab',
    name: '戰亂甲蟲',
    nameEn: 'Legion Scarab',
    category: 'legion',
    limit: 4,
    description: '區域包含 1 個額外戰亂遭遇戰。',
    basePriceChaos: 5
  },
  {
    id: 'legion_scarab_officers',
    name: '官員之戰亂甲蟲',
    nameEn: 'Legion Scarab of Officers',
    category: 'legion',
    limit: 2,
    description: '戰亂遭遇戰各陣營均有 1 位副官率領，產出額外印記。',
    basePriceChaos: 20
  },
  {
    id: 'legion_scarab_commanders',
    name: '軍閥之戰亂甲蟲',
    nameEn: 'Legion Scarab of Commanders',
    category: 'legion',
    limit: 1,
    description: '戰亂遭遇戰各陣營均有 1 位將領率領。',
    basePriceChaos: 38
  },
  {
    id: 'legion_scarab_eternal',
    name: '永恆之戰亂甲蟲',
    nameEn: 'Legion Scarab of the Eternal Conflict',
    category: 'legion',
    limit: 1,
    description: '戰亂怪物可被多次喚醒，戰亂印記碎片產量提高。',
    basePriceChaos: 65
  },

  // ================= Breach (破滅裂痕) =================
  {
    id: 'breach_scarab',
    name: '破滅裂痕甲蟲',
    nameEn: 'Breach Scarab',
    category: 'breach',
    limit: 4,
    description: '區域包含額外 2 個破滅裂痕。',
    basePriceChaos: 4
  },
  {
    id: 'breach_scarab_splinters',
    name: '領地之破滅裂痕甲蟲',
    nameEn: 'Breach Scarab of the Dreamer',
    category: 'breach',
    limit: 2,
    description: '區域中裂痕開啟與開展速度加快，夏烏拉裂痕機率提升。',
    basePriceChaos: 22
  },
  {
    id: 'breach_scarab_lord',
    name: '領主之破滅裂痕甲蟲',
    nameEn: 'Breach Scarab of Lordship',
    category: 'breach',
    limit: 1,
    description: '破滅裂痕包含裂痕領主。',
    basePriceChaos: 35
  },
  {
    id: 'breach_scarab_resonant',
    name: '夢魘之破滅裂痕甲蟲',
    nameEn: 'Breach Scarab of Resonant Cascade',
    category: 'breach',
    limit: 1,
    description: '裂痕怪物密度與密度隨開展擴大，掉落大量裂痕石與碎片。',
    basePriceChaos: 60
  },

  // ================= Delirium (瞻妄之霧) =================
  {
    id: 'delirium_scarab',
    name: '瞻妄甲蟲',
    nameEn: 'Delirium Scarab',
    category: 'delirium',
    limit: 2,
    description: '區域包含瞻妄之鏡。',
    basePriceChaos: 5
  },
  {
    id: 'delirium_scarab_mania',
    name: '狂亂之瞻妄甲蟲',
    nameEn: 'Delirium Scarab of Mania',
    category: 'delirium',
    limit: 2,
    description: '區域中瞻妄獎勵條填滿速度提高 100%。',
    basePriceChaos: 32
  },
  {
    id: 'delirium_scarab_paranoia',
    name: '幻象之瞻妄甲蟲',
    nameEn: 'Delirium Scarab of Paranoia',
    category: 'delirium',
    limit: 2,
    description: '區域包含 2 種額外瞻妄獎勵類型。',
    basePriceChaos: 45
  },

  // ================= Divination (命運卡/占卜) =================
  {
    id: 'divination_scarab',
    name: '命運卡甲蟲',
    nameEn: 'Divination Scarab',
    category: 'divination',
    limit: 2,
    description: '區域掉落的命運卡數量提高 100%。',
    basePriceChaos: 15
  },
  {
    id: 'divination_scarab_curation',
    name: '珍藏之命運卡甲蟲',
    nameEn: 'Divination Scarab of Curation',
    category: 'divination',
    limit: 1,
    description: '區域中掉落的命運卡稀有度大幅提升，高價值卡片掉落率顯著提升。',
    basePriceChaos: 180
  },
  {
    id: 'divination_scarab_plenty',
    name: '富饒之命運卡甲蟲',
    nameEn: 'Divination Scarab of Plenty',
    category: 'divination',
    limit: 2,
    description: '地圖怪物掉落額外隨機命運卡。',
    basePriceChaos: 40
  },

  // ================= Torment & Anarchy (苦痛罪魂與流亡者) =================
  {
    id: 'torment_scarab',
    name: '苦痛甲蟲',
    nameEn: 'Torment Scarab',
    category: 'torment',
    limit: 4,
    description: '區域受 5 個額外罪魂附身或環繞。',
    basePriceChaos: 4
  },
  {
    id: 'torment_scarab_peculiar',
    name: '怪異之苦痛甲蟲',
    nameEn: 'Torment Scarab of Peculiarity',
    category: 'torment',
    limit: 2,
    description: '罪魂更有可能是稀有類型，且擊殺時掉落更多物品。',
    basePriceChaos: 20
  },
  {
    id: 'anarchy_scarab',
    name: '流亡者甲蟲',
    nameEn: 'Anarchy Scarab',
    category: 'torment',
    limit: 4,
    description: '區域包含 4 位額外背叛流亡者。',
    basePriceChaos: 5
  },
  {
    id: 'anarchy_scarab_gigantism',
    name: '巨像之流亡者甲蟲',
    nameEn: 'Anarchy Scarab of Gigantification',
    category: 'torment',
    limit: 2,
    description: '背叛流亡者體型變大，掉落物品數量與稀有度巨幅提高。',
    basePriceChaos: 48
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

  // ================= Ritual & Ultimatum (儀式與通牒) =================
  {
    id: 'ritual_scarab',
    name: '儀式甲蟲',
    nameEn: 'Ritual Scarab',
    category: 'ritual',
    limit: 2,
    description: '區域包含 4 個儀式祭壇。',
    basePriceChaos: 5
  },
  {
    id: 'ritual_scarab_selectiveness',
    name: '挑選之儀式甲蟲',
    nameEn: 'Ritual Scarab of Selectiveness',
    category: 'ritual',
    limit: 2,
    description: '儀式祭壇提供免費重擲獎勵次數，且高階獎勵機率提升。',
    basePriceChaos: 26
  },
  {
    id: 'ultimatum_scarab',
    name: '通牒甲蟲',
    nameEn: 'Ultimatum Scarab',
    category: 'ultimatum',
    limit: 2,
    description: '區域包含通牒遭遇戰。',
    basePriceChaos: 6
  },
  {
    id: 'ultimatum_scarab_bribe',
    name: '賄賂之通牒甲蟲',
    nameEn: 'Ultimatum Scarab of Bribing',
    category: 'ultimatum',
    limit: 2,
    description: '通牒遭遇戰包含額外波次與更高階通貨/傳奇獎勵。',
    basePriceChaos: 36
  },

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

export const POPULAR_EXTRA_ITEMS: Array<{
  name: string;
  nameEn: string;
  category: 'craft' | 'map' | 'delirium' | 'currency' | 'fragment' | 'other';
  defaultPriceChaos: number;
}> = [
  // Map Crafts
  { name: '地圖工藝：精髓 (Essence)', nameEn: 'Essence Craft', category: 'craft', defaultPriceChaos: 8 },
  { name: '地圖工藝：伏擊 (Ambush)', nameEn: 'Ambush Craft', category: 'craft', defaultPriceChaos: 7 },
  { name: '地圖工藝：瞻妄 (Delirium)', nameEn: 'Delirium Craft', category: 'craft', defaultPriceChaos: 10 },
  { name: '地圖工藝：戰亂 (Legion)', nameEn: 'Legion Craft', category: 'craft', defaultPriceChaos: 8 },
  { name: '地圖工藝：收割 (Harvest)', nameEn: 'Harvest Craft', category: 'craft', defaultPriceChaos: 12 },
  { name: '地圖工藝：破滅裂痕 (Breach)', nameEn: 'Breach Craft', category: 'craft', defaultPriceChaos: 6 },
  { name: '地圖工藝：探險 (Expedition)', nameEn: 'Expedition Craft', category: 'craft', defaultPriceChaos: 10 },
  { name: '地圖工藝：儀式 (Ritual)', nameEn: 'Ritual Craft', category: 'craft', defaultPriceChaos: 8 },
  { name: '地圖工藝：命運 (Fortune Favours)', nameEn: 'Fortune Favours the Brave', category: 'craft', defaultPriceChaos: 3 },

  // Map Bases
  { name: 'T16 劇毒林地 (Toxic Sewer)', nameEn: 'T16 Toxic Sewer Map', category: 'map', defaultPriceChaos: 4 },
  { name: 'T16 幽閉墓穴 (Dunes)', nameEn: 'T16 Dunes Map', category: 'map', defaultPriceChaos: 4 },
  { name: 'T16 濱海山丘 (Strand)', nameEn: 'T16 Strand Map', category: 'map', defaultPriceChaos: 4 },
  { name: 'T16 市集 (City Square)', nameEn: 'T16 City Square Map', category: 'map', defaultPriceChaos: 4 },
  { name: 'T16 8詞已污染地圖 (8-Mod Corrupted)', nameEn: 'T16 8-Mod Corrupted Map', category: 'map', defaultPriceChaos: 10 },
  { name: 'T17 堡壘 (Citadel Map)', nameEn: 'T17 Citadel Map', category: 'map', defaultPriceChaos: 65 },
  { name: 'T17 聖所 (Sanctuary Map)', nameEn: 'T17 Sanctuary Map', category: 'map', defaultPriceChaos: 60 },
  { name: 'T17 恐懼要塞 (Abomination Map)', nameEn: 'T17 Abomination Map', category: 'map', defaultPriceChaos: 65 },

  // Delirium Orbs
  { name: '占卜瞻妄玉 (Diviner\'s Delirium Orb)', nameEn: "Diviner's Delirium Orb", category: 'delirium', defaultPriceChaos: 22 },
  { name: '精髓瞻妄玉 (Fine Delirium Orb)', nameEn: 'Fine Delirium Orb', category: 'delirium', defaultPriceChaos: 14 },
  { name: '通貨瞻妄玉 (Skittering Delirium Orb)', nameEn: 'Skittering Delirium Orb', category: 'delirium', defaultPriceChaos: 25 },
  { name: '地圖瞻妄玉 (Cartographer\'s Delirium Orb)', nameEn: "Cartographer's Delirium Orb", category: 'delirium', defaultPriceChaos: 10 },

  // Currency & Consumables
  { name: '瓦爾寶珠 (Vaal Orb)', nameEn: 'Vaal Orb', category: 'currency', defaultPriceChaos: 1 },
  { name: '重鑄石 + 點金石 (Scour + Alch)', nameEn: 'Orb of Scouring', category: 'currency', defaultPriceChaos: 1.5 },
  { name: '製圖釘 (Cartographer\'s Chisel x4)', nameEn: "Cartographer's Chisel", category: 'currency', defaultPriceChaos: 1 },
  { name: '聖靈之核 (Beyond Portal Currency)', nameEn: 'Beyond Catalyst', category: 'currency', defaultPriceChaos: 5 },

  // Fragments
  { name: '奉獻碎片 (Sacrifice at Dawn/Dusk)', nameEn: 'Sacrifice at Dawn', category: 'fragment', defaultPriceChaos: 2 },
  { name: '祭壇之血容器 (Filled Blood Vessel)', nameEn: 'Filled Blood Vessel', category: 'fragment', defaultPriceChaos: 15 }
];
