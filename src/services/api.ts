import axios from 'axios';
import type { AppSettings, WealthSnapshot, TradeQueryRequest, TradeSearchResult, ParsedItem, StashProgress, StashTabMeta } from '../types/poe';

// Helper to detect if running inside Tauri 2.0 desktop webview
const isTauri = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__);
};

// Dynamically import Tauri invoke only when in Tauri environment
const tauriInvoke = async <T>(cmd: string, args?: Record<string, any>): Promise<T> => {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(cmd, args);
};

axios.defaults.timeout = 2000;

// Universal HTTP client for browser / mock tests fallback
const safeGet = async <T = any>(url: string, config?: any, fallback?: T): Promise<{ data: T }> => {
  try {
    if (typeof axios.get === 'function') {
      const res = await axios.get<T>(url, config);
      return res && res.data !== undefined ? res : { data: (fallback !== undefined ? fallback : {} as T) };
    }
  } catch (err: any) {
    if (fallback !== undefined) {
      return { data: fallback };
    }
    throw err;
  }
  return { data: (fallback !== undefined ? fallback : {} as T) };
};

const safePost = async <T = any>(url: string, data?: any, config?: any, fallback?: T): Promise<{ data: T }> => {
  try {
    if (typeof axios.post === 'function') {
      const res = await axios.post<T>(url, data, config);
      return res && res.data !== undefined ? res : { data: (fallback !== undefined ? fallback : {} as T) };
    }
  } catch (err: any) {
    if (fallback !== undefined) {
      return { data: fallback };
    }
    throw err;
  }
  return { data: (fallback !== undefined ? fallback : {} as T) };
};

