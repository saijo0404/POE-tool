import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { IPoeApiClient } from '../../application/ports/IPoeApiClient';
import type {
  AppSettings, CharacterInfo, ConnectionTestResult, LoginAuthResult, AuthStatusResult,
  SessionHealthInfo,
  ParsedItem, TradeQueryRequest, TradeSearchResult, TravelToHideoutPayload,
  TravelToHideoutResult, NinjaPricesResult, BuildCostResult, WealthSnapshot,
  StashTabMeta, StashProgress
} from '../../types/poe';
import type { DiagnosticBundle } from '../../domain/logger/types';

export class HttpFallbackClient implements IPoeApiClient {
  private async safeGet<T>(url: string, options?: AxiosRequestConfig, fallback?: T): Promise<T> {
    try {
      const res = await axios.get<T>(url, options);
      return res.data;
    } catch {
      if (fallback !== undefined) return fallback;
      throw new Error(`HTTP GET failed: ${url}`);
    }
  }

  private async safePost<T>(url: string, data?: unknown, options?: AxiosRequestConfig, fallback?: T): Promise<T> {
    try {
      const res = await axios.post<T>(url, data, options);
      return res.data;
    } catch {
      if (fallback !== undefined) return fallback;
      throw new Error(`HTTP POST failed: ${url}`);
    }
  }

