import type { AtlasStrategy } from './types';

export interface BulkShoppingItem {
  name: string;
  nameEn?: string;
  category: string;
  singleRunCount: number;
  totalCount: number;
  unitPriceChaos: number;
  totalCostChaos: number;
}

export interface BulkShoppingList {
  totalRuns: number;
  totalMaps: number;
  scarabs: BulkShoppingItem[];
  totalCostChaos: number;
  totalCostDivine: number;
}

export const COMMUNITY_STRATEGIES: AtlasStrategy[] = [
  {
    id: 'community-legion-dunes',
    name: '軍團沙丘極速發家配置 (Legion Dunes Speed Farm)',
    category: 'legion',
    description: '沙丘地形開闊極易全清軍團，收益穩定高爆發，適合高速清圖流派。',
    tags: ['軍團', '速刷', '培育器', '五軍門票'],
    tiers: [{
      id: 'tier-1',
      name: '沙丘 4 甲蟲標準配置',
      recommendedMaps: ['沙丘 (Dunes)', '劇毒林地 (Toxic Sewer)'],
      coreKeystones: ['無盡渴望', '戰禍指引'],
      atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFABAA',
      mechanicNotes: '開啟軍團後優先擊殺軍團長與帶有通貨/甲蟲標誌怪物；打完立即拾取進下一張。',
      scarabs: [
        { id: 'sc-leg-1', name: '軍團聖甲蟲', nameEn: 'Legion Scarab', count: 2, customPriceChaos: 5 },
        { id: 'sc-leg-2', name: '將領軍團聖甲蟲', nameEn: 'Legion Scarab of Officers', count: 1, customPriceChaos: 15 },
        { id: 'sc-leg-3', name: '裂痕軍團聖甲蟲', nameEn: 'Legion Scarab of The Sekhema', count: 1, customPriceChaos: 25 }
      ],
      extraItems: []
    }],
    createdAt: 1725400000000,
    updatedAt: 1725400000000
  },
  {
    id: 'community-scarab-drop',
    name: '甲蟲狂歡極致掉落流 (Scarab Extravaganza)',
    category: 'scarab',
    description: '全點輿圖天賦甲蟲掉落機率，搭配魔法怪物與稀有怪群量，每場噴出大量高價甲蟲。',
    tags: ['甲蟲', '高利潤', '8詞綴', 'T16'],
    tiers: [{
      id: 'tier-1',
      name: '甲蟲群量拉滿版',
      recommendedMaps: ['幽閉墓穴 (Defiled Cathedral)', '要塞 (Citadel)'],
      coreKeystones: ['不屈之志', '命運扭曲'],
      atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFABAA',
      mechanicNotes: '務必打 8 詞綴已污染地圖，享受 +40% 以上怪物群量乘區加成。',
      scarabs: [
        { id: 'sc-adv-1', name: 'Adversaries 聖甲蟲', nameEn: 'Scarab of Adversaries', count: 2, customPriceChaos: 12 },
        { id: 'sc-adv-2', name: '追獵群眾聖甲蟲', nameEn: 'Scarab of Hunted Traitors', count: 2, customPriceChaos: 18 }
      ],
      extraItems: []
    }],
    createdAt: 1725400000000,
    updatedAt: 1725400000000
  },
  {
    id: 'community-expedition-blackscythe',
    name: '炸墳黑鐮日誌爆利流 (Expedition Logbook Farming)',
    category: 'expedition',
    description: '主打黑鐮傭兵團日誌與重骰通貨，丹尼格日誌可大量產出神聖石。',
    tags: ['炸墳', '探險', '日誌', '大宗通貨'],
    tiers: [{
      id: 'tier-1',
      name: '炸墳雙甲蟲小資版',
      recommendedMaps: ['濱海幽穴 (Atoll)', '熱帶島嶼 (Tropical Island)'],
      coreKeystones: ['遠古原住民', '堅定防線'],
      atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFABAA',
      mechanicNotes: '炸藥連線務必避開「免疫物理/混沌/元素」自身剋制詞綴；優先引爆黃色日誌殘骸。',
      scarabs: [
        { id: 'sc-exp-1', name: '探險聖甲蟲', nameEn: 'Expedition Scarab', count: 2, customPriceChaos: 8 },
        { id: 'sc-exp-2', name: '符文探險聖甲蟲', nameEn: 'Expedition Scarab of the Skiff', count: 1, customPriceChaos: 20 }
      ],
      extraItems: []
    }],
    createdAt: 1725400000000,
    updatedAt: 1725400000000
  },
  {
    id: 'community-harvest-crop',
    name: '莊園作物輪替命能倍增流 (Harvest Crop Rotation)',
    category: 'harvest',
    description: '利用「作物輪替」基石天賦，犧牲非目標顏色作物讓黃色命能階級最大化。',
    tags: ['莊園', '命能', '作物輪替', '高成本'],
    tiers: [{
      id: 'tier-1',
      name: '黃命能專精版',
      recommendedMaps: ['劇毒林地 (Toxic Sewer)', '長蟲泥地 (Carcass)'],
      coreKeystones: ['作物輪替 (Crop Rotation)', '心靈昇華'],
      atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFABAA',
      mechanicNotes: '先點藍/紫色一階作物觸發輪替升階，最後打黃色 3~4 階頭目。',
      scarabs: [
        { id: 'sc-har-1', name: '莊園聖甲蟲', nameEn: 'Harvest Scarab', count: 2, customPriceChaos: 15 },
        { id: 'sc-har-2', name: '增倍莊園聖甲蟲', nameEn: 'Harvest Scarab of Doubling', count: 1, customPriceChaos: 50 }
      ],
      extraItems: []
    }],
    createdAt: 1725400000000,
    updatedAt: 1725400000000
  },
  {
    id: 'community-ultimatum-catalyst',
    name: '通牒致命試煉催化劑金礦 (Ultimatum Goldmine)',
    category: 'ultimatum',
    description: '硬核肉盾流派首選，打滿 10 回合穩定產出肥沃催化劑、純淨之石與傳奇試煉。',
    tags: ['通牒', '催化劑', '攻堅防禦', '高回報'],
    tiers: [{
      id: 'tier-1',
      name: '滿輪通牒 4 甲蟲版',
      recommendedMaps: ['濱海幽穴 (Atoll)', '月影神殿 (Moon Temple)'],
      coreKeystones: ['無畏挑戰', '無盡試煉'],
      atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFABAA',
      mechanicNotes: '務必具備高額物理減傷與混沌滿抗，避開致盲/減冷卻/減回復選項。',
      scarabs: [
        { id: 'sc-ult-1', name: '通牒聖甲蟲', nameEn: 'Ultimatum Scarab', count: 2, customPriceChaos: 10 },
        { id: 'sc-ult-2', name: '催化通牒聖甲蟲', nameEn: 'Ultimatum Scarab of Catalysing', count: 2, customPriceChaos: 25 }
      ],
      extraItems: []
    }],
    createdAt: 1725400000000,
    updatedAt: 1725400000000
  }
];

