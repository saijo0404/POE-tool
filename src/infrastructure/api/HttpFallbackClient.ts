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
  async sendOfficialWhisper(token: string, league?: string): Promise<{ success: boolean; message?: string }> {
    return this.safePost<{ success: boolean; message?: string }>('/api/trade/whisper', { token, league }, undefined);
  }
  async travelToHideout(payload: TravelToHideoutPayload): Promise<TravelToHideoutResult> {
    return this.safePost<TravelToHideoutResult>('/api/trade/travel', payload, undefined);
  }
  async fetchBuildItemLivePrice(league: string, queryJson: string): Promise<TradeSearchResult> {
    return this.safePost<TradeSearchResult>('/api/trade/search-raw', { league, queryJson }, undefined);
  }
  async createTradeSearchUrl(league: string, queryJson: string): Promise<string> {
    const url = queryJson && queryJson !== '{}'
      ? `https://www.pathofexile.com/trade/search/${encodeURIComponent(league)}?q=${encodeURIComponent(queryJson)}`
      : `https://www.pathofexile.com/trade/search/${encodeURIComponent(league)}`;
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
    return url;
  }
  async openExternalUrl(url: string): Promise<void> {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  }
  async openAtlasTreeWindow(url: string, _title?: string): Promise<void> {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  }
  async getNinjaPrices(league?: string, refresh?: boolean): Promise<NinjaPricesResult> {
    return this.safeGet<NinjaPricesResult>('/api/ninja/prices', { params: { league, refresh: refresh ? 'true' : undefined } });
  }
  async calculateBuild(ninjaUrl: string): Promise<BuildCostResult> {
    return this.safePost<BuildCostResult>('/api/build-calculator', { ninjaUrl }, undefined);
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
}

