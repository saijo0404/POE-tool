import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { poeApi } from './api';

describe('poeApi service client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
  });

  describe('Ninja & Auth API', () => {
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
    });
  });
});