export function calculateBulkShoppingList(
  strategy: AtlasStrategy,
  runs: number = 50,
  divineRate: number = 150
): BulkShoppingList {
  const safeRuns = Math.max(1, runs);
  const tier = strategy.tiers[0];
  const scarabs: BulkShoppingItem[] = (tier?.scarabs || []).map(s => {
    const single = s.count || 1;
    const total = single * safeRuns;
    const unitPrice = s.customPriceChaos || 0;
    return {
      name: s.name,
      nameEn: s.nameEn,
      category: 'Scarab',
      singleRunCount: single,
      totalCount: total,
      unitPriceChaos: unitPrice,
      totalCostChaos: Math.round(total * unitPrice * 10) / 10
    };
  });

  const totalScarabsCost = scarabs.reduce((sum, s) => sum + s.totalCostChaos, 0);
  const estimatedMapCost = safeRuns * 5; // ~5c per map base
  const totalCostChaos = Math.round((totalScarabsCost + estimatedMapCost) * 10) / 10;
  const safeDivRate = divineRate > 0 ? divineRate : 150;
  const totalCostDivine = Math.round((totalCostChaos / safeDivRate) * 10) / 10;

  return {
    totalRuns: safeRuns,
    totalMaps: safeRuns,
    scarabs,
    totalCostChaos,
    totalCostDivine
  };
}
