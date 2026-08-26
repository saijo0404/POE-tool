import type { AtlasStrategy } from './types';

export const ATLAS_PRESET_STRATEGIES: AtlasStrategy[] = [
  // 1. Essence Farming Strategy (精髓速刷)
  {
    id: 'preset_essence',
    name: '精髓極速量產策略 (Essence Farming)',
    category: 'essence',
    description: '經典穩定起步與中後期高收益策略。透過輿圖天賦與甲蟲將每張地圖塞滿 8~15 個高階精髓怪，快速收穫尖嘯與遺忘精華。',
    tags: ['速刷', '穩定產出', '通貨快銷', '入門必備'],
    tiers: [
      {
        id: 'essence_tier_budget',
        name: '入門低配 (白嫖/低成本速刷)',
        description: '適合拓荒期或白黃圖階段，成本極低，穩定每場 3~6 個精髓，賺取第一桶金。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAH4AT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiA==',
        recommendedMaps: ['幽閉墓穴 (Dunes)', '濱海山丘 (Strand)', '市集 (City Square)'],
        coreKeystones: ['不屈之志 (Unwavering Vision)', '專注單一 (Singular Focus)'],
        mechanicNotes: '白圖直衝精髓點，遇到紫色精髓（恐懼、忌妒、傲慢、輕蔑）直接用瓦爾寶珠點腐化，有機率升級為瘋狂、精神、譫妄、腐化等高價精髓。',
        scarabs: [
          { id: 'sc_ess_1', name: '精髓甲蟲', nameEn: 'Essence Scarab', count: 2, customPriceChaos: 3 },
          { id: 'sc_ess_2', name: '飛升之精髓甲蟲', nameEn: 'Essence Scarab of Ascent', count: 1, customPriceChaos: 12 }
        ],
        extraItems: [
          { id: 'ex_ess_craft', name: '地圖工藝：精髓 (Essence)', nameEn: 'Essence Craft', category: 'craft', count: 1, unitPriceChaos: 8 },
          { id: 'ex_ess_map', name: 'T16 幽閉墓穴 (Dunes)', nameEn: 'T16 Dunes Map', category: 'map', count: 1, unitPriceChaos: 4 },
          { id: 'ex_ess_vaal', name: '瓦爾寶珠 (Vaal Orb)', nameEn: 'Vaal Orb', category: 'currency', count: 2, unitPriceChaos: 1 }
        ],
        estimatedRevenuePerMapChaos: 65,
        mapsPerHour: 20
      },
      {
        id: 'essence_tier_mid',
        name: '進階中配 (雙飛升+穩定昇華)',
        description: 'T16 地圖全精髓天賦點滿，搭配雙飛升與穩定甲蟲，每隻精髓保底尖嘯以上且安全瓦爾。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiK3n',
        recommendedMaps: ['劇毒林地 (Toxic Sewer)', '晨曦墓園 (Cemetery)', '幽閉墓穴 (Dunes)'],
        coreKeystones: ['第七道門 (The Seventh Gate)', '專注單一 (Singular Focus)'],
        mechanicNotes: '精髓怪血厚攻擊高，建議配置一定爆發傷害技能；配合地圖儀精髓工藝可將單場精髓數量推至 10 隻以上。',
        scarabs: [
          { id: 'sc_ess_m1', name: '飛升之精髓甲蟲', nameEn: 'Essence Scarab of Ascent', count: 2, customPriceChaos: 12 },
          { id: 'sc_ess_m2', name: '穩定之精髓甲蟲', nameEn: 'Essence Scarab of Stability', count: 1, customPriceChaos: 8 },
          { id: 'sc_ess_m3', name: '適應之精髓甲蟲', nameEn: 'Essence Scarab of Adaptation', count: 1, customPriceChaos: 15 }
        ],
        extraItems: [
          { id: 'ex_ess_m_craft', name: '地圖工藝：精髓 (Essence)', nameEn: 'Essence Craft', category: 'craft', count: 1, unitPriceChaos: 8 },
          { id: 'ex_ess_m_map', name: 'T16 劇毒林地 (Toxic Sewer)', nameEn: 'T16 Toxic Sewer Map', category: 'map', count: 1, unitPriceChaos: 4 },
          { id: 'ex_ess_m_vaal', name: '瓦爾寶珠 (Vaal Orb)', nameEn: 'Vaal Orb', category: 'currency', count: 4, unitPriceChaos: 1 }
        ],
        estimatedRevenuePerMapChaos: 125,
        mapsPerHour: 18
      },
      {
        id: 'essence_tier_high',
        name: '極限頂配 (鈣化全稀有精髓化+8詞極限爆發)',
        description: '使用鈣化甲蟲將地圖內「所有稀有怪」全數禁錮為精髓，單場產出 20~40 顆尖嘯與遺忘精髓！',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiK3nXYZ',
        recommendedMaps: ['劇毒林地 (Toxic Sewer)', '堡壘 (Citadel Map T17)', '幽閉墓穴 (Dunes)'],
        coreKeystones: ['第七道門 (The Seventh Gate)', '命運扭曲 (Twist of Fate)'],
        mechanicNotes: '怪物極度危險！請確保角色具備百萬級別 DPS 或足夠坦度，鈣化會將金怪全變精髓，擊殺後精華滿地噴發。',
        scarabs: [
          { id: 'sc_ess_h1', name: '鈣化之精髓甲蟲', nameEn: 'Essence Scarab of Calcification', count: 1, customPriceChaos: 45 },
          { id: 'sc_ess_h2', name: '飛升之精髓甲蟲', nameEn: 'Essence Scarab of Ascent', count: 2, customPriceChaos: 12 },
          { id: 'sc_ess_h3', name: '適應之精髓甲蟲', nameEn: 'Essence Scarab of Adaptation', count: 1, customPriceChaos: 15 }
        ],
        extraItems: [
          { id: 'ex_ess_h_craft', name: '地圖工藝：精髓 (Essence)', nameEn: 'Essence Craft', category: 'craft', count: 1, unitPriceChaos: 8 },
          { id: 'ex_ess_h_map', name: 'T16 8詞已污染地圖 (8-Mod Corrupted)', nameEn: 'T16 8-Mod Corrupted Map', category: 'map', count: 1, unitPriceChaos: 10 },
          { id: 'ex_ess_h_vaal', name: '瓦爾寶珠 (Vaal Orb)', nameEn: 'Vaal Orb', category: 'currency', count: 6, unitPriceChaos: 1 }
        ],
        estimatedRevenuePerMapChaos: 260,
        mapsPerHour: 14
      }
    ]
  },

  // 2. Ambush Strongbox Strategy (伏擊開箱)
  {
    id: 'preset_ambush',
    name: '伏擊強盜寶箱狂潮 (Ambush Strongbox)',
    category: 'ambush',
    description: '透過高密度保險箱天賦與隱密/效能甲蟲，大幅提高占卜師與製圖師寶箱，量產神聖石、命運卡與 T17 地圖。',
    tags: ['寶箱', '命運卡', 'T17地圖產出', '打寶'],
    tiers: [
      {
        id: 'ambush_tier_budget',
        name: '入門低配 (四保險箱白圖速開)',
        description: '雙伏擊甲蟲 + 地圖儀伏擊工藝，單場保底 10 個以上保險箱，點石成金隨開隨走。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAHQAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiAmb1',
        recommendedMaps: ['幽閉墓穴 (Dunes)', '晨曦墓園 (Cemetery)'],
        coreKeystones: ['專注單一 (Singular Focus)'],
        mechanicNotes: '遇到普通保險箱使用蛻變石點成魔法，遇到製圖師或占卜師務必用點金石點成稀有，並瓦爾寶珠點腐化。',
        scarabs: [
          { id: 'sc_amb_1', name: '伏擊甲蟲', nameEn: 'Ambush Scarab', count: 3, customPriceChaos: 5 }
        ],
        extraItems: [
          { id: 'ex_amb_craft', name: '地圖工藝：伏擊 (Ambush)', nameEn: 'Ambush Craft', category: 'craft', count: 1, unitPriceChaos: 7 },
          { id: 'ex_amb_map', name: 'T16 幽閉墓穴 (Dunes)', nameEn: 'T16 Dunes Map', category: 'map', count: 1, unitPriceChaos: 4 }
        ],
        estimatedRevenuePerMapChaos: 70,
        mapsPerHour: 18
      },
      {
        id: 'ambush_tier_mid',
        name: '進階中配 (重重複刻+隱密雙開)',
        description: '配置隱密甲蟲 (15% 重複開啟) 與效能甲蟲 (詞綴效果 +75%)，大產出神聖石與高級命運卡。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiAmb2',
        recommendedMaps: ['晨曦墓園 (Cemetery)', '幽閉墓穴 (Dunes)', '劇毒林地 (Toxic Sewer)'],
        coreKeystones: ['專注單一 (Singular Focus)', '第七道門 (The Seventh Gate)'],
        mechanicNotes: '保險箱怪物具備高爆發猝死風險（如冰凍新星、引爆屍體），務必攜帶解凍藥劑或免死防護。',
        scarabs: [
          { id: 'sc_amb_m1', name: '伏擊甲蟲', nameEn: 'Ambush Scarab', count: 2, customPriceChaos: 5 },
          { id: 'sc_amb_m2', name: '隱密之伏擊甲蟲', nameEn: 'Ambush Scarab of Hidden Compartments', count: 1, customPriceChaos: 28 },
          { id: 'sc_amb_m3', name: '效能之伏擊甲蟲', nameEn: 'Ambush Scarab of Potency', count: 1, customPriceChaos: 18 }
        ],
        extraItems: [
          { id: 'ex_amb_m_craft', name: '地圖工藝：伏擊 (Ambush)', nameEn: 'Ambush Craft', category: 'craft', count: 1, unitPriceChaos: 7 },
          { id: 'ex_amb_m_map', name: 'T16 8詞已污染地圖 (8-Mod Corrupted)', nameEn: 'T16 8-Mod Corrupted Map', category: 'map', count: 1, unitPriceChaos: 10 }
        ],
        estimatedRevenuePerMapChaos: 160,
        mapsPerHour: 16
      },
      {
        id: 'ambush_tier_high',
        name: '極限頂配 (圍堵封印+T17極致打寶)',
        description: '使用圍堵甲蟲將整張地圖怪物全數轉換為保險箱，結合 8 詞 T17 地圖與瞻妄玉，高機率噴發魔血/獵頭/神聖石！',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiAmb3',
        recommendedMaps: ['堡壘 (Citadel Map T17)', '恐懼要塞 (Abomination Map T17)', '晨曦墓園 (Cemetery)'],
        coreKeystones: ['命運扭曲 (Twist of Fate)', '第七道門 (The Seventh Gate)'],
        mechanicNotes: '極高成本策略，圍堵甲蟲單張 120c，配合 8 詞 T17 地圖，建議具備穩定過億傷害與極致坦度的頂級 Build 執行。',
        scarabs: [
          { id: 'sc_amb_h1', name: '圍堵之伏擊甲蟲', nameEn: 'Ambush Scarab of Containment', count: 1, customPriceChaos: 120 },
          { id: 'sc_amb_h2', name: '隱密之伏擊甲蟲', nameEn: 'Ambush Scarab of Hidden Compartments', count: 1, customPriceChaos: 28 },
          { id: 'sc_amb_h3', name: '效能之伏擊甲蟲', nameEn: 'Ambush Scarab of Potency', count: 2, customPriceChaos: 18 }
        ],
        extraItems: [
          { id: 'ex_amb_h_map', name: 'T17 堡壘 (Citadel Map)', nameEn: 'T17 Citadel Map', category: 'map', count: 1, unitPriceChaos: 65 },
          { id: 'ex_amb_h_deli', name: '通貨瞻妄玉 (Skittering Delirium Orb)', nameEn: 'Skittering Delirium Orb', category: 'delirium', count: 2, unitPriceChaos: 25 },
          { id: 'ex_amb_h_craft', name: '地圖工藝：伏擊 (Ambush)', nameEn: 'Ambush Craft', category: 'craft', count: 1, unitPriceChaos: 7 }
        ],
        estimatedRevenuePerMapChaos: 520,
        mapsPerHour: 10
      }
    ]
  },

  // 3. Harvest Lifeforce (收割莊園)
  {
    id: 'preset_harvest',
    name: '莊園收割命能印鈔 (Harvest Lifeforce)',
    category: 'harvest',
    description: '市場永不貶值的硬通貨命能（黃色/藍色/紫色生機力量）。透過甲蟲倍增與高階農作物天賦，整車打包大宗販售給工藝玩家。',
    tags: ['命能', '大宗交易', '無隨機保底', '高回報'],
    tiers: [
      {
        id: 'harvest_tier_budget',
        name: '入門低配 (保底莊園進階採集)',
        description: '單收割甲蟲 + 命能掉落增量天賦，穩定收穫 1,500 ~ 2,500 命能。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAHQAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiHarv1',
        recommendedMaps: ['幽閉墓穴 (Dunes)', '劇毒林地 (Toxic Sewer)'],
        coreKeystones: ['專注單一 (Singular Focus)'],
        mechanicNotes: '優先選黃色種子（野生命能），市場價格最高；若無黃色則選藍色（原始命能）。',
        scarabs: [
          { id: 'sc_har_1', name: '收割甲蟲', nameEn: 'Harvest Scarab', count: 1, customPriceChaos: 6 },
          { id: 'sc_har_2', name: '早期之收割甲蟲', nameEn: 'Harvest Scarab of Early Crop', count: 1, customPriceChaos: 20 }
        ],
        extraItems: [
          { id: 'ex_har_map', name: 'T16 幽閉墓穴 (Dunes)', nameEn: 'T16 Dunes Map', category: 'map', count: 1, unitPriceChaos: 4 }
        ],
        estimatedRevenuePerMapChaos: 90,
        mapsPerHour: 15
      },
      {
        id: 'harvest_tier_high',
        name: '極限頂配 (豐富翻倍+覺醒T4雙冠王)',
        description: '雙豐富甲蟲 (命能翻倍) + 覺醒收割甲蟲 (必出 T4 頭目)，單場產出 6,000 ~ 12,000 命能與白結晶！',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiHarv2',
        recommendedMaps: ['劇毒林地 (Toxic Sewer)', '堡壘 (Citadel Map T17)'],
        coreKeystones: ['第七道門 (The Seventh Gate)', '專注單一 (Singular Focus)'],
        mechanicNotes: '務必使用 8 詞地圖以最大化地圖掉落數量詞綴，地圖掉落數量會直接等比放大命能掉落總量！',
        scarabs: [
          { id: 'sc_har_h1', name: '豐富之收割甲蟲', nameEn: 'Harvest Scarab of Doubling', count: 2, customPriceChaos: 42 },
          { id: 'sc_har_h2', name: '覺醒之收割甲蟲', nameEn: 'Harvest Scarab of Cornucopia', count: 1, customPriceChaos: 95 }
        ],
        extraItems: [
          { id: 'ex_har_h_map', name: 'T16 8詞已污染地圖 (8-Mod Corrupted)', nameEn: 'T16 8-Mod Corrupted Map', category: 'map', count: 1, unitPriceChaos: 10 },
          { id: 'ex_har_h_craft', name: '地圖工藝：收割 (Harvest)', nameEn: 'Harvest Craft', category: 'craft', count: 1, unitPriceChaos: 12 }
        ],
        estimatedRevenuePerMapChaos: 380,
        mapsPerHour: 12
      }
    ]
  },

  // 4. Expedition Farming (探險炸墳)
  {
    id: 'preset_expedition',
    name: '探險炸墳日誌策略 (Expedition Dannig/Tujen)',
    category: 'expedition',
    description: '專注於丹尼格 (Dannig) 遺物與圖貞 (Tujen) 通貨硬幣，產出大量探險日誌，自刷兌換神聖石或整批售出。',
    tags: ['炸墳', '圖貞開箱', '日誌大宗', '高利潤'],
    tiers: [
      {
        id: 'expedition_tier_budget',
        name: '入門低配 (一鍵引爆大範圍連環炸)',
        description: '點選探險一鍵引爆基石天賦，大幅縮短每場炸墳時間，快速累積各陣營硬幣與日誌。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAHQAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiExp1',
        recommendedMaps: ['幽閉墓穴 (Dunes)', '濱海山丘 (Strand)'],
        coreKeystones: ['專注單一 (Singular Focus)'],
        mechanicNotes: '放置炸藥時優先連接「增加掉落日誌數量」與「增加符文怪物掉落數量」的遺物柱。',
        scarabs: [
          { id: 'sc_exp_1', name: '探險甲蟲', nameEn: 'Expedition Scarab', count: 1, customPriceChaos: 6 },
          { id: 'sc_exp_2', name: '符文之探險甲蟲', nameEn: 'Expedition Scarab of Runefinding', count: 1, customPriceChaos: 25 }
        ],
        extraItems: [
          { id: 'ex_exp_map', name: 'T16 幽閉墓穴 (Dunes)', nameEn: 'T16 Dunes Map', category: 'map', count: 1, unitPriceChaos: 4 }
        ],
        estimatedRevenuePerMapChaos: 85,
        mapsPerHour: 16
      },
      {
        id: 'expedition_tier_high',
        name: '極限頂配 (丹尼格必出+考古學收益極大化)',
        description: '配置丹尼格挖掘甲蟲與考古甲蟲，遺物增幅 +40%，單場保底 1~3 本黑鐮/騎士日誌與大批太陽硬幣。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiExp2',
        recommendedMaps: ['幽閉墓穴 (Dunes)', '市集 (City Square)'],
        coreKeystones: ['第七道門 (The Seventh Gate)', '專注單一 (Singular Focus)'],
        mechanicNotes: '手動精準佈置 5 個炸藥，避開完全免疫你技能屬性的詞綴（如免疫物理/火焰/混沌/不能暴擊）。',
        scarabs: [
          { id: 'sc_exp_h1', name: '挖掘之探險甲蟲', nameEn: 'Expedition Scarab of the Skiff', count: 1, customPriceChaos: 55 },
          { id: 'sc_exp_h2', name: '考古之探險甲蟲', nameEn: 'Expedition Scarab of Archaeology', count: 2, customPriceChaos: 30 },
          { id: 'sc_exp_h3', name: '符文之探險甲蟲', nameEn: 'Expedition Scarab of Runefinding', count: 1, customPriceChaos: 25 }
        ],
        extraItems: [
          { id: 'ex_exp_h_map', name: 'T16 8詞已污染地圖 (8-Mod Corrupted)', nameEn: 'T16 8-Mod Corrupted Map', category: 'map', count: 1, unitPriceChaos: 10 },
          { id: 'ex_exp_h_craft', name: '地圖工藝：探險 (Expedition)', nameEn: 'Expedition Craft', category: 'craft', count: 1, unitPriceChaos: 10 }
        ],
        estimatedRevenuePerMapChaos: 310,
        mapsPerHour: 14
      }
    ]
  },

  // 5. Legion 5-Way & Splinters (戰亂軍團)
  {
    id: 'preset_legion',
    name: '戰亂軍團印記裂片 (Legion 5-Way & Emblems)',
    category: 'legion',
    description: '在開闊地形地圖（幽閉墓穴 Dunes）瞬間全破冰軍團，大量產出瑪拉克斯、聖堂印記碎片、孕育石與傳奇珠寶。',
    tags: ['開闊地圖', '全螢幕清圖', '五軍門票', '孕育石'],
    tiers: [
      {
        id: 'legion_tier_budget',
        name: '入門低配 (雙軍團白圖破冰)',
        description: '基礎戰亂甲蟲 + 幽閉墓穴，快速擊破水晶與將領，收穫穩定印記碎片。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAHQAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiLeg1',
        recommendedMaps: ['幽閉墓穴 (Dunes)', '濱海山丘 (Strand)'],
        coreKeystones: ['專注單一 (Singular Focus)'],
        mechanicNotes: '全螢幕清圖技能（如冰霜射擊、暴風雪、龍捲射擊、旋風斬、電球）效果最佳，開場立即破除兩端將領。',
        scarabs: [
          { id: 'sc_leg_1', name: '戰亂甲蟲', nameEn: 'Legion Scarab', count: 2, customPriceChaos: 5 }
        ],
        extraItems: [
          { id: 'ex_leg_map', name: 'T16 幽閉墓穴 (Dunes)', nameEn: 'T16 Dunes Map', category: 'map', count: 1, unitPriceChaos: 4 },
          { id: 'ex_leg_craft', name: '地圖工藝：戰亂 (Legion)', nameEn: 'Legion Craft', category: 'craft', count: 1, unitPriceChaos: 8 }
        ],
        estimatedRevenuePerMapChaos: 75,
        mapsPerHour: 20
      },
      {
        id: 'legion_tier_high',
        name: '極限頂配 (永恆重複喚醒+軍閥將領滿載)',
        description: '配置永恆甲蟲 (怪物可被多次重複喚醒) + 軍閥將領甲蟲，單場可組裝 2~4 套完整永恆印記！',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiLeg2',
        recommendedMaps: ['幽閉墓穴 (Dunes)', '晨曦墓園 (Cemetery)'],
        coreKeystones: ['第七道門 (The Seventh Gate)', '專注單一 (Singular Focus)'],
        mechanicNotes: '重複喚醒機制在限定時間內考驗角色的瞬間爆發與跑速，單場擊殺數通常破千。',
        scarabs: [
          { id: 'sc_leg_h1', name: '永恆之戰亂甲蟲', nameEn: 'Legion Scarab of the Eternal Conflict', count: 1, customPriceChaos: 65 },
          { id: 'sc_leg_h2', name: '軍閥之戰亂甲蟲', nameEn: 'Legion Scarab of Commanders', count: 1, customPriceChaos: 38 },
          { id: 'sc_leg_h3', name: '官員之戰亂甲蟲', nameEn: 'Legion Scarab of Officers', count: 2, customPriceChaos: 20 }
        ],
        extraItems: [
          { id: 'ex_leg_h_map', name: 'T16 8詞已污染地圖 (8-Mod Corrupted)', nameEn: 'T16 8-Mod Corrupted Map', category: 'map', count: 1, unitPriceChaos: 10 },
          { id: 'ex_leg_h_craft', name: '地圖工藝：戰亂 (Legion)', nameEn: 'Legion Craft', category: 'craft', count: 1, unitPriceChaos: 8 }
        ],
        estimatedRevenuePerMapChaos: 340,
        mapsPerHour: 15
      }
    ]
  },

  // 6. Delirium & Beyond (瞻妄與聖靈之核)
  {
    id: 'preset_delirium',
    name: '瞻妄之霧與 80% 瞻妄玉打寶 (Delirium Juice)',
    category: 'delirium',
    description: '在密集地圖（劇毒林地 Toxic Sewer）維持全場瞻妄之霧或塗抹 4~5 顆瞻妄玉，產出巨量幻象異界碎片與高階星團珠寶。',
    tags: ['瞻妄', '星團珠寶', '幻象門票', '極限密度'],
    tiers: [
      {
        id: 'delirium_tier_mid',
        name: '進階中配 (開鏡狂亂+雙獎勵條狂飆)',
        description: '配置瞻妄甲蟲與狂亂甲蟲，獎勵條輕鬆飆到 8~10 層，掉落多顆瞻妄玉與星團珠寶。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAHQAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiDeli1',
        recommendedMaps: ['劇毒林地 (Toxic Sewer)', '濱海山丘 (Strand)'],
        coreKeystones: ['專注單一 (Singular Focus)'],
        mechanicNotes: '劇毒林地為一直線單向地圖，瞻妄之霧不會輕易消散，適合快速推進。',
        scarabs: [
          { id: 'sc_del_1', name: '瞻妄甲蟲', nameEn: 'Delirium Scarab', count: 1, customPriceChaos: 5 },
          { id: 'sc_del_2', name: '狂亂之瞻妄甲蟲', nameEn: 'Delirium Scarab of Mania', count: 1, customPriceChaos: 32 },
          { id: 'sc_del_3', name: '幻象之瞻妄甲蟲', nameEn: 'Delirium Scarab of Paranoia', count: 1, customPriceChaos: 45 }
        ],
        extraItems: [
          { id: 'ex_del_map', name: 'T16 劇毒林地 (Toxic Sewer)', nameEn: 'T16 Toxic Sewer Map', category: 'map', count: 1, unitPriceChaos: 4 },
          { id: 'ex_del_craft', name: '地圖工藝：瞻妄 (Delirium)', nameEn: 'Delirium Craft', category: 'craft', count: 1, unitPriceChaos: 10 }
        ],
        estimatedRevenuePerMapChaos: 220,
        mapsPerHour: 14
      },
      {
        id: 'delirium_tier_high',
        name: '極限頂配 (80% 瞻妄玉塗抹+T17 極致狂瀾)',
        description: '塗抹 4 顆占卜/通貨瞻妄玉於 T17 堡壘地圖，結合泰坦甲蟲與極限詞綴，單場收益達 2~4 顆神聖石！',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiDeli2',
        recommendedMaps: ['堡壘 (Citadel Map T17)', '劇毒林地 (Toxic Sewer)'],
        coreKeystones: ['第七道門 (The Seventh Gate)', '命運扭曲 (Twist of Fate)'],
        mechanicNotes: '80% 瞻妄帶來極高怪物減傷與致命傷害，需要頂尖防禦機制與極高單體/清圖 DPS。',
        scarabs: [
          { id: 'sc_del_h1', name: '狂亂之瞻妄甲蟲', nameEn: 'Delirium Scarab of Mania', count: 2, customPriceChaos: 32 },
          { id: 'sc_del_h2', name: '泰坦甲蟲', nameEn: 'Titanic Scarab', count: 2, customPriceChaos: 35 }
        ],
        extraItems: [
          { id: 'ex_del_h_map', name: 'T17 堡壘 (Citadel Map)', nameEn: 'T17 Citadel Map', category: 'map', count: 1, unitPriceChaos: 65 },
          { id: 'ex_del_h_orb1', name: '占卜瞻妄玉 (Diviner\'s Delirium Orb)', nameEn: "Diviner's Delirium Orb", category: 'delirium', count: 2, unitPriceChaos: 22 },
          { id: 'ex_del_h_orb2', name: '通貨瞻妄玉 (Skittering Delirium Orb)', nameEn: 'Skittering Delirium Orb', category: 'delirium', count: 2, unitPriceChaos: 25 }
        ],
        estimatedRevenuePerMapChaos: 480,
        mapsPerHour: 10
      }
    ]
  },

  // 7. Boss Rush & Invitations (輿圖王速刷)
  {
    id: 'preset_boss_rush',
    name: '守護者輿圖王與門票速刷 (Boss Rush)',
    category: 'boss',
    description: '完全無視小怪，直衝地圖 Boss 擊殺，快速獲取焚界者/滅絕者門票、征服者地圖、塑界/尊師守護者地圖與賢者邀請函。',
    tags: ['1分鐘1場', '極速過圖', '門票量產', '低門檻高時薪'],
    tiers: [
      {
        id: 'boss_tier_budget',
        name: '入門低配 (30秒市集直衝殺王)',
        description: '市集 (City Square) 三隻 Boss 瞬間融化，天賦全點地圖掉落與勢力影響進度。',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAHQAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiBoss1',
        recommendedMaps: ['市集 (City Square)', '平頂荒漠 (Mesa)', '濱海山丘 (Strand)'],
        coreKeystones: ['專注單一 (Singular Focus)', '不屈之志 (Unwavering Vision)'],
        mechanicNotes: '進圖開啟位移技能直奔王房，3 秒擊殺三王拾取守護者地圖與門票進度立即開下一張。',
        scarabs: [
          { id: 'sc_boss_1', name: '複製之製圖甲蟲', nameEn: 'Cartography Scarab of Duplication', count: 2, customPriceChaos: 18 }
        ],
        extraItems: [
          { id: 'ex_boss_map', name: 'T16 市集 (City Square)', nameEn: 'T16 City Square Map', category: 'map', count: 1, unitPriceChaos: 4 }
        ],
        estimatedRevenuePerMapChaos: 50,
        mapsPerHour: 35
      },
      {
        id: 'boss_tier_high',
        name: '極限頂配 (T17 極速殺王+Uber 碎片雙產出)',
        description: '專攻 T17 地圖守護者，每場保底產出 Uber Boss 碎片（價格 1~2 Divine），時薪極為驚人！',
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFAIAAT-bB7v7Fp-L-xW2IUPb4_7L6_sVtiBoss2',
        recommendedMaps: ['堡壘 (Citadel Map T17)', '聖所 (Sanctuary Map T17)'],
        coreKeystones: ['第七道門 (The Seventh Gate)'],
        mechanicNotes: 'T17 Boss 具有致命技能（如雷射、地雷、階段鎖血），需熟悉走位或具備單次破千萬 DPS 瞬間秒殺。',
        scarabs: [
          { id: 'sc_boss_h1', name: '泰坦甲蟲', nameEn: 'Titanic Scarab', count: 2, customPriceChaos: 35 },
          { id: 'sc_boss_h2', name: '複製之製圖甲蟲', nameEn: 'Cartography Scarab of Duplication', count: 2, customPriceChaos: 18 }
        ],
        extraItems: [
          { id: 'ex_boss_h_map', name: 'T17 堡壘 (Citadel Map)', nameEn: 'T17 Citadel Map', category: 'map', count: 1, unitPriceChaos: 65 }
        ],
        estimatedRevenuePerMapChaos: 390,
        mapsPerHour: 18
      }
    ]
  }
];
