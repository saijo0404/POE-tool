import type { PrecursorTabletDefinition, BiomeDefinition, PoE2BiomeType } from './towerBiomeTypes';

export const PRECURSOR_TABLETS: readonly PrecursorTabletDefinition[] = [
  {
    id: 'gold_bounty',
    nameZh: '黃金賞金碑牌',
    nameEn: 'Gold Bounty Tablet',
    category: 'economic',
    descriptionZh: '大幅提高區域怪物掉落金幣量，並提高少量基礎物品掉落數量。',
    descriptionEn: 'Substantially increases gold dropped by monsters in affected areas.',
    bonuses: { goldMultiplier: 1.8, quantity: 15 }
  },
  {
    id: 'monster_pack',
    nameZh: '群落增幅碑牌',
    nameEn: 'Monster Pack Tablet',
    category: 'density',
    descriptionZh: '顯著增加地圖怪物群落大小與魔法怪物稀有度。',
    descriptionEn: 'Increases monster pack size and magic monster rarity in affected areas.',
    bonuses: { packSize: 25, rarity: 20 }
  },
  {
    id: 'waystone_surveyor',
    nameZh: '銘刻勘探碑牌',
    nameEn: 'Waystone Surveyor Tablet',
    category: 'progression',
    descriptionZh: '提高銘刻地圖掉落機率與升階期望值，終局推圖拓荒必備。',
    descriptionEn: 'Grants high additional Waystone drop chance and tier advancement.',
    bonuses: { waystoneChance: 35, packSize: 10 }
  },
  {
    id: 'runic_essence',
    nameZh: '符文精粹碑牌',
    nameEn: 'Runic Essence Tablet',
    category: 'progression',
    descriptionZh: '提升區域中各類符文的掉落機率，並提高高等大符文出現權重。',
    descriptionEn: 'Significantly increases rune drops and weighting for greater runes.',
    bonuses: { runeChance: 40, rarity: 25 }
  },
  {
    id: 'boss_empower',
    nameZh: '首領強化碑牌',
    nameEn: 'Boss Empower Tablet',
    category: 'boss',
    descriptionZh: '地圖首領掉落量倍增，並提供額外高階通貨與專屬傳奇掉落加成。',
    descriptionEn: 'Empowers map bosses with double drop rates and high-tier currency.',
    bonuses: { bossLootMultiplier: 2.0, quantity: 20 }
  },
  {
    id: 'breach_tablet',
    nameZh: '裂痕先祖碑牌',
    nameEn: 'Breach Tablet',
    category: 'endgame_mechanic',
    descriptionZh: '區域必定產生裂痕遭遇，並提高裂痕怪物密度與裂片數量。',
    descriptionEn: 'Guarantees Breach encounters with increased monster density and splinters.',
    bonuses: { mechanicType: 'Breach', mechanicChance: 50, packSize: 15 }
  },
  {
    id: 'delirium_tablet',
    nameZh: '譫妄狂亂碑牌',
    nameEn: 'Delirium Tablet',
    category: 'endgame_mechanic',
    descriptionZh: '使地圖籠罩在譫妄灰霧中，大幅提升物品掉落數量與狂亂怪物收益。',
    descriptionEn: 'Covers the area in Delirium fog, greatly boosting quantity and rewards.',
    bonuses: { mechanicType: 'Delirium', mechanicChance: 50, quantity: 20 }
  },
  {
    id: 'ritual_tablet',
    nameZh: '血祭祭壇碑牌',
    nameEn: 'Ritual Tablet',
    category: 'endgame_mechanic',
    descriptionZh: '區域內產生多座血祭祭壇，提升貢品點數與金幣收益。',
    descriptionEn: 'Spawns sacrificial Altars, boosting tribute points and gold revenue.',
    bonuses: { mechanicType: 'Ritual', mechanicChance: 50, goldMultiplier: 1.3 }
  },
  {
    id: 'expedition_tablet',
    nameZh: '先祖探險碑牌',
    nameEn: 'Expedition Tablet',
    category: 'endgame_mechanic',
    descriptionZh: '生成卡爾葛先祖探險遺址，提高日誌掉落率與符文怪物數量。',
    descriptionEn: 'Spawns Kalguuran Expedition sites with bonus logbooks and runic monsters.',
    bonuses: { mechanicType: 'Expedition', mechanicChance: 50, runeChance: 25 }
  }
];

