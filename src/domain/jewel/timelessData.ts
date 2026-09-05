import type { TimelessJewelDef } from './types';

export const TIMELESS_JEWELS: TimelessJewelDef[] = [
  {
    id: 'glorious_vanity',
    name: 'Glorious Vanity',
    nameZh: '輝煌的虛榮 (瓦爾)',
    factionsZh: '瓦爾歷史學家',
    minSeed: 100,
    maxSeed: 8000,
    leaders: [
      { id: 'doryani', name: 'Doryani', nameZh: '多里亞尼 (Doryani)', keystoneName: 'Corrupted Soul', keystoneNameZh: '腐化靈魂', keystoneDescriptionZh: '獲得相當於最大生命 15% 的額外能量護盾；50% 非混沌傷害穿透護盾直接扣生命', popularityScore: 92, synergyBuilds: ['血盾混和 (Hybrid)', '自施法術', 'COC 暴擊冰刺'], ratingTier: 'S', basePriceRangeChaos: [120, 350] },
      { id: 'xibaqua', name: 'Xibaqua', nameZh: '西巴誇 (Xibaqua)', keystoneName: 'Divine Flesh', keystoneNameZh: '神聖血肉', keystoneDescriptionZh: '所有傷害穿透護盾；50% 承受元素傷害轉化為混沌傷害；最大混沌抗性 +5%', popularityScore: 95, synergyBuilds: ['高混抗坦系', '正義之火 (RF)', '毒雨/腐蝕箭'], ratingTier: 'S', basePriceRangeChaos: [180, 450] },
      { id: 'zerphi', name: 'Zerphi', nameZh: '澤菲 (Zerphi)', keystoneName: 'Eternal Youth', keystoneNameZh: '永恆青春', keystoneDescriptionZh: '生命充能由能量護盾充能取代；受到傷害時生命充能中斷 5 秒', popularityScore: 50, synergyBuilds: ['特化生命充能流', '特定陷阱拓荒'], ratingTier: 'C', basePriceRangeChaos: [30, 80] }
    ]
  },
  {
    id: 'lethal_pride',
    name: 'Lethal Pride',
    nameZh: '致命的驕傲 (卡魯)',
    factionsZh: '卡魯勇士',
    minSeed: 10000,
    maxSeed: 18000,
    leaders: [
      { id: 'rakiata', name: 'Rakiata', nameZh: '拉基亞塔 (Rakiata)', keystoneName: 'Tempered by War', keystoneNameZh: '戰爭淬鍊', keystoneDescriptionZh: '50% 承受冰冷與閃電傷害轉化為火焰傷害；冰冷與閃電抗性 -50%', popularityScore: 88, synergyBuilds: ['百抗昇華轉火', '馬哈霍特盾流派', '酋長純火坦'], ratingTier: 'A', basePriceRangeChaos: [90, 260] },
      { id: 'akoya', name: 'Akoya', nameZh: '阿科亞 (Akoya)', keystoneName: 'Chainbreaker', keystoneNameZh: '斷鐐者', keystoneDescriptionZh: '魔力回復轉為怒氣回復；使用技能消耗怒氣', popularityScore: 75, synergyBuilds: ['怒氣圖騰', '戰吼旋風斬'], ratingTier: 'B', basePriceRangeChaos: [50, 150] },
      { id: 'kaom', name: 'Kaom', nameZh: '岡姆 (Kaom)', keystoneName: 'Strength of Blood', keystoneNameZh: '鮮血力量', keystoneDescriptionZh: '無法從生命偷取回復；每 1% 最大生命每秒偷取提供 2% 承受傷害額外減免', popularityScore: 70, synergyBuilds: ['處刑偷取減傷流', '冠軍純物打擊'], ratingTier: 'B', basePriceRangeChaos: [40, 120] }
    ]
  },
  {
    id: 'brutal_restraint',
    name: 'Brutal Restraint',
    nameZh: '殘暴的克制 (馬拉克斯)',
    factionsZh: '馬拉克斯游俠',
    minSeed: 500,
    maxSeed: 8000,
    leaders: [
      { id: 'balbala', name: 'Balbala', nameZh: '巴爾巴拉 (Balbala)', keystoneName: 'The Traitor', keystoneNameZh: '背叛者', keystoneDescriptionZh: '每個空的藥劑欄位每 5 秒獲得 4 點藥劑充能', popularityScore: 90, synergyBuilds: ['永久藥劑流派', '爆破尋寶打寶員 (MF)', '追獵常駐三相'], ratingTier: 'S', basePriceRangeChaos: [100, 300] },
      { id: 'asenath', name: 'Asenath', nameZh: '阿賽納斯 (Asenath)', keystoneName: 'Dance with Death', keystoneNameZh: '與死共舞', keystoneDescriptionZh: '無法使用頭盔且無法閃避；暴擊率與敵人對你的傷害均幸運', popularityScore: 68, synergyBuilds: ['極限暴擊弓箭手', '純玻璃大砲打寶'], ratingTier: 'B', basePriceRangeChaos: [40, 110] },
      { id: 'nasima', name: 'Nasima', nameZh: '納西瑪 (Nasima)', keystoneName: 'Second Sight', keystoneNameZh: '次級視覺', keystoneDescriptionZh: '常駐失明狀態；具有 25% 更多近戰暴擊率', popularityScore: 60, synergyBuilds: ['近戰無視命中流', '衛士暴擊流'], ratingTier: 'C', basePriceRangeChaos: [30, 90] }
    ]
  },
  {
    id: 'militant_faith',
    name: 'Militant Faith',
    nameZh: '激進的信仰 (聖宗)',
    factionsZh: '聖堂武僧高等神官',
    minSeed: 2000,
    maxSeed: 10000,
    leaders: [
      { id: 'dominus', name: 'Dominus', nameZh: '神主 (Dominus)', keystoneName: 'Inner Conviction', keystoneNameZh: '內心信念', keystoneDescriptionZh: '每顆暴擊球提供 3% 更多法術傷害；狂怒球轉換為暴擊球', popularityScore: 94, synergyBuilds: ['滿暴法術流', '秘術師/聖宗法杖', '烙印/電火花'], ratingTier: 'S', basePriceRangeChaos: [150, 420] },
      { id: 'maxarius', name: 'Maxarius', nameZh: '馬克薩留斯 (Maxarius)', keystoneName: 'Transcendence', keystoneNameZh: '超凡入聖', keystoneDescriptionZh: '護甲同時適用於所有元素傷害減免；最大元素抗性 -15%', popularityScore: 89, synergyBuilds: ['極限高護甲百抗流', '勇士超凡百萬防禦'], ratingTier: 'A', basePriceRangeChaos: [100, 280] },
      { id: 'venarius', name: 'Venarius', nameZh: '維納利斯 (Venarius)', keystoneName: 'Power of Purpose', keystoneNameZh: '目標力量', keystoneDescriptionZh: '無法保留魔力；80% 未保留魔力轉化為護甲值', popularityScore: 62, synergyBuilds: ['大法師魔力轉甲', '純魔力堆疊流'], ratingTier: 'C', basePriceRangeChaos: [35, 95] }
    ]
  },
  {
    id: 'elegant_hubris',
    name: 'Elegant Hubris',
    nameZh: '優雅的狂妄 (永恆帝國)',
    factionsZh: '永恆帝國貴族',
    minSeed: 2000,
    maxSeed: 160000,
    leaders: [
      { id: 'caspiro', name: 'Caspiro', nameZh: '卡斯皮羅 (Caspiro)', keystoneName: 'Supreme Ostentation', keystoneNameZh: '至高炫耀', keystoneDescriptionZh: '無視裝備與寶石的所有屬性需求；自身屬性不再提供任何固有加成', popularityScore: 85, synergyBuilds: ['無屬性要求特化', '三項深淵珠寶流', '魔改法杖'], ratingTier: 'A', basePriceRangeChaos: [80, 240] },
      { id: 'cadiro', name: 'Cadiro', nameZh: '卡迪羅 (Cadiro)', keystoneName: 'Supreme Decadence', keystoneNameZh: '至高腐化', keystoneDescriptionZh: '生命藥劑回復量同時套用於能量護盾', popularityScore: 72, synergyBuilds: ['純 ES 藥劑流', '痛苦靈魂流'], ratingTier: 'B', basePriceRangeChaos: [45, 130] },
      { id: 'victario', name: 'Victario', nameZh: '維克塔利奧 (Victario)', keystoneName: 'Supreme Grandeur', keystoneNameZh: '至高宏偉', keystoneDescriptionZh: '範圍內的小型天賦不提供屬性，中型天賦獲得倍數增幅', popularityScore: 65, synergyBuilds: ['軍團特化中型節點', '天賦洗點特化'], ratingTier: 'C', basePriceRangeChaos: [35, 100] }
    ]
  }
];
