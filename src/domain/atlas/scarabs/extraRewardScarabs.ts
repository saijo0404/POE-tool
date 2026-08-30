import type { ScarabDef } from './types';

export const EXTRA_REWARD_SCARABS: ScarabDef[] = [
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
  }
];