export const POE2_BIOMES: Record<PoE2BiomeType, BiomeDefinition> = {
  desert: {
    id: 'desert',
    nameZh: '荒漠乾燥生態 (Desert Biome)',
    nameEn: 'Desert Wasteland',
    descriptionZh: '廣袤沙丘與廢墟，原生金幣產量極高，Faustus 大宗交易所最偏好之區域。',
    descriptionEn: 'Arid dunes rich in raw gold deposits and ancient relics.',
    inherentBonusDescZh: '金幣基礎掉落量 +40%，聖甲蟲與大宗通貨掉落率提升',
    bestGoals: ['gold', 'currency'],
    nativeMultiplier: { gold: 1.4, waystones: 1.0, runes: 1.05, currency: 1.25, packSize: 1.05 },
    recommendedTierRange: [1, 16]
  },
  jungle: {
    id: 'jungle',
    nameZh: '繁茂密林生態 (Jungle Biome)',
    nameEn: 'Verdant Jungle',
    descriptionZh: '藤蔓密布的高密度林地，怪物密集度冠絕終局，極佳經驗值與群怪收益區。',
    descriptionEn: 'Dense vegetation supporting extreme monster pack densities.',
    inherentBonusDescZh: '原生怪物密度與群落大小 +30%，掉落物品數量 +15%',
    bestGoals: ['gold', 'mechanics'],
    nativeMultiplier: { gold: 1.25, waystones: 1.1, runes: 1.0, currency: 1.15, packSize: 1.3 },
    recommendedTierRange: [5, 16]
  },
  tundra: {
    id: 'tundra',
    nameZh: '凍原冰川生態 (Tundra Biome)',
    nameEn: 'Frozen Tundra',
    descriptionZh: '冰霜元素生物盤踞的極地凍原，為終局高階銘刻地圖產出的核心源頭。',
    descriptionEn: 'Sub-zero wastes offering superior Waystone progression drop rates.',
    inherentBonusDescZh: '銘刻地圖 (Waystone) 掉落率 +35%，掉落地圖高機率提升 +1 階級',
    bestGoals: ['waystones'],
    nativeMultiplier: { gold: 1.0, waystones: 1.35, runes: 1.1, currency: 1.0, packSize: 1.1 },
    recommendedTierRange: [8, 16]
  },
  volcanic: {
    id: 'volcanic',
    nameZh: '熔岩火山生態 (Volcanic Biome)',
    nameEn: 'Volcanic Caldera',
    descriptionZh: '流淌熔岩的烈焰地脈，富含各類高階裝備鑲嵌符文與未切割技能寶石。',
    descriptionEn: 'Molten crags rich in runic ores and uncut skill gem crystallizations.',
    inherentBonusDescZh: '符文 (Rune) 掉落率 +35%，未切割寶石與稀有裝備掉落率提升',
    bestGoals: ['runes', 'currency'],
    nativeMultiplier: { gold: 1.05, waystones: 1.05, runes: 1.35, currency: 1.2, packSize: 1.1 },
    recommendedTierRange: [6, 16]
  },
  ruins: {
    id: 'ruins',
    nameZh: '古代遺跡生態 (Ancient Ruins)',
    nameEn: 'Ancient Ruins',
    descriptionZh: '遠古文明宮殿與陵墓，聚集強大的傳奇守衛首領與高階通貨寶箱。',
    descriptionEn: 'Collapsed temples harboring empowered ancient bosses and divine treasures.',
    inherentBonusDescZh: '地圖首領掉落加成 +30%，神聖石與崇高石等高階通貨權重顯著提升',
    bestGoals: ['currency', 'boss'],
    nativeMultiplier: { gold: 1.1, waystones: 1.2, runes: 1.15, currency: 1.35, packSize: 1.0 },
    recommendedTierRange: [10, 16]
  },
  swamp: {
    id: 'swamp',
    nameZh: '腐化沼澤生態 (Corrupted Swamp)',
    nameEn: 'Fetid Mire',
    descriptionZh: '受腐化侵蝕的劇毒泥沼，怪物帶有混沌詞綴，深淵與裂痕等遭遇生成倍增。',
    descriptionEn: 'Toxic marshlands festering with chaotic corruption and rifts.',
    inherentBonusDescZh: '稀有怪物群落 +20%，終局機制 (Breach / Delirium / Ritual) 效益 +25%',
    bestGoals: ['mechanics', 'currency'],
    nativeMultiplier: { gold: 1.15, waystones: 1.1, runes: 1.2, currency: 1.25, packSize: 1.2 },
    recommendedTierRange: [7, 16]
  }
};

export function getTabletById(id: string): PrecursorTabletDefinition | undefined {
  return PRECURSOR_TABLETS.find(t => t.id === id);
}

export function getBiomeById(id: PoE2BiomeType): BiomeDefinition | undefined {
  return POE2_BIOMES[id];
}
