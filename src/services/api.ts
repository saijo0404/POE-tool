import { ApiClientFactory } from '../infrastructure/api/ApiClientFactory';
import type {
  AppSettings,
  CharacterInfo,
  ConnectionTestResult,
  LoginAuthResult,
  AuthStatusResult,
  SessionHealthInfo
} from '../domain/settings/types';
import type { ParsedItem } from '../domain/item/types';
import type { GameEngine } from '../domain/engine/types';
import type {
  TradeLeagueEntry,
  TradeQueryRequest,
  TradeSearchResult,
  TravelToHideoutPayload,
  TravelToHideoutResult
} from '../domain/trade/types';
import type {
  WealthSnapshot,
  StashTabMeta,
  StashProgress
} from '../domain/wealth/types';
import type {
  BuildCostResult,
  NinjaPricesResult
} from '../domain/build/types';
import type { FaustusMarketOverview } from '../domain/exchange/types';

export const poeApi = {
  // Settings & Auth
  getSettings: (): Promise<AppSettings> => ApiClientFactory.getClient().getSettings(),
  updateSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ApiClientFactory.getClient().updateSettings(settings),
  getCharacters: (): Promise<CharacterInfo[]> => ApiClientFactory.getClient().getCharacters(),
  testConnection: (params: { poesessid?: string; accountName?: string }): Promise<ConnectionTestResult> =>
    ApiClientFactory.getClient().testConnection(params),
  loginAuth: (): Promise<LoginAuthResult> => ApiClientFactory.getClient().loginAuth(),
  logoutAuth: (): Promise<{ success: boolean }> => ApiClientFactory.getClient().logoutAuth(),
  getAuthStatus: (): Promise<AuthStatusResult> => ApiClientFactory.getClient().getAuthStatus(),
  checkSessionHealth: (force?: boolean): Promise<SessionHealthInfo> =>
    ApiClientFactory.getClient().checkSessionHealth(force),
  getSessionHealth: (): Promise<SessionHealthInfo> =>
    ApiClientFactory.getClient().getSessionHealth(),

  // Clipboard
  getLatestClipboard: (): Promise<{ text: string | null; timestamp: number }> =>
    ApiClientFactory.getClient().getLatestClipboard(),
  readClipboard: (): Promise<{ text: string; isPoeItem: boolean }> =>
    ApiClientFactory.getClient().readClipboard(),

  // Item & Trade
  parseItem: (itemText: string): Promise<ParsedItem> =>
    ApiClientFactory.getClient().parseItem(itemText),
  searchTrade: (payload: TradeQueryRequest): Promise<TradeSearchResult> =>
    ApiClientFactory.getClient().searchTrade(payload),
  getTradeLeagues: (engine?: GameEngine): Promise<TradeLeagueEntry[]> =>
    ApiClientFactory.getClient().getTradeLeagues(engine),
  sendOfficialWhisper: (token: string, league?: string, engine?: GameEngine): Promise<{ success: boolean; message?: string }> =>
    ApiClientFactory.getClient().sendOfficialWhisper(token, league, engine),
  travelToHideout: (payload: TravelToHideoutPayload): Promise<TravelToHideoutResult> =>
    ApiClientFactory.getClient().travelToHideout(payload),
  fetchBuildItemLivePrice: (league: string, queryJson: string, engine?: GameEngine): Promise<TradeSearchResult> =>
    ApiClientFactory.getClient().fetchBuildItemLivePrice(league, queryJson, engine),
  createTradeSearchUrl: (league: string, queryJson: string, engine?: GameEngine): Promise<string> =>
    ApiClientFactory.getClient().createTradeSearchUrl(league, queryJson, engine),
  openExternalUrl: (url: string): Promise<void> =>
    ApiClientFactory.getClient().openExternalUrl(url),
  openAtlasTreeWindow: (url: string, title?: string): Promise<void> =>
    ApiClientFactory.getClient().openAtlasTreeWindow(url, title),
  triggerInGameCommand: (command: string): Promise<boolean> =>
    ApiClientFactory.getClient().triggerInGameCommand(command),

  // Ninja & Build Calculator & Faustus Exchange
  getNinjaPrices: (league?: string, refresh?: boolean): Promise<NinjaPricesResult> =>
    ApiClientFactory.getClient().getNinjaPrices(league, refresh),
  calculateBuild: (ninjaUrl: string): Promise<BuildCostResult> =>
    ApiClientFactory.getClient().calculateBuild(ninjaUrl),
  getFaustusExchangeOverview: (league?: string, refresh?: boolean): Promise<FaustusMarketOverview> =>
    ApiClientFactory.getClient().getFaustusExchangeOverview(league, refresh),

  // Wealth Snapshots & Stash
  getWealthSnapshots: (): Promise<WealthSnapshot[]> =>
    ApiClientFactory.getClient().getWealthSnapshots(),
  getStashTabs: (league?: string): Promise<StashTabMeta[]> =>
    ApiClientFactory.getClient().getStashTabs(league),
  takeWealthSnapshot: (): Promise<WealthSnapshot> =>
    ApiClientFactory.getClient().takeWealthSnapshot(),
  clearWealthSnapshots: (): Promise<{ success: boolean }> =>
    ApiClientFactory.getClient().clearWealthSnapshots(),
  getWealthProgress: (): Promise<StashProgress> =>
    ApiClientFactory.getClient().getWealthProgress(),

  // Overlay
  getCursorPosition: (): Promise<{ x: number; y: number }> =>
    ApiClientFactory.getClient().getCursorPosition(),
  showOverlayWindow: (x?: number, y?: number, itemText?: string): Promise<void> =>
    ApiClientFactory.getClient().showOverlayWindow(x, y, itemText),
  hideOverlayWindow: (): Promise<void> =>
    ApiClientFactory.getClient().hideOverlayWindow(),
  setOverlayClickThrough: (enable: boolean): Promise<void> =>
    ApiClientFactory.getClient().setOverlayClickThrough(enable),
  getPendingOverlayItem: (): Promise<string | null> =>
    ApiClientFactory.getClient().getPendingOverlayItem(),

  // Logger
  getLogContents: (lines?: number): Promise<string> =>
    ApiClientFactory.getClient().getLogContents(lines),
  getLogFilePath: (): Promise<string> =>
    ApiClientFactory.getClient().getLogFilePath()
};

export default poeApi;

