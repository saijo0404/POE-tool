import type { PopularExtraItemDef } from './types';

export const POPULAR_EXTRA_ITEMS: PopularExtraItemDef[] = [
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

  // Map Bases (Tier based - no layout names)
  { name: 'T16 地圖 (Tier 16 Map)', nameEn: 'Tier 16 Map', category: 'map', defaultPriceChaos: 4 },
  { name: 'T17 地圖 (Tier 17 Map)', nameEn: 'Tier 17 Map', category: 'map', defaultPriceChaos: 65 },
  { name: 'T16 8詞已污染地圖 (8-Mod Corrupted)', nameEn: 'Tier 16 8-Mod Corrupted Map', category: 'map', defaultPriceChaos: 10 },
  { name: 'T15 地圖 (Tier 15 Map)', nameEn: 'Tier 15 Map', category: 'map', defaultPriceChaos: 3 },
  { name: 'T14 地圖 (Tier 14 Map)', nameEn: 'Tier 14 Map', category: 'map', defaultPriceChaos: 2 },
  { name: 'T1-T13 地圖 (Low/Mid Tier Map)', nameEn: 'Tier 1-13 Map', category: 'map', defaultPriceChaos: 1 },

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
