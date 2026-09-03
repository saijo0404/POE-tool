import type { CraftBaseItem, ItemClass } from './types';

export const ITEM_CLASSES: { id: ItemClass; name: string; nameZh: string }[] = [
  { id: 'body_armour', name: 'Body Armour', nameZh: '身體護甲' },
  { id: 'helmet', name: 'Helmet', nameZh: '頭盔' },
  { id: 'gloves', name: 'Gloves', nameZh: '手套' },
  { id: 'boots', name: 'Boots', nameZh: '靴子' },
  { id: 'weapon_2h_bow', name: 'Bow', nameZh: '弓' },
  { id: 'weapon_1h', name: 'One-Hand Weapon', nameZh: '單手武器/法杖' },
  { id: 'shield', name: 'Shield', nameZh: '盾牌' },
  { id: 'ring', name: 'Ring', nameZh: '戒指' },
  { id: 'amulet', name: 'Amulet', nameZh: '護身符' },
  { id: 'belt', name: 'Belt', nameZh: '腰帶' },
];

export const CRAFT_BASES: CraftBaseItem[] = [
  // Body Armour
  { id: 'sadist_garb', name: 'Sadist Garb', nameZh: '哀傷皮甲', itemClass: 'body_armour', defaultIlvl: 86, attributeType: 'dex_int', evasion: 512, energyShield: 105 },
  { id: 'astral_plate', name: 'Astral Plate', nameZh: '星辰皮甲', itemClass: 'body_armour', defaultIlvl: 86, attributeType: 'str', armour: 780, implicit: '+12% 全部元素抗性' },
  { id: 'vaal_regalia', name: 'Vaal Regalia', nameZh: '瓦爾法衣', itemClass: 'body_armour', defaultIlvl: 86, attributeType: 'int', energyShield: 180 },
  { id: 'assassins_garb', name: "Assassin's Garb", nameZh: '刺客皮甲', itemClass: 'body_armour', defaultIlvl: 86, attributeType: 'dex', evasion: 750, implicit: '3% 增加移動速度' },
  { id: 'conquest_lamellar', name: 'Conquest Lamellar', nameZh: '征服者重鎧', itemClass: 'body_armour', defaultIlvl: 86, attributeType: 'str_dex', armour: 450, evasion: 450 },

  // Helmet
  { id: 'bone_helmet', name: 'Bone Helmet', nameZh: '骨質頭盔', itemClass: 'helmet', defaultIlvl: 84, attributeType: 'str_int', implicit: '召喚物造成 20% 增加傷害' },
  { id: 'hubris_circlet', name: 'Hubris Circlet', nameZh: '狂妄之冠', itemClass: 'helmet', defaultIlvl: 84, attributeType: 'int', energyShield: 100 },
  { id: 'royal_burgonet', name: 'Royal Burgonet', nameZh: '皇家輕盔', itemClass: 'helmet', defaultIlvl: 84, attributeType: 'str', armour: 420 },
  { id: 'lion_pelt', name: 'Lion Pelt', nameZh: '獅首盔', itemClass: 'helmet', defaultIlvl: 84, attributeType: 'dex', evasion: 480 },

  // Gloves
  { id: 'fingerless_silk_gloves', name: 'Fingerless Silk Gloves', nameZh: '咒者手套', itemClass: 'gloves', defaultIlvl: 85, attributeType: 'int', implicit: '16% 增加法術傷害' },
  { id: 'gripped_gloves', name: 'Gripped Gloves', nameZh: '扣環手套', itemClass: 'gloves', defaultIlvl: 85, attributeType: 'dex', implicit: '18% 增加投射物傷害' },
  { id: 'spiked_gloves', name: 'Spiked Gloves', nameZh: '尖刺手套', itemClass: 'gloves', defaultIlvl: 85, attributeType: 'str', implicit: '20% 增加近戰傷害' },
  { id: 'stealth_gloves', name: 'Stealth Gloves', nameZh: '靈巧手套', itemClass: 'gloves', defaultIlvl: 84, attributeType: 'dex', evasion: 280 },

  // Boots
  { id: 'two_toned_boots', name: 'Two-Toned Boots', nameZh: '雙色鞋 (火/冰)', itemClass: 'boots', defaultIlvl: 86, attributeType: 'str_int', implicit: '+12% 火焰與冰冷抗性' },
  { id: 'sorcerer_boots', name: 'Sorcerer Boots', nameZh: '術士長靴', itemClass: 'boots', defaultIlvl: 86, attributeType: 'int', energyShield: 65 },
  { id: 'titan_greaves', name: 'Titan Greaves', nameZh: '泰坦長靴', itemClass: 'boots', defaultIlvl: 86, attributeType: 'str', armour: 300 },
  { id: 'slink_boots', name: 'Slink Boots', nameZh: '伏擊長靴', itemClass: 'boots', defaultIlvl: 86, attributeType: 'dex', evasion: 320 },

  // Bow
  { id: 'spine_bow', name: 'Spine Bow', nameZh: '脊骨弓', itemClass: 'weapon_2h_bow', defaultIlvl: 86, attributeType: 'dex' },
  { id: 'crude_bow', name: 'Crude Bow', nameZh: '粗製弓', itemClass: 'weapon_2h_bow', defaultIlvl: 75, attributeType: 'dex' },
  { id: 'imperial_bow', name: 'Imperial Bow', nameZh: '帝國弓', itemClass: 'weapon_2h_bow', defaultIlvl: 85, attributeType: 'dex' },

  // Weapon 1H
  { id: 'profane_wand', name: 'Profane Wand', nameZh: '狂靈法杖', itemClass: 'weapon_1h', defaultIlvl: 84, attributeType: 'int', implicit: '14% 增加施法速度' },
  { id: 'convoking_wand', name: 'Convoking Wand', nameZh: '召集法杖', itemClass: 'weapon_1h', defaultIlvl: 84, attributeType: 'int', implicit: '可出現召喚物詞綴' },
  { id: 'imperial_claw', name: 'Imperial Claw', nameZh: '帝國之爪', itemClass: 'weapon_1h', defaultIlvl: 83, attributeType: 'dex_int', implicit: '擊中回復 +46 生命' },
  { id: 'rune_dagger', name: 'Demon Dagger', nameZh: '惡魔匕首', itemClass: 'weapon_1h', defaultIlvl: 84, attributeType: 'dex_int', implicit: '40% 增加全域暴擊率' },

  // Shield
  { id: 'pinnacle_tower_shield', name: 'Pinnacle Tower Shield', nameZh: '聖記圓盾', itemClass: 'shield', defaultIlvl: 84, attributeType: 'str', implicit: '+30 最大生命' },
  { id: 'titanium_spirit_shield', name: 'Titanium Spirit Shield', nameZh: '巨人魔盾', itemClass: 'shield', defaultIlvl: 84, attributeType: 'int', energyShield: 80 },

  // Ring
  { id: 'amethyst_ring', name: 'Amethyst Ring', nameZh: '紫晶戒指', itemClass: 'ring', defaultIlvl: 84, attributeType: 'none', implicit: '+23% 混沌抗性' },
  { id: 'vermillion_ring', name: 'Vermillion Ring', nameZh: '朱砂戒指', itemClass: 'ring', defaultIlvl: 84, attributeType: 'none', implicit: '7% 增加最大生命' },
  { id: 'two_stone_ring', name: 'Two-Stone Ring', nameZh: '雙玉戒指', itemClass: 'ring', defaultIlvl: 84, attributeType: 'none', implicit: '+16% 火焰與閃電抗性' },

  // Amulet
  { id: 'onyx_amulet', name: 'Onyx Amulet', nameZh: '瑪瑙護身符', itemClass: 'amulet', defaultIlvl: 84, attributeType: 'none', implicit: '+16 全部屬性' },
  { id: 'turquoise_amulet', name: 'Turquoise Amulet', nameZh: '青玉護身符', itemClass: 'amulet', defaultIlvl: 84, attributeType: 'none', implicit: '+30 敏捷與智慧' },

  // Belt
  { id: 'stygian_vise', name: 'Stygian Vise', nameZh: '深淵腰帶', itemClass: 'belt', defaultIlvl: 86, attributeType: 'none', implicit: '具有 1 個深淵插槽' },
  { id: 'crystal_belt', name: 'Crystal Belt', nameZh: '水晶腰帶', itemClass: 'belt', defaultIlvl: 85, attributeType: 'none', implicit: '+80 最大能量護盾' },
];
