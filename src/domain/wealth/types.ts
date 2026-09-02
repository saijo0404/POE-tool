export interface StashTabMeta {
  i: number;
  id: string;
  n: string;
  type: string;
  color?: { r: number; g: number; b: number };
  src?: string;
  folder?: boolean;
}

export type StashItemCategory =
  | 'Currency'
  | 'Fragment'
  | 'DivCard'
  | 'Essence'
  | 'Scarab'
  | 'Map'
  | 'Equipment';

export interface StashItem {
  id: string;
  name: string;
  typeLine: string;
  icon: string;
  stackSize?: number;
  tabName: string;
  category: StashItemCategory;
  unitPriceChaos: number;
  totalPriceChaos: number;
  unitPriceDivine: number;
  totalPriceDivine: number;
}

export interface StashTabSummary {
  tabName: string;
  category?: string;
  totalChaos?: number;
  totalDivine?: number;
  totalValueChaos: number;
  totalValueDivine: number;
  itemCount: number;
}

export interface WealthSnapshot {
  timestamp: string;
  league: string;
  totalChaos: number;
  totalDivine: number;
  chaosRate: number;
  hourlyChangeChaos?: number;
  hourlyChangeDivine?: number;
  tabSummaries: StashTabSummary[];
  topItems: StashItem[];
  allItems?: StashItem[];
}

export interface StashProgress {
  active: boolean;
  currentTab: number;
  totalTabs: number;
  currentTabName: string;
  stage: string;
}

export interface WealthFilterState {
  minValueChaos: number;
  ignoredTabNames: string[];
  selectedCategory: string;
  bulkMultiplier?: number;
}

export interface FilteredWealthData {
  totalChaos: number;
  totalDivine: number;
  tabSummaries: StashTabSummary[];
  topItems: StashItem[];
  allItems: StashItem[];
  bulkMultiplier: number;
}


