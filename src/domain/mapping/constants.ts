import type { MapInvestment, MappingTimerState } from './types';

export interface InvestmentPreset {
  id: string;
  name: string;
  description: string;
  investment: Omit<MapInvestment, 'totalCostChaos' | 'totalCostDivine'>;
}

export const DEFAULT_MAP_INVESTMENT: MapInvestment = {
  mapCostChaos: 5,
  scarabsCostChaos: 20,
  craftCostChaos: 4,
  otherCostChaos: 0,
  totalCostChaos: 29,
  totalCostDivine: 0.19
};

export const DEFAULT_MAPPING_TIMER_STATE: MappingTimerState = {
  status: 'idle',
  currentRunNumber: 1,
  elapsedSeconds: 0,
  startTimestamp: null
};

export const INVESTMENT_PRESETS: readonly InvestmentPreset[] = [
  {
    id: 'alch-and-go',
    name: '點金速刷 (Alch & Go)',
    description: '基礎 T16 地圖 + 點金釘子 + 基礎工藝',
    investment: {
      mapCostChaos: 3,
      scarabsCostChaos: 0,
      craftCostChaos: 2,
      otherCostChaos: 1
    }
  },
  {
    id: 'scarab-ambush',
    name: '保險箱強襲 (Ambush / Strongbox)',
    description: '包含 4 顆保險箱系列聖甲蟲 + 制高點工藝',
    investment: {
      mapCostChaos: 5,
      scarabsCostChaos: 35,
      craftCostChaos: 6,
      otherCostChaos: 2
    }
  },
  {
    id: 'harvest-crop',
    name: '莊稼豐收 (Harvest Juice Farming)',
    description: '雙倍莊稼聖甲蟲 + 覺醒莊稼 + 量產聖甲蟲',
    investment: {
      mapCostChaos: 5,
      scarabsCostChaos: 50,
      craftCostChaos: 12,
      otherCostChaos: 5
    }
  },
  {
    id: 'legion-dunes',
    name: '軍團大軍 (Legion Dunes Farming)',
    description: '軍團軍官 + 軍團徽印甲蟲 + 地圖工藝',
    investment: {
      mapCostChaos: 5,
      scarabsCostChaos: 30,
      craftCostChaos: 6,
      otherCostChaos: 3
    }
  },
  {
    id: 't17-juiced',
    name: 'T17 頂配深淵/命運卡 (T17 Juiced)',
    description: 'T17 地圖本體 + 高價專用甲蟲組合 + 瓦爾詞綴',
    investment: {
      mapCostChaos: 120,
      scarabsCostChaos: 160,
      craftCostChaos: 15,
      otherCostChaos: 20
    }
  }
];
