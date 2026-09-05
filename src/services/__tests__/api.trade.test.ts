import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { poeApi } from '../api';
import { ApiClientFactory } from '../../infrastructure/api/ApiClientFactory';

describe('poeApi service - Trade, Ninja & Auth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    ApiClientFactory.resetClient();
  });

  afterEach(() => {
    delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    ApiClientFactory.resetClient();
  });

  describe('Clipboard & Item & Trade API', () => {
    it('getLatestClipboard returns clipboard payload or fallback', async () => {
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: { text: 'Item Text', timestamp: 12345 } });
      const res = await poeApi.getLatestClipboard();
      expect(res?.text).toBe('Item Text');

      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Err'));
      const fallback = await poeApi.getLatestClipboard();
      expect(fallback?.text).toBeNull();
    });

    it('readClipboard and parseItem', async () => {
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { text: 'Rarity: Rare', isPoeItem: true } });
      const clipRes = await poeApi.readClipboard();
      expect(clipRes?.isPoeItem).toBe(true);

      const mockParsed = { name: 'Mageblood', rarity: 'Unique' };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockParsed });
      const parseRes = await poeApi.parseItem('Rarity: Unique\nMageblood\n--------');
      expect(parseRes).toEqual(mockParsed);
    });

    it('searchTrade posts query payload to /api/trade/search', async () => {
      const mockResult = { id: 'search1', total: 10, listings: [] };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockResult });
      const res = await poeApi.searchTrade({ league: 'Settlers', name: 'Mageblood' });
      expect(res).toEqual(mockResult);
    });

    it('getTradeLeagues returns list or fallback', async () => {
      const mockLeagues = [{ id: 'Standard', text: 'Standard' }, { id: 'Early Access', text: 'Early Access' }];
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockLeagues });
      const res = await poeApi.getTradeLeagues('poe2');
      expect(res).toEqual(mockLeagues);

      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network error'));
      const fallback = await poeApi.getTradeLeagues('poe2');
      expect(fallback.some(l => l.id === 'Early Access')).toBe(true);
    });

    it('sendOfficialWhisper posts token, league and engine to /api/trade/whisper', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true } });
      const res = await poeApi.sendOfficialWhisper('token123', 'Standard', 'poe2');
      expect(postSpy).toHaveBeenCalledWith('/api/trade/whisper', { token: 'token123', league: 'Standard', engine: 'poe2' }, undefined);
      expect(res?.success).toBe(true);
    });

    it('travelToHideout posts payload to /api/trade/travel', async () => {
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { success: true, gameTriggered: true, hideoutCmd: '/hideout SlayerGod' }
      });
      const res = await poeApi.travelToHideout({ token: 'tok', characterName: 'SlayerGod', league: 'Standard', engine: 'poe2' });
      expect(postSpy).toHaveBeenCalledWith('/api/trade/travel', { token: 'tok', characterName: 'SlayerGod', league: 'Standard', engine: 'poe2' }, undefined);
      expect(res?.gameTriggered).toBe(true);
    });

    it('fetchBuildItemLivePrice posts raw query and engine to /api/trade/search-raw', async () => {
      const mockResult = { id: 'search-raw', total: 5, listings: [] };
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockResult });
      const res = await poeApi.fetchBuildItemLivePrice('Standard', '{"name":"Starforge"}', 'poe2');
      expect(postSpy).toHaveBeenCalledWith('/api/trade/search-raw', { league: 'Standard', queryJson: '{"name":"Starforge"}', engine: 'poe2' }, undefined);
      expect(res).toEqual(mockResult);
    });

    it('createTradeSearchUrl and openExternalUrl in web mode', async () => {
      const urlPoe1 = await poeApi.createTradeSearchUrl('Settlers', '{}', 'poe1');
      expect(urlPoe1).toBe('https://www.pathofexile.com/trade/search/Settlers');

      const urlPoe2 = await poeApi.createTradeSearchUrl('Standard', '{}', 'poe2');
      expect(urlPoe2).toBe('https://www.pathofexile.com/trade2/search/Standard');

      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      await poeApi.openExternalUrl('https://example.com');
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    });
  });

  describe('Ninja & Auth & Logger API', () => {
    it('getNinjaPrices, calculateBuild and getFaustusExchangeOverview', async () => {
      const mockNinja = { rates: { 'Chaos Orb': 1 }, divineChaosRate: 155, league: 'Settlers' };
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockNinja });
      const ninjaRes = await poeApi.getNinjaPrices('Settlers');
      expect(ninjaRes?.divineChaosRate).toBe(155);

      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { totalCostChaos: 10000 } });
      const buildRes = await poeApi.calculateBuild('https://pobb.in/test');
      expect(buildRes?.totalCostChaos).toBe(10000);

      const mockOverview = { totalItems: 20, items: [] };
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockOverview });
      const exchangeRes = await poeApi.getFaustusExchangeOverview('Settlers');
      expect(exchangeRes?.totalItems).toBe(20);
    });

    it('testConnection, loginAuth, logoutAuth, and getAuthStatus', async () => {
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true, message: 'Connected' } });
      const connRes = await poeApi.testConnection({ poesessid: 'abc' });
      expect(connRes?.success).toBe(true);

      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true, accountName: 'Player' } });
      const loginRes = await poeApi.loginAuth();
      expect(loginRes?.accountName).toBe('Player');

      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true } });
      const logoutRes = await poeApi.logoutAuth();
      expect(logoutRes?.success).toBe(true);

      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: { loggedIn: true, accountName: 'Player' } });
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
});
