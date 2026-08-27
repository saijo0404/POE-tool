import type { AtlasNode } from '../types';

export const ATLAS_NODES_MECHANICS_2: AtlasNode[] = [
  // ==================== 6. 譫妄 (Delirium) ====================
  {
    id: 'delirium_small_1',
    numId: 1800,
    name: '譫妄機率 (Delirium Chance)',
    nameEn: 'Delirium Chance',
    type: 'small',
    category: 'delirium',
    description: '區域含有譫妄之鏡機率提升。',
    stats: ['譫妄之鏡出現機率 +15%'],
    x: 80,
    y: -180,
    connections: ['map_sustain_2', 'delirium_hub_1'],
    icon: '🔹'
  },
  {
    id: 'delirium_hub_1',
    numId: 1801,
    name: '墜入瘋狂 (Descent into Madness)',
    nameEn: 'Descent into Madness',
    type: 'notable',
    category: 'delirium',
    description: '譫妄霧氣擴散與星團珠寶掉落率提升。',
    stats: ['區域含有譫妄之鏡機率 +60%', '星團珠寶掉落率 +50%'],
    x: 120,
    y: -260,
    connections: ['delirium_small_1', 'map_sustain_2', 'delirium_hub_2', 'boss_eldritch_1'],
    icon: '🌫️'
  },
  {
    id: 'delirium_hub_2',
    numId: 1802,
    name: '無盡夢魘 (Unending Nightmare)',
    nameEn: 'Unending Nightmare',
    type: 'notable',
    category: 'delirium',
    description: '譫妄霧氣永遠不消散，但無法獲得計數層數獎勵。',
    stats: ['譫妄迷霧永遠不會消散', '地圖怪群規模 +20%', '無法手動終止迷霧'],
    x: 180,
    y: -380,
    connections: ['delirium_hub_1', 'ks_twist_of_fate', 'boss_eldritch_1'],
    icon: '🌫️'
  },

  // ==================== 7. 祭祀 (Ritual) ====================
  {
    id: 'ritual_small_1',
    numId: 1820,
    name: '祭祀機率 (Ritual Chance)',
    nameEn: 'Ritual Chance',
    type: 'small',
    category: 'ritual',
    description: '增加地圖內遭遇祭壇機率。',
    stats: ['區域含有祭祀神壇機率 +15%'],
    x: -80,
    y: 180,
    connections: ['map_sustain_3', 'ritual_hub_1'],
    icon: '🔹'
  },
  {
    id: 'ritual_hub_1',
    numId: 1821,
    name: '秘術奉獻 (Occult Devotion)',
    nameEn: 'Occult Devotion',
    type: 'notable',
    category: 'ritual',
    description: '祭祀貢品點數獲得量大幅增加。',
    stats: ['區域含有祭祀神壇機率 +60%', '擊殺祭祀怪物獲得貢品 +30%'],
    x: -120,
    y: 260,
    connections: ['ritual_small_1', 'map_sustain_3', 'ritual_hub_2', 'beyond_hub_1'],
    icon: '🩸'
  },
  {
    id: 'ritual_hub_2',
    numId: 1822,
    name: '不變教條 (Immutable Dogma)',
    nameEn: 'Immutable Dogma',
    type: 'notable',
    category: 'ritual',
    description: '無法重骰祭祀獎勵，但所有獎勵消耗貢品打折。',
    stats: ['祭祀獎勵費用降低 25%', '首輪獎勵品質大幅提升'],
    x: -180,
    y: 380,
    connections: ['ritual_hub_1', 'ks_stream_of_consciousness'],
    icon: '🩸'
  },

  // ==================== 8. 裂痕 (Breach) ====================
  {
    id: 'breach_small_1',
    numId: 1840,
    name: '裂痕機率 (Breach Chance)',
    nameEn: 'Breach Chance',
    type: 'small',
    category: 'breach',
    description: '區域含有裂痕遭遇機率提升。',
    stats: ['裂痕出現機率 +15%'],
    x: 80,
    y: 180,
    connections: ['map_sustain_4', 'breach_hub_1'],
    icon: '🔹'
  },
  {
    id: 'breach_hub_1',
    numId: 1841,
    name: '囊中之物 (Within Their Grasp)',
    nameEn: 'Within Their Grasp',
    type: 'notable',
    category: 'breach',
    description: '裂痕領主與裂痕石掉落升級。',
    stats: ['區域含有裂痕機率 +60%', '裂痕裂片 20% 機率複製', '首領掉落純淨裂痕石機率 +10%'],
    x: 120,
    y: 260,
    connections: ['breach_small_1', 'map_sustain_4', 'breach_hub_2', 'beyond_hub_1'],
    icon: '🌀'
  },
  {
    id: 'breach_hub_2',
    numId: 1842,
    name: '閃電裂痕 (Flash Breach)',
    nameEn: 'Flash Breach',
    type: 'notable',
    category: 'breach',
    description: '裂痕開啟與擴散速度加快，怪物密集度激增。',
    stats: ['裂痕開啟與關閉速度 +50%', '裂痕怪群密度 +30%'],
    x: 180,
    y: 380,
    connections: ['breach_hub_1', 'ks_stream_of_consciousness'],
    icon: '🌀'
  },

  // ==================== 9. 超越 (Beyond) ====================
  {
    id: 'beyond_hub_1',
    numId: 1861,
    name: '無盡潮汐 (Endless Tide)',
    nameEn: 'Endless Tide',
    type: 'notable',
    category: 'beyond',
    description: '超越怪物生成間隔縮短，量產受污染通貨。',
    stats: ['區域含有超越惡魔機率 +50%', '超越怪物掉落受污染通貨機率 +30%'],
    x: 0,
    y: 280,
    connections: ['scarab_drop_1', 'ritual_hub_1', 'breach_hub_1', 'ks_stream_of_consciousness'],
    icon: '🌌'
  },

  // ==================== 10. 枯萎 (Blight) ====================
  {
    id: 'blight_hub_1',
    numId: 1881,
    name: '枯萎蔓延 (Epidemiology)',
    nameEn: 'Epidemiology',
    type: 'notable',
    category: 'blight',
    description: '枯萎遭遇獎勵寶箱數量與油瓶掉落等級提升。',
    stats: ['區域含有枯萎遭遇機率 +50%', '枯萎寶箱有機率包含額外油瓶與地圖'],
    x: -300,
    y: 80,
    connections: ['map_sustain_3', 'expedition_hub_1'],
    icon: '🍄'
  },

  // ==================== 11. 苦痛與野性 (Torment & Bestiary) ====================
  {
    id: 'torment_hub_1',
    numId: 1891,
    name: '幽靈附身 (Seance)',
    nameEn: 'Seance',
    type: 'notable',
    category: 'torment',
    description: '地圖內稀有怪物有機率開場即被罪孽之魂附身，大幅提升掉寶！',
    stats: ['地圖首領與金怪被罪孽之魂附身機率 +40%', '附身怪物物品數量 +50%'],
    x: 300,
    y: 80,
    connections: ['map_sustain_4', 'legion_hub_1'],
    icon: '👻'
  }
];
