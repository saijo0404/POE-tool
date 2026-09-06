import type { IPoeApiClient } from '../../application/ports/IPoeApiClient';
import type {
  AppSettings,
  CharacterInfo,
  ConnectionTestResult,
  LoginAuthResult,
  AuthStatusResult,
  SessionHealthInfo
} from '../../domain/settings/types';
import type { ParsedItem } from '../../domain/item/types';
import type { GameEngine } from '../../domain/engine/types';
import type {
  TradeLeagueEntry,
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
import type { DiagnosticBundle } from '../../domain/logger/types';

export class TauriBridgeClient implements IPoeApiClient {
  private async invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }

  async getSettings(): Promise<AppSettings> {
    return this.invoke<AppSettings>('get_settings');
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return this.invoke<AppSettings>('update_settings', { newSettings: settings });
  }

  async getCharacters(): Promise<CharacterInfo[]> {
    const res = await this.invoke<CharacterInfo[]>('get_characters');
    return Array.isArray(res) ? res : [];
  }

  async testConnection(params: { poesessid?: string; accountName?: string }): Promise<ConnectionTestResult> {
    return this.invoke<ConnectionTestResult>('test_connection', params);
  }

  async loginAuth(): Promise<LoginAuthResult> {
    return this.invoke<LoginAuthResult>('login_auth');
  }

  async logoutAuth(): Promise<{ success: boolean }> {
    const success = await this.invoke<boolean>('logout_auth');
    return { success };
  }

  async getAuthStatus(): Promise<AuthStatusResult> {
    return this.invoke<AuthStatusResult>('get_auth_status');
  }

  async checkSessionHealth(force?: boolean): Promise<SessionHealthInfo> {
    return this.invoke<SessionHealthInfo>('check_session_health', { force });
  }

  async getSessionHealth(): Promise<SessionHealthInfo> {
    return this.invoke<SessionHealthInfo>('get_session_health');
  }

  async getLatestClipboard(): Promise<{ text: string | null; timestamp: number }> {
    return this.invoke<{ text: string | null; timestamp: number }>('get_latest_clipboard');
  }

  async readClipboard(): Promise<{ text: string; isPoeItem: boolean }> {
    return this.invoke<{ text: string; isPoeItem: boolean }>('read_clipboard');
  }

  async parseItem(itemText: string): Promise<ParsedItem> {
    return this.invoke<ParsedItem>('parse_item', { itemText });
  }

  async searchTrade(payload: TradeQueryRequest): Promise<TradeSearchResult> {
    return this.invoke<TradeSearchResult>('search_trade', { request: payload });
  }

  async getTradeLeagues(engine?: GameEngine): Promise<TradeLeagueEntry[]> {
    const res = await this.invoke<TradeLeagueEntry[]>('get_trade_leagues', { engine });
    return Array.isArray(res) ? res : [];
  }

  async sendOfficialWhisper(token: string, league?: string, engine?: GameEngine): Promise<{ success: boolean; message?: string }> {
    try {
      const msg = await this.invoke<string>('send_official_whisper', { token, league, engine });
      return { success: true, message: msg };
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }

  async travelToHideout(payload: TravelToHideoutPayload): Promise<TravelToHideoutResult> {
    return this.invoke<TravelToHideoutResult>('travel_to_hideout', {
      token: payload.token,
      characterName: payload.characterName,
      league: payload.league,
      engine: payload.engine
    });
  }

  async fetchBuildItemLivePrice(league: string, queryJson: string, engine?: GameEngine): Promise<TradeSearchResult> {
    return this.invoke<TradeSearchResult>('fetch_build_item_live_price', { league, queryJson, engine });
  }

  async createTradeSearchUrl(league: string, queryJson: string, engine?: GameEngine): Promise<string> {
    return this.invoke<string>('create_trade_search_url', { league, queryJson, engine });
  }

  async openExternalUrl(url: string): Promise<void> { return this.invoke<void>('open_external_url', { url }); }
  async openAtlasTreeWindow(url: string, title?: string): Promise<void> { return this.invoke<void>('open_atlas_tree_window', { url, title }); }
  async triggerInGameCommand(command: string): Promise<boolean> { return this.invoke<boolean>('trigger_in_game_command', { command }); }

  async getNinjaPrices(league?: string, refresh?: boolean): Promise<NinjaPricesResult> {
    return this.invoke<NinjaPricesResult>('get_ninja_prices', { league, refresh });
  }

  async calculateBuild(ninjaUrl: string): Promise<BuildCostResult> {
    return this.invoke<BuildCostResult>('calculate_build', { ninjaUrl });
  }

  async getFaustusExchangeOverview(league?: string, refresh?: boolean): Promise<import('../../domain/exchange/types').FaustusMarketOverview> {
    try {
      return await this.invoke<import('../../domain/exchange/types').FaustusMarketOverview>('get_faustus_exchange_overview', { league, refresh });
    } catch {
      const { createDefaultExchangeOverview } = await import('../../domain/exchange/defaultOverview');
      return createDefaultExchangeOverview(league || 'Settlers');
    }
  }

  async getWealthSnapshots(): Promise<WealthSnapshot[]> {
    const res = await this.invoke<WealthSnapshot[]>('get_wealth_snapshots');
    return Array.isArray(res) ? res : [];
  }

  async getStashTabs(league?: string): Promise<StashTabMeta[]> {
    const res = await this.invoke<StashTabMeta[]>('get_stash_tabs', { league });
    return Array.isArray(res) ? res : [];
  }

  async takeWealthSnapshot(): Promise<WealthSnapshot> { return this.invoke<WealthSnapshot>('take_wealth_snapshot'); }
  async clearWealthSnapshots(): Promise<{ success: boolean }> {
    const success = await this.invoke<boolean>('clear_wealth_snapshots');
    return { success };
  }

  async getWealthProgress(): Promise<StashProgress> { return this.invoke<StashProgress>('get_stash_progress'); }

  async getCursorPosition(): Promise<{ x: number; y: number }> {
    const res = await this.invoke<[number, number]>('get_cursor_position');
    return { x: res?.[0] ?? 100, y: res?.[1] ?? 100 };
  }

  async showOverlayWindow(x?: number, y?: number, itemText?: string): Promise<void> {
    return this.invoke<void>('show_overlay_window', { x, y, itemText });
  }

  async hideOverlayWindow(): Promise<void> { return this.invoke<void>('hide_overlay_window'); }
  async setOverlayClickThrough(enable: boolean): Promise<void> { return this.invoke<void>('set_overlay_click_through', { enable }); }
  async getPendingOverlayItem(): Promise<string | null> { return this.invoke<string | null>('get_pending_overlay_item'); }
  async getLogContents(lines?: number): Promise<string> { return this.invoke<string>('get_log_contents', { lines }); }
  async getLogFilePath(): Promise<string> { return this.invoke<string>('get_log_file_path'); }
  async writeLogEntry(level: string, message: string, context?: string): Promise<void> {
    return this.invoke<void>('write_log_entry', { level, message, context });
  }
  async clearLogs(): Promise<{ success: boolean }> {
    await this.invoke<void>('clear_logs');
    return { success: true };
  }
  async getDiagnosticBundle(): Promise<DiagnosticBundle> {
    return this.invoke<DiagnosticBundle>('get_diagnostic_bundle');
  }
  async openLogDirectory(): Promise<{ success: boolean }> {
    await this.invoke<void>('open_log_directory');
    return { success: true };
  }
}
