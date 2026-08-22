export interface AppSettings {
  league: string;
  poesessid: string;
  accountName: string;
  autoSnapshotEnabled: boolean;
  autoSnapshotIntervalMinutes: number;
  useDemoData: boolean;
  poetoken?: string;
  cf_clearance?: string;
  userAgent?: string;
  hotkey?: string;
  selectedStashTabs?: number[];
  maxStashTabs?: number;
}

export interface StashTabMeta {
  i: number;
  id: string;
  n: string;
  type: string;
  color?: { r: number; g: number; b: number };
  src?: string;
  folder?: boolean;
}

export interface ParsedItemMod {
  id: string;
  text: string;
  englishText: string;
  type: 'implicit' | 'explicit' | 'fractured' | 'crafted' | 'pseudo';
  value?: number;
  minValue?: number;
  maxValue?: number;
  enabled: boolean;
}

export interface ParsedItem {
  name: string;
  baseType: string;
  rarity: 'Normal' | 'Magic' | 'Rare' | 'Unique' | 'Currency' | 'Gem';
  itemClass?: string;
  itemLevel?: number;
  quality?: number;
  corrupted?: boolean;
  sockets?: string;
  language: 'zh' | 'en';
  implicits: ParsedItemMod[];
  explicits: ParsedItemMod[];
  rawText: string;
}

export interface TradeQueryFilter {
  statId: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export interface TradeQueryRequest {
  league?: string;
  tradeStatus?: 'instant' | 'securable' | 'any_buyout' | 'onlineleague' | 'online' | 'any';
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
  sort?: { price?: 'asc' | 'desc'; indexed?: 'asc' | 'desc' };
  fetchOffset?: number;
  searchId?: string;
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
  item: {
    name: string;
    typeLine: string;
    icon: string;
    ilvl?: number;
    corrupted?: boolean;
    implicitMods?: string[];
    explicitMods?: string[];
  };
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
  estimatedPrice?: any;
  listings: TradeListing[];
}

export interface StashItem {
  id: string;
  name: string;
  typeLine: string;
  icon: string;
  stackSize?: number;
  tabName: string;
  category: 'Currency' | 'Fragment' | 'DivCard' | 'Essence' | 'Scarab' | 'Map' | 'Equipment';
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
