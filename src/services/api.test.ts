import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { poeApi } from './api';
import { ApiClientFactory } from '../infrastructure/api/ApiClientFactory';

describe('poeApi service client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as any).__TAURI__;
    delete (window as any).__TAURI_INTERNALS__;
    ApiClientFactory.resetClient();
  });

  afterEach(() => {
    delete (window as any).__TAURI__;
    delete (window as any).__TAURI_INTERNALS__;
    ApiClientFactory.resetClient();
  });

  describe('Settings API', () => {
    it('getSettings returns data from axios.get', async () => {
      const mockSettings = { league: 'Standard', poesessid: '123' };
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockSettings } as any);

      const res = await poeApi.getSettings();
      expect(res).toEqual(mockSettings);
    });

    it('updateSettings posts data to /api/settings', async () => {
      const payload = { league: 'Settlers' };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { league: 'Settlers' } } as any);

      const res = await poeApi.updateSettings(payload);
      expect(res).toEqual({ league: 'Settlers' });
      expect(axios.post).toHaveBeenCalledWith('/api/settings', payload, undefined);
    });
  });

  describe('Characters & Stash Tabs API with Fallback Handling', () => {
    it('getCharacters returns array on success', async () => {
      const mockChars = [{ name: 'Slayer', level: 95 }];
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockChars } as any);

      const res = await poeApi.getCharacters();
      expect(res).toEqual(mockChars);
    });

    it('getCharacters falls back to empty array [] on error', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network error'));

      const res = await poeApi.getCharacters();
      expect(res).toEqual([]);
    });

    it('getWealthSnapshots falls back to empty array [] on error', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('500 Internal Error'));

      const res = await poeApi.getWealthSnapshots();
      expect(res).toEqual([]);
    });

    it('getStashTabs returns tab list or falls back to []', async () => {
      const mockTabs = [{ i: 0, id: '1', n: 'Currency', type: 'CurrencyStash' }];
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockTabs } as any);

      const res = await poeApi.getStashTabs('Settlers');
      expect(res).toEqual(mockTabs);

      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Failed'));
      const fallbackRes = await poeApi.getStashTabs();
      expect(fallbackRes).toEqual([]);
    });

    it('takeWealthSnapshot posts to /api/wealth/snapshot', async () => {
      const mockSnapshot = { totalChaos: 5000, totalDivine: 30 };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockSnapshot } as any);

      const res = await poeApi.takeWealthSnapshot();
      expect(res).toEqual(mockSnapshot);
    });

    it('clearWealthSnapshots posts to /api/wealth/clear', async () => {
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true } } as any);

      const res = await poeApi.clearWealthSnapshots();
      expect(res?.success).toBe(true);
    });

    it('getWealthProgress falls back to default idle object on error', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Offline'));

      const res = await poeApi.getWealthProgress();
      expect(res).toEqual({ active: false, currentTab: 0, totalTabs: 0, currentTabName: '', stage: 'idle' });
    });
  });

  describe('Clipboard & Item & Trade API', () => {
    it('getLatestClipboard returns clipboard payload or fallback', async () => {
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: { text: 'Item Text', timestamp: 12345 } } as any);
      const res = await poeApi.getLatestClipboard();
      expect(res?.text).toBe('Item Text');

      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Err'));
      const fallback = await poeApi.getLatestClipboard();
      expect(fallback?.text).toBeNull();
    });

    it('readClipboard posts to /api/clipboard/read', async () => {
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { text: 'Rarity: Rare', isPoeItem: true } } as any);
      const res = await poeApi.readClipboard();
      expect(res?.isPoeItem).toBe(true);
    });

    it('parseItem posts itemText to /api/parse-item', async () => {
      const mockParsed = { name: 'Mageblood', rarity: 'Unique' };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockParsed } as any);

      const res = await poeApi.parseItem('Rarity: Unique\nMageblood\n--------');
      expect(res).toEqual(mockParsed);
    });

    it('searchTrade posts query payload to /api/trade/search', async () => {
      const mockResult = { id: 'search1', total: 10, listings: [] };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockResult } as any);

      const res = await poeApi.searchTrade({ league: 'Settlers', name: 'Mageblood' });
      expect(res).toEqual(mockResult);
    });

    it('sendOfficialWhisper posts token and league to /api/trade/whisper', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true } } as any);
      const res = await poeApi.sendOfficialWhisper('token123', 'Settlers');
      expect(postSpy).toHaveBeenCalledWith('/api/trade/whisper', { token: 'token123', league: 'Settlers' }, undefined);
      expect(res?.success).toBe(true);
    });

    it('travelToHideout posts payload to /api/trade/travel', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { success: true, gameTriggered: true, hideoutCmd: '/hideout SlayerGod' }
      } as any);
      const res = await poeApi.travelToHideout({ token: 'tok', characterName: 'SlayerGod', league: 'Settlers' });
      expect(postSpy).toHaveBeenCalledWith('/api/trade/travel', { token: 'tok', characterName: 'SlayerGod', league: 'Settlers' }, undefined);
      expect(res?.gameTriggered).toBe(true);
    });

    it('fetchBuildItemLivePrice posts raw query to /api/trade/search-raw', async () => {
      const mockResult = { id: 'search-raw', total: 5, listings: [] };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockResult } as any);

      const res = await poeApi.fetchBuildItemLivePrice('Settlers', '{"name":"Starforge"}');
      expect(res).toEqual(mockResult);
    });

    it('createTradeSearchUrl returns web search URL fallback in web mode', async () => {
      const url = await poeApi.createTradeSearchUrl('Settlers', '{}');
      expect(url).toBe('https://www.pathofexile.com/trade/search/Settlers');
    });

    it('openExternalUrl opens window in web mode', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      await poeApi.openExternalUrl('https://example.com');
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });
  });

  describe('Ninja & Auth & Logger API', () => {
    it('getNinjaPrices returns price map and divine rate', async () => {
      const mockNinja = { rates: { 'Chaos Orb': 1 }, divineChaosRate: 155, league: 'Settlers' };
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockNinja } as any);

      const res = await poeApi.getNinjaPrices('Settlers');
      expect(res?.divineChaosRate).toBe(155);
    });

    it('calculateBuild posts ninjaUrl to /api/build-calculator', async () => {
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { totalCostChaos: 10000 } } as any);
      const res = await poeApi.calculateBuild('https://pobb.in/test');
      expect(res?.totalCostChaos).toBe(10000);
    });

    it('testConnection, loginAuth, logoutAuth, and getAuthStatus', async () => {
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true, message: 'Connected' } } as any);
      const connRes = await poeApi.testConnection({ poesessid: 'abc' });
      expect(connRes?.success).toBe(true);

      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true, accountName: 'Player' } } as any);
      const loginRes = await poeApi.loginAuth();
      expect(loginRes?.accountName).toBe('Player');

      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true } } as any);
      const logoutRes = await poeApi.logoutAuth();
      expect(logoutRes?.success).toBe(true);

      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: { loggedIn: true, accountName: 'Player' } } as any);
      const authStatus = await poeApi.getAuthStatus();
      expect(authStatus?.loggedIn).toBe(true);

      const sessionHealth = await poeApi.checkSessionHealth(true);
      expect(sessionHealth?.state).toBe('valid');
      const cachedHealth = await poeApi.getSessionHealth();
      expect(cachedHealth?.state).toBe('valid');
    });

    it('getLogContents and getLogFilePath return empty string in web mode', async () => {
      const logs = await poeApi.getLogContents(50);
      expect(logs).toBe('');

      const path = await poeApi.getLogFilePath();
      expect(path).toBe('');
    });
  });

  describe('Tauri environment invoking', () => {
    beforeEach(() => {
      (window as any).__TAURI__ = {};
    });

    it('invokes Tauri commands across settings, stash, trade, and logger', async () => {
      const mockInvoke = vi.fn().mockImplementation(async (cmd: string) => {
        if (cmd === 'get_settings') return { league: 'Settlers' };
        if (cmd === 'update_settings') return { league: 'Standard' };
        if (cmd === 'get_characters') return [{ name: 'Slayer' }];
        if (cmd === 'get_wealth_snapshots') return [{ totalChaos: 1000 }];
        if (cmd === 'get_stash_tabs') return [{ n: 'Tab1' }];
        if (cmd === 'take_wealth_snapshot') return { totalChaos: 2000 };
        if (cmd === 'clear_wealth_snapshots') return true;
        if (cmd === 'get_stash_progress') return { stage: 'idle' };
        if (cmd === 'get_latest_clipboard') return { text: 'item' };
        if (cmd === 'read_clipboard') return { text: 'item', isPoeItem: true };
        if (cmd === 'parse_item') return { name: 'Mageblood' };
        if (cmd === 'search_trade') return { total: 5 };
        if (cmd === 'send_official_whisper') return 'Whisper Sent';
        if (cmd === 'travel_to_hideout') return { success: true, gameTriggered: true };
        if (cmd === 'get_ninja_prices') return { divineChaosRate: 160 };
        if (cmd === 'calculate_build') return { totalCostChaos: 5000 };
        if (cmd === 'fetch_build_item_live_price') return { total: 2 };
        if (cmd === 'create_trade_search_url') return 'https://tauri.trade';
        if (cmd === 'test_connection') return { success: true };
        if (cmd === 'login_auth') return { success: true };
        if (cmd === 'logout_auth') return true;
        if (cmd === 'get_auth_status') return { loggedIn: true, accountName: 'God' };
        if (cmd === 'check_session_health') return { state: 'valid', message: 'OK' };
        if (cmd === 'get_session_health') return { state: 'valid', message: 'OK' };
        if (cmd === 'get_log_contents') return 'Line 1\nLine 2';
        if (cmd === 'get_log_file_path') return '/logs/app.log';
        if (cmd === 'get_cursor_position') return [500, 300];
        if (cmd === 'show_overlay_window') return null;
        if (cmd === 'hide_overlay_window') return null;
        if (cmd === 'set_overlay_click_through') return null;
        if (cmd === 'get_pending_overlay_item') return 'item';
        if (cmd === 'trigger_in_game_command') return true;
        return null;
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
});