  async getSettings(): Promise<AppSettings> { return this.safeGet<AppSettings>('/api/settings'); }
  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> { return this.safePost<AppSettings>('/api/settings', settings, undefined); }
  async getCharacters(): Promise<CharacterInfo[]> {
    const res = await this.safeGet<CharacterInfo[]>('/api/characters', undefined, []);
    return Array.isArray(res) ? res : [];
  }
  async testConnection(params: { poesessid?: string; accountName?: string }): Promise<ConnectionTestResult> {
    return this.safePost<ConnectionTestResult>('/api/auth/test-connection', params, undefined);
  }
  async loginAuth(): Promise<LoginAuthResult> { return this.safePost<LoginAuthResult>('/api/auth/login'); }
  async logoutAuth(): Promise<{ success: boolean }> { return this.safePost<{ success: boolean }>('/api/auth/logout'); }
  async getAuthStatus(): Promise<AuthStatusResult> {
    return this.safeGet<AuthStatusResult>('/api/auth/status', undefined, { loggedIn: false, accountName: '' });
  }
  async checkSessionHealth(_force?: boolean): Promise<SessionHealthInfo> {
    return {
      state: 'valid',
      message: 'Web 模擬環境連線正常',
      accountName: 'DemoExile',
      lastCheckedEpochMs: Date.now(),
      hasPoesessid: true,
      hasCfClearance: true
    };
  }
  async getSessionHealth(): Promise<SessionHealthInfo> {
    return {
      state: 'valid',
      message: 'Web 模擬環境連線正常',
      accountName: 'DemoExile',
      lastCheckedEpochMs: Date.now(),
      hasPoesessid: true,
      hasCfClearance: true
    };
  }
  async getLatestClipboard(): Promise<{ text: string | null; timestamp: number }> {
    return this.safeGet<{ text: string | null; timestamp: number }>('/api/clipboard/latest', undefined, { text: null, timestamp: 0 });
  }
  async readClipboard(): Promise<{ text: string; isPoeItem: boolean }> {
    return this.safePost<{ text: string; isPoeItem: boolean }>('/api/clipboard/read', undefined, undefined, { text: '', isPoeItem: false });
  }
  async parseItem(itemText: string): Promise<ParsedItem> { return this.safePost<ParsedItem>('/api/parse-item', { itemText }, undefined); }
  async searchTrade(payload: TradeQueryRequest): Promise<TradeSearchResult> { return this.safePost<TradeSearchResult>('/api/trade/search', payload, undefined); }
  async getTradeLeagues(engine?: import('../../domain/engine/types').GameEngine): Promise<import('../../domain/trade/types').TradeLeagueEntry[]> {
    const { getDefaultTradeLeagues } = await import('../../domain/trade/engineTradeConfig');
    const fallback = getDefaultTradeLeagues(engine || 'poe1');
    return this.safeGet<import('../../domain/trade/types').TradeLeagueEntry[]>('/api/trade/leagues', { params: { engine } }, fallback);
  }
  async sendOfficialWhisper(token: string, league?: string, engine?: import('../../domain/engine/types').GameEngine): Promise<{ success: boolean; message?: string }> {
    return this.safePost<{ success: boolean; message?: string }>('/api/trade/whisper', { token, league, engine }, undefined);
  }
  async travelToHideout(payload: TravelToHideoutPayload): Promise<TravelToHideoutResult> {
    return this.safePost<TravelToHideoutResult>('/api/trade/travel', payload, undefined);
  }
  async fetchBuildItemLivePrice(league: string, queryJson: string, engine?: import('../../domain/engine/types').GameEngine): Promise<TradeSearchResult> {
    return this.safePost<TradeSearchResult>('/api/trade/search-raw', { league, queryJson, engine }, undefined);
  }
  async createTradeSearchUrl(league: string, queryJson: string, engine?: import('../../domain/engine/types').GameEngine): Promise<string> {
    const { buildTradeSearchUrl } = await import('../../domain/trade/engineTradeConfig');
    const url = buildTradeSearchUrl({
      engine: engine || 'poe1',
      league,
      queryJson
    });
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
    return url;
  }
  async openExternalUrl(url: string): Promise<void> {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  }
  async openAtlasTreeWindow(url: string, _title?: string): Promise<void> {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  }
  async triggerInGameCommand(command: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(command);
    }
    return false;
  }
  async getNinjaPrices(league?: string, refresh?: boolean): Promise<NinjaPricesResult> {
    return this.safeGet<NinjaPricesResult>('/api/ninja/prices', { params: { league, refresh: refresh ? 'true' : undefined } });
  }
  async calculateBuild(ninjaUrl: string): Promise<BuildCostResult> {
    return this.safePost<BuildCostResult>('/api/build-calculator', { ninjaUrl }, undefined);
  }
  async getFaustusExchangeOverview(league?: string, refresh?: boolean): Promise<import('../../domain/exchange/types').FaustusMarketOverview> {
    const { createDefaultExchangeOverview } = await import('../../domain/exchange/defaultOverview');
    const fallback = createDefaultExchangeOverview(league || 'Settlers');
    return this.safeGet<import('../../domain/exchange/types').FaustusMarketOverview>(
      '/api/exchange/overview',
      { params: { league, refresh: refresh ? 'true' : undefined } },
      fallback
    );
  }

  async getWealthSnapshots(): Promise<WealthSnapshot[]> {
    const res = await this.safeGet<WealthSnapshot[]>('/api/wealth/snapshots', undefined, []);
    return Array.isArray(res) ? res : [];
  }
  async getStashTabs(league?: string): Promise<StashTabMeta[]> {
    const res = await this.safeGet<StashTabMeta[]>('/api/wealth/stash-tabs', { params: { league } }, []);
    return Array.isArray(res) ? res : [];
  }
  async takeWealthSnapshot(): Promise<WealthSnapshot> { return this.safePost<WealthSnapshot>('/api/wealth/snapshot'); }
  async clearWealthSnapshots(): Promise<{ success: boolean }> { return this.safePost<{ success: boolean }>('/api/wealth/clear'); }
  async getWealthProgress(): Promise<StashProgress> {
    const fallback: StashProgress = { active: false, currentTab: 0, totalTabs: 0, currentTabName: '', stage: 'idle' };
    return this.safeGet<StashProgress>('/api/wealth/progress', undefined, fallback);
  }
  async getCursorPosition(): Promise<{ x: number; y: number }> {
    return { x: 100, y: 100 };
  }
  async showOverlayWindow(_x?: number, _y?: number, _itemText?: string): Promise<void> {}
  async hideOverlayWindow(): Promise<void> {}
  async setOverlayClickThrough(_enable: boolean): Promise<void> {}
  async getPendingOverlayItem(): Promise<string | null> { return Promise.resolve(null); }
  async getLogContents(_lines?: number): Promise<string> { return ''; }
  async getLogFilePath(): Promise<string> { return ''; }
  async writeLogEntry(_level: string, _message: string, _context?: string): Promise<void> {}
  async clearLogs(): Promise<{ success: boolean }> { return { success: true }; }
  async getDiagnosticBundle(): Promise<DiagnosticBundle> {
    return {
      app_version: 'web-fallback',
      os: 'browser',
      timestamp: new Date().toISOString(),
      log_file_path: 'browser-fallback',
      log_file_size_bytes: 0,
      total_lines: 0,
      recent_logs: '',
    };
  }
  async openLogDirectory(): Promise<{ success: boolean }> { return { success: false }; }
}

