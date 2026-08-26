export interface AtlasNode {
  id: string;
  numId: number;
  name: string;
  nameEn: string;
  type: 'keystone' | 'notable' | 'small' | 'start';
  category: 'essence' | 'ambush' | 'harvest' | 'expedition' | 'legion' | 'delirium' | 'boss' | 'map' | 'scarab' | 'altar' | 'general';
  description: string;
  stats: string[];
  x: number; // Cartesian coordinates on virtual canvas (-600 to 600)
  y: number; // Cartesian coordinates on virtual canvas (-600 to 600)
  connections: string[]; // Connected node IDs
  icon?: string;
}

export const ATLAS_TREE_NODES_DATA: AtlasNode[] = [
  // ==================== 0. 起點與中心環 (Start & Center Core) ====================
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
    connections: ['map_sustain_1', 'map_sustain_2', 'map_sustain_3', 'map_sustain_4', 'scarab_drop_1'],
    icon: '🏛️'
  },
  {
    id: 'map_sustain_1',
    numId: 1001,
    name: '塑界之峰 (Shaping the Skies)',
    nameEn: 'Shaping the Skies',
    type: 'notable',
    category: 'map',
    description: '大幅提升相鄰與更高階地圖的掉落機率，拓荒主幹必點。',
    stats: ['地圖階級提升機率 +15%', '地圖掉落率增加 10%', '地圖內怪物掉落相鄰地圖機率 +20%'],
    x: -80,
    y: -80,
    connections: ['start_origin', 'map_sustain_2', 'ambush_hub_1', 'harvest_hub_1'],
    icon: '🗺️'
  },
  {
    id: 'map_sustain_2',
    numId: 1002,
    name: '塑海之深 (Shaping the Seas)',
    nameEn: 'Shaping the Seas',
    type: 'notable',
    category: 'map',
    description: '保證地圖產出不斷檔，增加地圖掉落為相鄰喜愛地圖的機率。',
    stats: ['地圖階級提升機率 +15%', '喜愛地圖掉落權重增加 100%', '稀有怪物掉落地圖機率 +10%'],
    x: 80,
    y: -80,
    connections: ['start_origin', 'map_sustain_1', 'essence_hub_1', 'scarab_hub_1'],
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
    stats: ['地圖掉落機率 +20%', '掉落 T16 地圖時 5% 機率轉換為 T17 堡壘/要塞地圖'],
    x: -80,
    y: 80,
    connections: ['start_origin', 'map_sustain_4', 'expedition_hub_1'],
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
    connections: ['start_origin', 'map_sustain_3', 'legion_hub_1'],
    icon: '🗺️'
  },
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
    connections: ['start_origin', 'scarab_hub_1', 'legion_hub_1', 'expedition_hub_1'],
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
  },

  // ==================== 1. 精髓機制輪 (Essence Clusters - 右上區域) ====================
  {
    id: 'essence_hub_1',
    numId: 1101,
    name: '能量增幅 (Amplified Energies)',
    nameEn: 'Amplified Energies',
    type: 'notable',
    category: 'essence',
    description: '精髓策略必備核心天賦，地圖內所有精髓階級直接 +1。',
    stats: ['地圖中含有的精髓階級 +1', '區域內含有 1 個額外精髓'],
    x: 240,
    y: -140,
    connections: ['map_sustain_2', 'scarab_hub_1', 'essence_hub_2', 'essence_hub_3'],
    icon: '💎'
  },
  {
    id: 'essence_hub_2',
    numId: 1102,
    name: '水晶共鳴 (Crystal Resonance)',
    nameEn: 'Crystal Resonance',
    type: 'notable',
    category: 'essence',
    description: '擊殺含有尖嘯或更高精髓的怪物時，獲得複製精髓與額外獎勵。',
    stats: ['含有尖嘯精髓的怪物被擊殺時掉落 1 份額外精髓', '精髓怪物掉落更高階精華機率 +30%'],
    x: 360,
    y: -120,
    connections: ['essence_hub_1', 'essence_hub_4'],
    icon: '💎'
  },
  {
    id: 'essence_hub_3',
    numId: 1103,
    name: '尋找弱點 (Probing for Weakness)',
    nameEn: 'Probing for Weakness',
    type: 'notable',
    category: 'essence',
    description: '每張地圖額外保底追加 1~2 個精髓水晶。',
    stats: ['區域內含有 2 個額外精髓', '精髓怪物釋放時攻擊速度與生命增加 25%'],
    x: 300,
    y: -240,
    connections: ['essence_hub_1', 'essence_hub_4', 'essence_corrupted'],
    icon: '💎'
  },
  {
    id: 'essence_hub_4',
    numId: 1104,
    name: '延續苦痛 (Prolonged Pain)',
    nameEn: 'Prolonged Pain',
    type: 'notable',
    category: 'essence',
    description: '精髓怪物有機率發生分裂複製，單場精華產量翻倍。',
    stats: ['擊殺精髓怪物時 15% 機率複製所有掉落精髓', '區域內所有精髓至少含有 3 個精華'],
    x: 420,
    y: -220,
    connections: ['essence_hub_2', 'essence_hub_3', 'essence_corrupted', 'ks_seventh_gate'],
    icon: '💎'
  },
  {
    id: 'essence_corrupted',
    numId: 1105,
    name: '腐化尖嘯 (Corrupted Screams)',
    nameEn: 'Corrupted Screams',
    type: 'notable',
    category: 'essence',
    description: '瓦爾寶珠點腐化紫色精髓時，大幅提高變異為特有瘋狂/精神/譫妄/腐化精華機率。',
    stats: ['使用瓦爾寶珠腐化精髓時，升級為特有高價精髓的機率 +100%', '腐化精髓怪掉落 1 額外遺忘精華'],
    x: 480,
    y: -320,
    connections: ['essence_hub_3', 'essence_hub_4'],
    icon: '🟣'
  },

  // ==================== 2. 伏擊保險箱機制輪 (Ambush Strongbox - 左上區域) ====================
  {
    id: 'ambush_hub_1',
    numId: 1201,
    name: '雙重誘惑 (Twice Tempted)',
    nameEn: 'Twice Tempted',
    type: 'notable',
    category: 'ambush',
    description: '伏擊開箱基本盤，每張地圖必定追加額外強盜保險箱。',
    stats: ['區域內含有 1 個額外強盜保險箱', '區域含有保險箱的機率 +50%'],
    x: -240,
    y: -140,
    connections: ['map_sustain_1', 'ambush_hub_2', 'ambush_hub_3'],
    icon: '📦'
  },
  {
    id: 'ambush_hub_2',
    numId: 1202,
    name: '防竄改 (Tamper-Proof)',
    nameEn: 'Tamper-Proof',
    type: 'notable',
    category: 'ambush',
    description: '神級懶人與高收益天賦，地圖內所有保險箱全數自動點成稀有並瓦爾污染！',
    stats: ['區域內的強盜保險箱全部為【已污染且已鑑定為稀有】', '保險箱詞綴數量 +1~2 條'],
    x: -360,
    y: -120,
    connections: ['ambush_hub_1', 'ambush_hub_4'],
    icon: '📦'
  },
  {
    id: 'ambush_hub_3',
    numId: 1203,
    name: '秘密夾層 (Secret Compartments)',
    nameEn: 'Secret Compartments',
    type: 'notable',
    category: 'ambush',
    description: '開啟保險箱時有機率觸發重新開啟，雙倍掉落噴發。',
    stats: ['強盜保險箱被開啟後有 10% 機率可以再次開啟', '保險箱怪物群數量 +30%'],
    x: -300,
    y: -240,
    connections: ['ambush_hub_1', 'ambush_hub_4', 'ambush_vault'],
    icon: '📦'
  },
  {
    id: 'ambush_hub_4',
    numId: 1204,
    name: '備用貯藏 (Backup Cache)',
    nameEn: 'Backup Cache',
    type: 'notable',
    category: 'ambush',
    description: '提高占卜師、製圖師與大型珠寶保險箱出現率。',
    stats: ['占卜師保險箱出現機率 +60%', '製圖師保險箱出現機率 +60%', '保險箱掉落物數量 +25%'],
    x: -420,
    y: -220,
    connections: ['ambush_hub_2', 'ambush_hub_3', 'ambush_vault', 'ks_singular_focus'],
    icon: '📦'
  },
  {
    id: 'ambush_vault',
    numId: 1205,
    name: '神秘金庫 (Vault of Mysteries)',
    nameEn: 'Vault of Mysteries',
    type: 'notable',
    category: 'ambush',
    description: '保險箱怪物掉落高等級通貨（神聖石、混沌石）與稀有命運卡機率激增。',
    stats: ['保險箱守衛怪物掉落通貨機率 +35%', '占卜師保險箱額外掉落 1 疊命運卡'],
    x: -480,
    y: -320,
    connections: ['ambush_hub_3', 'ambush_hub_4'],
    icon: '✨'
  },

  // ==================== 3. 莊園收割機制輪 (Harvest Grove - 上方偏左區域) ====================
  {
    id: 'harvest_hub_1',
    numId: 1301,
    name: '聖林之門 (Heart of the Grove)',
    nameEn: 'Heart of the Grove',
    type: 'notable',
    category: 'harvest',
    description: '莊園出現率與生命力採集核心天賦。',
    stats: ['區域含有古靈莊園的機率 +60%', '收割莊園作物獲得的命能增加 20%'],
    x: -120,
    y: -260,
    connections: ['map_sustain_1', 'harvest_hub_2', 'ks_crop_rotation'],
    icon: '🌾'
  },
  {
    id: 'harvest_hub_2',
    numId: 1302,
    name: '豐饒收割 (Bountiful Harvest)',
    nameEn: 'Bountiful Harvest',
    type: 'notable',
    category: 'harvest',
    description: '四級莊園頭目與高階作物命能掉落激增，單場 3000~6000 命能。',
    stats: ['收割作物獲得命能數量 +40%', '三級與四級莊園怪物出現機率 +50%', '有機率掉落神聖之花 (Oshabi 門票)'],
    x: -180,
    y: -380,
    connections: ['harvest_hub_1', 'ks_crop_rotation', 'boss_eldritch_1'],
    icon: '🌾'
  },

  // ==================== 4. 探險機制輪 (Expedition - 左下區域) ====================
  {
    id: 'expedition_hub_1',
    numId: 1401,
    name: '古老文獻 (Ancient Writings)',
    nameEn: 'Ancient Writings',
    type: 'notable',
    category: 'expedition',
    description: '探險日誌掉落率與符文怪物數量加成。',
    stats: ['區域含有探險機制的機率 +60%', '探險怪物掉落【探險日誌】機率 +50%'],
    x: -240,
    y: 160,
    connections: ['map_sustain_3', 'scarab_drop_1', 'expedition_hub_2', 'ks_extreme_arch'],
    icon: '💣'
  },
  {
    id: 'expedition_hub_2',
    numId: 1402,
    name: '埋沒之債 (Buried Debt)',
    nameEn: 'Buried Debt',
    type: 'notable',
    category: 'expedition',
    description: '提高丹尼格 (Dannig) 與圖貞 (Tujen) 出現機率，量產黑鐮與太陽騎士日誌。',
    stats: ['丹尼格出現機率 +100%', '圖貞出現機率 +50%', '探險符文殘骸詞綴數量 +1'],
    x: -360,
    y: 260,
    connections: ['expedition_hub_1', 'ks_extreme_arch'],
    icon: '💣'
  },

  // ==================== 5. 軍團戰亂機制輪 (Legion - 右下區域) ====================
  {
    id: 'legion_hub_1',
    numId: 1501,
    name: '象徵之物 (Emblematic)',
    nameEn: 'Emblematic',
    type: 'notable',
    category: 'legion',
    description: '軍團裂片與永恆印記量產天賦。',
    stats: ['區域含有軍團遭遇機率 +60%', '軍團怪物掉落永恆裂片數量 +40%', '裂片有 20% 機率複製 1 份'],
    x: 240,
    y: 160,
    connections: ['map_sustain_4', 'scarab_drop_1', 'scarab_hub_1', 'legion_hub_2'],
    icon: '⚔️'
  },
  {
    id: 'legion_hub_2',
    numId: 1502,
    name: '軍需補給 (War Supplies)',
    nameEn: 'War Supplies',
    type: 'notable',
    category: 'legion',
    description: '軍團寶箱與將領獎勵翻倍，破冰時間延長。',
    stats: ['軍團將領出現率 +60%', '軍團寶箱掉落額外通貨與孕育石', '軍團破冰時間延長 5 秒'],
    x: 360,
    y: 260,
    connections: ['legion_hub_1', 'ks_unwavering_vision'],
    icon: '⚔️'
  },

  // ==================== 6. 首領與異能祭壇 (Boss, Altars, Maven - 上方區域) ====================
  {
    id: 'boss_eldritch_1',
    numId: 1601,
    name: '飢餓陰影 (Shadow of Hunger)',
    nameEn: 'Shadow of Hunger',
    type: 'notable',
    category: 'altar',
    description: '滅界者祭壇出現率與金怪數量增加，刷圖打寶主幹。',
    stats: ['滅界者祭壇出現機率 +50%', '祭壇提供【受影響怪物掉落甲蟲/通貨】權重大幅增加'],
    x: 0,
    y: -360,
    connections: ['harvest_hub_2', 'boss_destructive_play', 'ks_twist_of_fate'],
    icon: '👁️'
  },
  {
    id: 'boss_destructive_play',
    numId: 1602,
    name: '毀滅之戲 (Destructive Play)',
    nameEn: 'Destructive Play',
    type: 'keystone',
    category: 'boss',
    description: '釋界見證地圖時，在首領戰額外召喚 1~3 位隨機地圖頭目，量產守衛門票與尊師/塑者碎片。',
    stats: ['釋界在地圖首領戰中召喚 1 至 3 個額外地圖頭目', '被召喚的頭目掉落守衛地圖與特殊傳奇機率增加'],
    x: 0,
    y: -480,
    connections: ['boss_eldritch_1', 'ks_twist_of_fate'],
    icon: '👑'
  },

  // ==================== 7. 核心基石天賦 (Keystones - 關鍵遊戲規則改變) ====================
  {
    id: 'ks_seventh_gate',
    numId: 1701,
    name: '第七道門 (The Seventh Gate)',
    nameEn: 'The Seventh Gate',
    type: 'keystone',
    category: 'general',
    description: '配置 6 個通道天賦門時，地圖儀解鎖本賽季「所有」特殊工藝（精髓、伏擊、譫妄、探險等）。',
    stats: ['解鎖所有可用的地圖儀工藝選項', '允許自選任意機制工藝'],
    x: 520,
    y: -180,
    connections: ['essence_hub_4'],
    icon: '🚪'
  },
  {
    id: 'ks_singular_focus',
    numId: 1702,
    name: '專注單一 (Singular Focus)',
    nameEn: 'Singular Focus',
    type: 'keystone',
    category: 'general',
    description: '掉落非喜愛地圖時自動轉化為通貨陷阱或直接消滅，無限滾動產出單一喜愛地圖（如幽閉墓穴/劇毒林地）。',
    stats: ['地圖掉落為喜愛地圖機率 +200%', '非喜愛地圖掉落轉換為基礎通貨 (改造石/機會石/點金石)'],
    x: -520,
    y: -180,
    connections: ['ambush_hub_4'],
    icon: '🎯'
  },
  {
    id: 'ks_unwavering_vision',
    numId: 1703,
    name: '不屈之志 (Unwavering Vision)',
    nameEn: 'Unwavering Vision',
    type: 'keystone',
    category: 'general',
    description: '拓荒白嫖神天賦：地圖儀無法使用甲蟲，但直接獲得【20 點額外輿圖天賦點數】！',
    stats: ['獲得 20 點額外輿圖天賦點數', '地圖儀無法放入或使用聖甲蟲', '地圖中無法掉落聖甲蟲'],
    x: 480,
    y: 340,
    connections: ['legion_hub_2'],
    icon: '🛡️'
  },
  {
    id: 'ks_extreme_arch',
    numId: 1704,
    name: '極限考古 (Extreme Archaeology)',
    nameEn: 'Extreme Archaeology',
    type: 'keystone',
    category: 'expedition',
    description: '將多次放置炸藥改為【單一巨大炸藥】，瞬間炸開整片探險遺跡，極速刷圖必備！',
    stats: ['探險遭遇只有 1 個巨大炸藥', '炸藥放置範圍增加 200%', '一次引爆所有探險殘骸與怪物'],
    x: -480,
    y: 340,
    connections: ['expedition_hub_2'],
    icon: '💥'
  },
  {
    id: 'ks_crop_rotation',
    numId: 1705,
    name: '作物輪作 (Crop Rotation)',
    nameEn: 'Crop Rotation',
    type: 'keystone',
    category: 'harvest',
    description: '收割一個顏色莊園作物時，其他顏色作物有機率隨機升級為高階稀有怪物，博弈超高命能！',
    stats: ['收割作物有 35% 機率升級同地圖內其他未收割作物的階級', '四級莊園首領出現率提升'],
    x: -80,
    y: -440,
    connections: ['harvest_hub_1', 'harvest_hub_2'],
    icon: '🔄'
  },
  {
    id: 'ks_twist_of_fate',
    numId: 1706,
    name: '命運扭曲 (Twist of Fate)',
    nameEn: 'Twist of Fate',
    type: 'keystone',
    category: 'general',
    description: '已污染已鑑定地圖在開啟時會隨機重骰所有詞綴與地圖類型，享受超高數量與稀有度加成！',
    stats: ['已污染未鑑定/已鑑定地圖詞綴於進入時隨機重骰', '地圖掉落物品數量與稀有度額外提升 25%'],
    x: 140,
    y: -440,
    connections: ['boss_eldritch_1', 'boss_destructive_play'],
    icon: '🎲'
  }
];

