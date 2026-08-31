import type {
  AppSettings,
  CharacterInfo,
  ConnectionTestResult,
  LoginAuthResult,
  AuthStatusResult,
  SessionHealthInfo
} from '../../domain/settings/types';
import type { ParsedItem } from '../../domain/item/types';
import type {
  TradeQueryRequest,
  TradeSearchResult,
  TravelToHideoutPayload,
  TravelToHideoutResult
} from '../../domain/trade/types';
import type {
  WealthSnapshot,
  StashTabMeta,
  StashProgress
} from '../../domain/wealth/types';
import type {
  BuildCostResult,
  NinjaPricesResult
} from '../../domain/build/types';

export interface IPoeApiClient {
  // Settings & Auth
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  getCharacters(): Promise<CharacterInfo[]>;
  testConnection(params: { poesessid?: string; accountName?: string }): Promise<ConnectionTestResult>;
  loginAuth(): Promise<LoginAuthResult>;
  logoutAuth(): Promise<{ success: boolean }>;
  getAuthStatus(): Promise<AuthStatusResult>;
  checkSessionHealth(force?: boolean): Promise<SessionHealthInfo>;
  getSessionHealth(): Promise<SessionHealthInfo>;

  // Clipboard
  getLatestClipboard(): Promise<{ text: string | null; timestamp: number }>;
  readClipboard(): Promise<{ text: string; isPoeItem: boolean }>;

  // Item & Trade
  parseItem(itemText: string): Promise<ParsedItem>;
  searchTrade(payload: TradeQueryRequest): Promise<TradeSearchResult>;
  sendOfficialWhisper(token: string, league?: string): Promise<{ success: boolean; message?: string }>;
  travelToHideout(payload: TravelToHideoutPayload): Promise<TravelToHideoutResult>;
  fetchBuildItemLivePrice(league: string, queryJson: string): Promise<TradeSearchResult>;
  createTradeSearchUrl(league: string, queryJson: string): Promise<string>;
  openExternalUrl(url: string): Promise<void>;
  openAtlasTreeWindow(url: string, title?: string): Promise<void>;

  // Ninja & Build Calculator
  getNinjaPrices(league?: string, refresh?: boolean): Promise<NinjaPricesResult>;
  calculateBuild(ninjaUrl: string): Promise<BuildCostResult>;

  // Wealth Snapshots & Stash
  getWealthSnapshots(): Promise<WealthSnapshot[]>;
  getStashTabs(league?: string): Promise<StashTabMeta[]>;
  takeWealthSnapshot(): Promise<WealthSnapshot>;
  clearWealthSnapshots(): Promise<{ success: boolean }>;
  getWealthProgress(): Promise<StashProgress>;

  // Logger
  getLogContents(lines?: number): Promise<string>;
  getLogFilePath(): Promise<string>;
}
