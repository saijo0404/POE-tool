import { createContext } from 'react';
import type {
  ParsedItem,
  ParsedItemMod,
  TradeSearchResult,
  WealthSnapshot,
  BuildCostResult,
  TradeStatusOption,
  WealthFilterState
} from '../types/poe';

export type { WealthFilterState };

export interface PriceCheckerCacheState {
  rawText: string;
  parsedItem: ParsedItem | null;
  mods: ParsedItemMod[];
  tradeStatus: TradeStatusOption;
  sortBy: 'price_asc' | 'price_desc' | 'indexed_desc';
  linksMin?: number;
  corruptedFilter?: boolean;
  itemLevelMin?: number;
  tradeResults: TradeSearchResult | null;
}

export interface BuildCalculatorCacheState {
  ninjaUrl: string;
  buildResult: BuildCostResult | null;
  activeCategoryTab: 'all' | 'equipment' | 'gems' | 'flasks' | 'jewels';
}


export interface AppStateContextType {
  // Price Checker Cache
  priceCheckerState: PriceCheckerCacheState;
  setPriceCheckerState: React.Dispatch<React.SetStateAction<PriceCheckerCacheState>>;
  updatePriceCheckerState: (partial: Partial<PriceCheckerCacheState>) => void;

  // Build Calculator Cache
  buildCalculatorState: BuildCalculatorCacheState;
  setBuildCalculatorState: React.Dispatch<React.SetStateAction<BuildCalculatorCacheState>>;
  updateBuildCalculatorState: (partial: Partial<BuildCalculatorCacheState>) => void;

  // Wealth Filter & Cache State
  wealthFilterState: WealthFilterState;
  setWealthFilterState: React.Dispatch<React.SetStateAction<WealthFilterState>>;
  updateWealthFilterState: (partial: Partial<WealthFilterState>) => void;
  cachedSnapshots: WealthSnapshot[];
  setCachedSnapshots: React.Dispatch<React.SetStateAction<WealthSnapshot[]>>;
}

export const defaultPriceCheckerState: PriceCheckerCacheState = {
  rawText: '',
  parsedItem: null,
  mods: [],
  tradeStatus: 'instant',
  sortBy: 'price_asc',
  linksMin: undefined,
  corruptedFilter: undefined,
  itemLevelMin: undefined,
  tradeResults: null
};

export const defaultBuildCalculatorState: BuildCalculatorCacheState = {
  ninjaUrl: '',
  buildResult: null,
  activeCategoryTab: 'all'
};

export const defaultWealthFilterState: WealthFilterState = {
  minValueChaos: 0,
  ignoredTabNames: [],
  selectedCategory: 'ALL',
  bulkMultiplier: 1.0
};

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export default AppStateContext;
