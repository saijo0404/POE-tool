import type { ScarabItem, ScarabStockStrategy } from './scarabTypes';

export const DEFAULT_SCARABS: ScarabItem[] = [
  { id: 'scarab_ambush_normal', nameZh: '伏擊聖甲蟲', nameEn: 'Ambush Scarab', category: '伏擊', unitCostChaos: 12 },
  { id: 'scarab_ambush_hidden', nameZh: '隱匿伏擊聖甲蟲', nameEn: 'Ambush Scarab of Hidden Compartments', category: '伏擊', unitCostChaos: 28 },
  { id: 'scarab_divination_plenty', nameZh: '豐裕命運聖甲蟲', nameEn: 'Divination Scarab of Plenty', category: '命運卡', unitCostChaos: 35 },
  { id: 'scarab_divination_curation', nameZh: '精選命運聖甲蟲', nameEn: 'Divination Scarab of Curation', category: '命運卡', unitCostChaos: 90 },
  { id: 'scarab_cartography_duplication', nameZh: '複製製圖聖甲蟲', nameEn: 'Cartography Scarab of Duplication', category: '製圖', unitCostChaos: 18 },
  { id: 'scarab_legion_officers', nameZh: '軍官軍團聖甲蟲', nameEn: 'Legion Scarab of Officers', category: '軍團', unitCostChaos: 22 },
  { id: 'scarab_harvest_doubling', nameZh: '加倍收割聖甲蟲', nameEn: 'Harvest Scarab of Doubling', category: '收割', unitCostChaos: 65 }
];

export const PRESET_SCARAB_STRATEGIES: ScarabStockStrategy[] = [
  {
    id: 'strat_ambush_50',
    name: '50 場伏擊保險箱策略',
    targetMapRuns: 50,
    requirements: [
      { scarabId: 'scarab_ambush_normal', quantityPerMap: 2 },
      { scarabId: 'scarab_ambush_hidden', quantityPerMap: 1 },
      { scarabId: 'scarab_divination_plenty', quantityPerMap: 1 }
    ]
  },
  {
    id: 'strat_harvest_30',
    name: '30 場莊園命運種植策略',
    targetMapRuns: 30,
    requirements: [
      { scarabId: 'scarab_harvest_doubling', quantityPerMap: 2 },
      { scarabId: 'scarab_cartography_duplication', quantityPerMap: 1 }
    ]
  }
];
