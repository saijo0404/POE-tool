import type { ParsedItem, ParsedItemMod } from '../item/types';

export type TradeStatusOption = 'instant' | 'securable' | 'any_buyout' | 'onlineleague' | 'online' | 'any';

export interface TradeQueryFilter {
  statId: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export interface TradeSortConfig {
  price?: 'asc' | 'desc';
  indexed?: 'asc' | 'desc';
}

export interface TradeQueryRequest {
  league?: string;
  tradeStatus?: TradeStatusOption;
  rarity?: string;
  baseType?: string;
  name?: string;
  itemLevelMin?: number;
  linksMin?: number;
  corrupted?: boolean;
  filters?: TradeQueryFilter[];
  selectedMods?: ParsedItemMod[];
  item?: ParsedItem;
  poesessid?: string;
  sort?: TradeSortConfig;
  fetchOffset?: number;
  searchId?: string;
}

export interface TradeItemDetails {
  name: string;
  typeLine: string;
  icon: string;
  ilvl?: number;
  corrupted?: boolean;
  implicitMods?: string[];
  explicitMods?: string[];
}

export interface TradeListing {
  id: string;
  indexed: string;
  indexedAge?: string;
  accountName?: string;
  sellerAccount?: string;
  characterName?: string;
  sellerIgn?: string;
  onlineStatus: string;
  isInstant?: boolean;
  priceAmount: number;
  priceCurrency: string;
  priceInChaos: number;
  priceInDivine: number;
  whisper: string;
  whisperToken?: string;
  hideoutToken?: string;
  isInstantBuyout?: boolean;
  method?: string;
  item: TradeItemDetails;
}

export interface EstimatedPriceSummary {
  minChaos: number;
  minDivine: number;
  medianChaos: number;
  medianDivine: number;
  sampleCount: number;
}

export interface TradeSearchResult {
  id: string;
  searchId?: string;
  tradeUrl?: string;
  searchUrl?: string;
  total: number;
  estimatedMinPriceChaos: number;
  estimatedMinPriceDivine: number;
  estimatedMedianPriceChaos: number;
  estimatedMedianPriceDivine: number;
  estimatedPrice?: EstimatedPriceSummary;
  listings: TradeListing[];
}

export interface TravelToHideoutPayload {
  token?: string;
  characterName?: string;
  league?: string;
  searchId?: string;
  itemId?: string;
}

export interface TravelToHideoutResult {
  success: boolean;
  gameTriggered?: boolean;
  officialWhisperSent?: boolean;
  hideoutCmd?: string;
  message?: string;
}