// Pre-defined node allocations for built-in strategies
export const PRESET_ALLOCATED_MAP: Record<string, string[]> = {
  // Essence Preset
  preset_essence: ['start_origin', 'map_sustain_2', 'scarab_drop_1', 'scarab_hub_1', 'essence_hub_1', 'essence_hub_2', 'essence_hub_3', 'essence_hub_4', 'essence_corrupted', 'ks_seventh_gate'],
  essence_tier_budget: ['start_origin', 'map_sustain_2', 'essence_hub_1', 'essence_hub_3', 'essence_corrupted'],
  essence_tier_mid: ['start_origin', 'map_sustain_2', 'scarab_hub_1', 'essence_hub_1', 'essence_hub_2', 'essence_hub_3', 'essence_hub_4', 'essence_corrupted', 'ks_seventh_gate'],
  essence_tier_high: ['start_origin', 'map_sustain_2', 'scarab_drop_1', 'scarab_hub_1', 'essence_hub_1', 'essence_hub_2', 'essence_hub_3', 'essence_hub_4', 'essence_corrupted', 'ks_seventh_gate', 'ks_twist_of_fate'],

  // Ambush Preset
  preset_ambush: ['start_origin', 'map_sustain_1', 'ambush_hub_1', 'ambush_hub_2', 'ambush_hub_3', 'ambush_hub_4', 'ambush_vault', 'ks_singular_focus'],
  ambush_tier_budget: ['start_origin', 'map_sustain_1', 'ambush_hub_1', 'ambush_hub_2', 'ks_singular_focus'],
  ambush_tier_mid: ['start_origin', 'map_sustain_1', 'ambush_hub_1', 'ambush_hub_2', 'ambush_hub_3', 'ambush_hub_4', 'ks_singular_focus'],
  ambush_tier_high: ['start_origin', 'map_sustain_1', 'scarab_drop_1', 'ambush_hub_1', 'ambush_hub_2', 'ambush_hub_3', 'ambush_hub_4', 'ambush_vault', 'ks_singular_focus', 'boss_eldritch_1'],

  // Harvest Preset
  preset_harvest: ['start_origin', 'map_sustain_1', 'harvest_hub_1', 'harvest_hub_2', 'ks_crop_rotation', 'boss_eldritch_1'],
  harvest_tier_budget: ['start_origin', 'map_sustain_1', 'harvest_hub_1', 'harvest_hub_2'],
  harvest_tier_mid: ['start_origin', 'map_sustain_1', 'harvest_hub_1', 'harvest_hub_2', 'ks_crop_rotation', 'boss_eldritch_1'],
  harvest_tier_high: ['start_origin', 'map_sustain_1', 'scarab_drop_1', 'harvest_hub_1', 'harvest_hub_2', 'ks_crop_rotation', 'boss_eldritch_1', 'boss_destructive_play'],

  // Expedition Preset
  preset_expedition: ['start_origin', 'map_sustain_3', 'scarab_drop_1', 'expedition_hub_1', 'expedition_hub_2', 'ks_extreme_arch'],
  expedition_tier_budget: ['start_origin', 'map_sustain_3', 'expedition_hub_1', 'ks_extreme_arch'],
  expedition_tier_mid: ['start_origin', 'map_sustain_3', 'scarab_drop_1', 'expedition_hub_1', 'expedition_hub_2', 'ks_extreme_arch'],
  expedition_tier_high: ['start_origin', 'map_sustain_3', 'scarab_drop_1', 'expedition_hub_1', 'expedition_hub_2', 'ks_extreme_arch', 'scarab_hub_1'],

  // Legion Preset
  preset_legion: ['start_origin', 'map_sustain_4', 'scarab_drop_1', 'scarab_hub_1', 'legion_hub_1', 'legion_hub_2', 'ks_unwavering_vision'],
  legion_tier_budget: ['start_origin', 'map_sustain_4', 'legion_hub_1', 'ks_unwavering_vision'],
  legion_tier_mid: ['start_origin', 'map_sustain_4', 'scarab_drop_1', 'legion_hub_1', 'legion_hub_2', 'ks_unwavering_vision'],
  legion_tier_high: ['start_origin', 'map_sustain_4', 'scarab_drop_1', 'scarab_hub_1', 'legion_hub_1', 'legion_hub_2', 'ks_unwavering_vision'],

  // Delirium & Boss Presets
  preset_delirium: ['start_origin', 'map_sustain_1', 'map_sustain_2', 'scarab_drop_1', 'boss_eldritch_1', 'ks_twist_of_fate'],
  preset_bossrush: ['start_origin', 'map_sustain_1', 'map_sustain_2', 'map_sustain_3', 'map_sustain_4', 'boss_eldritch_1', 'boss_destructive_play']
};