export const poeApi = {
  // Settings
  getSettings: async (): Promise<AppSettings> => {
    if (isTauri()) {
      return tauriInvoke<AppSettings>('get_settings');
    }
    return safeGet<AppSettings>('/api/settings').then(res => res?.data);
  },

  updateSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    if (isTauri()) {
      return tauriInvoke<AppSettings>('update_settings', { settings });
    }
    return safePost<AppSettings>('/api/settings', settings).then(res => res?.data);
  },

  // Characters
  getCharacters: async (): Promise<any[]> => {
    if (isTauri()) {
      return tauriInvoke<any[]>('get_characters').then(res => (Array.isArray(res) ? res : []));
    }
    return safeGet<any[]>('/api/characters', undefined, []).then(res => (Array.isArray(res?.data) ? res.data : []));
  },

  // Clipboard
  getLatestClipboard: async (): Promise<{ text: string | null; timestamp: number }> => {
    if (isTauri()) {
      return tauriInvoke<{ text: string | null; timestamp: number }>('get_latest_clipboard');
    }
    return safeGet<{ text: string | null; timestamp: number }>('/api/clipboard/latest', undefined, { text: null, timestamp: 0 }).then(res => res?.data);
  },

  readClipboard: async (): Promise<{ text: string; isPoeItem: boolean }> => {
    if (isTauri()) {
      return tauriInvoke<{ text: string; isPoeItem: boolean }>('read_clipboard');
    }
    return safePost<{ text: string; isPoeItem: boolean }>('/api/clipboard/read', undefined, undefined, { text: '', isPoeItem: false }).then(res => res?.data);
  },

  // Item parsing & Trade
  parseItem: async (itemText: string): Promise<ParsedItem> => {
    console.log('[poeApi] 📥 parseItem called. isTauri =', isTauri(), 'itemText length =', itemText?.length);
    if (isTauri()) {
      const res = await tauriInvoke<ParsedItem>('parse_item', { itemText });
      console.log('[poeApi] 📤 parseItem Tauri result:', res);
      return res;
    }
    const res = await safePost<ParsedItem>('/api/parse-item', { itemText });
    console.log('[poeApi] 📤 parseItem HTTP result:', res?.data);
    return res?.data;
  },

  searchTrade: async (payload: TradeQueryRequest): Promise<TradeSearchResult> => {
    console.log('[poeApi] 🔍 searchTrade called. isTauri =', isTauri(), 'payload:', payload);
    if (isTauri()) {
      const res = await tauriInvoke<TradeSearchResult>('search_trade', { request: payload });
      console.log('[poeApi] 📦 searchTrade Tauri response total =', res?.total, 'listings count =', res?.listings?.length);
      return res;
    }
    const res = await safePost<TradeSearchResult>('/api/trade/search', payload);
    console.log('[poeApi] 📦 searchTrade HTTP response:', res?.data);
    return res?.data;
  },

  sendOfficialWhisper: async (token: string, league?: string): Promise<{ success: boolean; message?: string }> => {
    if (isTauri()) {
      return tauriInvoke<string>('send_official_whisper', { token, league })
        .then(msg => ({ success: true, message: msg }))
        .catch(err => ({ success: false, message: String(err) }));
    }
    return safePost<{ success: boolean; message?: string }>('/api/trade/whisper', { token, league }).then(res => res?.data);
  },

  travelToHideout: async (payload: { token?: string; characterName?: string; league?: string; searchId?: string; itemId?: string }) => {
    if (isTauri()) {
      return tauriInvoke<{ success: boolean; gameTriggered: boolean; officialWhisperSent: boolean; hideoutCmd: string; message: string }>(
        'travel_to_hideout',
        { token: payload.token, characterName: payload.characterName, league: payload.league }
      );
    }
    return safePost<{ success: boolean; gameTriggered?: boolean; officialWhisperSent?: boolean; hideoutCmd?: string; message?: string }>('/api/trade/travel', payload).then(res => res?.data);
  },

  // Ninja Prices & Build Calculator
  getNinjaPrices: async (league?: string, refresh?: boolean) => {
    if (isTauri()) {
      return tauriInvoke<{ rates: any; divineChaosRate: number; league: string }>('get_ninja_prices', { league, refresh });
    }
    return safeGet<{ rates: any; divineChaosRate: number; league: string }>('/api/ninja/prices', { params: { league, refresh: refresh ? 'true' : undefined } }).then(res => res?.data);
  },

  calculateBuild: async (ninjaUrl: string) => {
    if (isTauri()) {
      return tauriInvoke<any>('calculate_build', { ninjaUrl });
    }
    return safePost<any>('/api/build-calculator', { ninjaUrl }).then(res => res?.data);
  },

  fetchBuildItemLivePrice: async (league: string, queryJson: string): Promise<TradeSearchResult> => {
    if (isTauri()) {
      return tauriInvoke<TradeSearchResult>('fetch_build_item_live_price', { league, queryJson });
    }
    return safePost<TradeSearchResult>('/api/trade/search-raw', { league, queryJson }).then(res => res?.data);
  },

  createTradeSearchUrl: async (league: string, queryJson: string): Promise<string> => {
    if (isTauri()) {
      return tauriInvoke<string>('create_trade_search_url', { league, queryJson });
    }
    return `https://www.pathofexile.com/trade/search/${encodeURIComponent(league)}`;
  },

  openExternalUrl: async (url: string) => {
    if (isTauri()) {
      return tauriInvoke<void>('open_external_url', { url });
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  // Wealth Snapshots & Progress & Stash Tabs
  getWealthSnapshots: async (): Promise<WealthSnapshot[]> => {
    if (isTauri()) {
      return tauriInvoke<WealthSnapshot[]>('get_wealth_snapshots').then(res => (Array.isArray(res) ? res : []));
    }
    return safeGet<WealthSnapshot[]>('/api/wealth/snapshots', undefined, []).then(res => (Array.isArray(res?.data) ? res.data : []));
  },

  getStashTabs: async (league?: string): Promise<StashTabMeta[]> => {
    if (isTauri()) {
      return tauriInvoke<StashTabMeta[]>('get_stash_tabs', { league }).then(res => (Array.isArray(res) ? res : []));
    }
    return safeGet<StashTabMeta[]>('/api/wealth/stash-tabs', { params: { league } }, []).then(res => (Array.isArray(res?.data) ? res.data : []));
  },

  takeWealthSnapshot: async (): Promise<WealthSnapshot> => {
    if (isTauri()) {
      return tauriInvoke<WealthSnapshot>('take_wealth_snapshot');
    }
    return safePost<WealthSnapshot>('/api/wealth/snapshot').then(res => res?.data);
  },

  clearWealthSnapshots: async (): Promise<{ success: boolean }> => {
    if (isTauri()) {
      return tauriInvoke<boolean>('clear_wealth_snapshots').then(success => ({ success }));
    }
    return safePost<{ success: boolean }>('/api/wealth/clear').then(res => res?.data);
  },

  getWealthProgress: async (): Promise<StashProgress> => {
    if (isTauri()) {
      return tauriInvoke<StashProgress>('get_stash_progress');
    }
    return safeGet<StashProgress>('/api/wealth/progress', undefined, { active: false, currentTab: 0, totalTabs: 0, currentTabName: '', stage: 'idle' }).then(res => res?.data);
  },

  // Authentication & Connection Test
  testConnection: async (params: { poesessid?: string; accountName?: string }) => {
    if (isTauri()) {
      return tauriInvoke<{ success: boolean; message: string; charactersCount?: number; characters?: any[] }>('test_connection', {
        poesessid: params.poesessid,
        accountName: params.accountName
      });
    }
    return safePost<{ success: boolean; message: string; charactersCount?: number; characters?: any[] }>('/api/auth/test-connection', params).then(res => res?.data);
  },

  loginAuth: async () => {
    if (isTauri()) {
      return tauriInvoke<{ success: boolean; accountName?: string; poesessid?: string; message?: string; error?: string }>('login_auth');
    }
    return safePost<{ success: boolean; accountName?: string; poesessid?: string; message?: string; error?: string }>('/api/auth/login').then(res => res?.data);
  },
  logoutAuth: async () => {
    if (isTauri()) {
      return tauriInvoke<boolean>('logout_auth').then(success => ({ success }));
    }
    return safePost<{ success: boolean }>('/api/auth/logout').then(res => res?.data);
  },
  getAuthStatus: async () => {
    if (isTauri()) {
      return tauriInvoke<{ loggedIn: boolean; accountName: string }>('get_auth_status');
    }
    return safeGet<{ loggedIn: boolean; accountName: string }>('/api/auth/status', undefined, { loggedIn: false, accountName: '' }).then(res => res?.data);
  },

  // Logger APIs
  getLogContents: async (lines?: number) => {
    if (isTauri()) {
      return tauriInvoke<string>('get_log_contents', { lines });
    }
    return '';
  },
  getLogFilePath: async () => {
    if (isTauri()) {
      return tauriInvoke<string>('get_log_file_path');
    }
    return '';
  }
};

export default poeApi;
