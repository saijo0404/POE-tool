import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { poeApi } from '../api';
import { ApiClientFactory } from '../../infrastructure/api/ApiClientFactory';

describe('poeApi service - Tauri Backend Invocation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    (window as unknown as { __TAURI__?: Record<string, unknown> }).__TAURI__ = {};
    ApiClientFactory.resetClient();
  });

  afterEach(() => {
    delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    ApiClientFactory.resetClient();
  });

  it('invokes Tauri commands across settings, stash, trade, and logger', async () => {
    const mockInvoke = vi.fn().mockImplementation(async (cmd: string) => {
      const handlers: Record<string, unknown> = {
        get_settings: { league: 'Settlers' },
        update_settings: { league: 'Standard' },
        get_characters: [{ name: 'Slayer' }],
        get_wealth_snapshots: [{ totalChaos: 1000 }],
        get_stash_tabs: [{ n: 'Tab1' }],
        take_wealth_snapshot: { totalChaos: 2000 },
        clear_wealth_snapshots: true,
        get_stash_progress: { stage: 'idle' },
        get_latest_clipboard: { text: 'item' },
        read_clipboard: { text: 'item', isPoeItem: true },
        parse_item: { name: 'Mageblood' },
        search_trade: { total: 5 },
        send_official_whisper: 'Whisper Sent',
        travel_to_hideout: { success: true, gameTriggered: true },
        get_ninja_prices: { divineChaosRate: 160 },
        calculate_build: { totalCostChaos: 5000 },
        get_faustus_exchange_overview: { totalItems: 20 },
        fetch_build_item_live_price: { total: 2 },
        create_trade_search_url: 'https://tauri.trade',
        test_connection: { success: true },
        login_auth: { success: true },
        logout_auth: true,
        get_auth_status: { loggedIn: true, accountName: 'God' },
        check_session_health: { state: 'valid', message: 'OK' },
        get_session_health: { state: 'valid', message: 'OK' },
        get_log_contents: 'Line 1\nLine 2',
        get_log_file_path: '/logs/app.log',
        get_cursor_position: [500, 300],
        show_overlay_window: null,
        hide_overlay_window: null,
        set_overlay_click_through: null,
        get_pending_overlay_item: 'item',
        trigger_in_game_command: true
      };
      return handlers[cmd] ?? null;
    });

    vi.doMock('@tauri-apps/api/core', () => ({
      invoke: mockInvoke,
    }));

    expect(await poeApi.getSettings()).toEqual({ league: 'Settlers' });
    expect(await poeApi.updateSettings({ league: 'Standard' })).toEqual({ league: 'Standard' });
    expect(await poeApi.getCharacters()).toEqual([{ name: 'Slayer' }]);
    expect(await poeApi.getWealthSnapshots()).toEqual([{ totalChaos: 1000 }]);
    expect(await poeApi.getStashTabs()).toEqual([{ n: 'Tab1' }]);
    expect(await poeApi.takeWealthSnapshot()).toEqual({ totalChaos: 2000 });
    expect(await poeApi.clearWealthSnapshots()).toEqual({ success: true });
    expect(await poeApi.getWealthProgress()).toEqual({ stage: 'idle' });
    expect(await poeApi.getLatestClipboard()).toEqual({ text: 'item' });
    expect(await poeApi.readClipboard()).toEqual({ text: 'item', isPoeItem: true });
    expect(await poeApi.parseItem('text')).toEqual({ name: 'Mageblood' });
    expect(await poeApi.searchTrade({ league: 'Settlers' })).toEqual({ total: 5 });
    expect(await poeApi.sendOfficialWhisper('tok', 'Settlers')).toEqual({ success: true, message: 'Whisper Sent' });
    expect(await poeApi.travelToHideout({ token: 'tok' })).toEqual({ success: true, gameTriggered: true });
    expect(await poeApi.getNinjaPrices('Settlers')).toEqual({ divineChaosRate: 160 });
    expect(await poeApi.calculateBuild('url')).toEqual({ totalCostChaos: 5000 });
    expect(await poeApi.getFaustusExchangeOverview('Settlers')).toEqual({ totalItems: 20 });
    expect(await poeApi.fetchBuildItemLivePrice('Settlers', '{}')).toEqual({ total: 2 });
    expect(await poeApi.createTradeSearchUrl('Settlers', '{}')).toBe('https://tauri.trade');
    await poeApi.openExternalUrl('url');
    expect(await poeApi.testConnection({})).toEqual({ success: true });
    expect(await poeApi.loginAuth()).toEqual({ success: true });
    expect(await poeApi.logoutAuth()).toEqual({ success: true });
    expect(await poeApi.getAuthStatus()).toEqual({ loggedIn: true, accountName: 'God' });
    expect(await poeApi.checkSessionHealth(true)).toEqual({ state: 'valid', message: 'OK' });
    expect(await poeApi.getSessionHealth()).toEqual({ state: 'valid', message: 'OK' });
    expect(await poeApi.getCursorPosition()).toEqual({ x: 500, y: 300 });
    await poeApi.showOverlayWindow(500, 300, 'item');
    await poeApi.hideOverlayWindow();
    await poeApi.setOverlayClickThrough(true);
    expect(await poeApi.getPendingOverlayItem()).toBe('item');
    expect(await poeApi.getLogContents()).toBe('Line 1\nLine 2');
    expect(await poeApi.getLogFilePath()).toBe('/logs/app.log');
    expect(await poeApi.triggerInGameCommand('/hideout')).toBe(true);
  });
});
