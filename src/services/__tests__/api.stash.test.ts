import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { poeApi } from '../api';
import { ApiClientFactory } from '../../infrastructure/api/ApiClientFactory';

describe('poeApi service - Settings, Stash & Wealth', () => {
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

  describe('Settings API', () => {
    it('getSettings returns data from axios.get', async () => {
      const mockSettings = { league: 'Standard', poesessid: '123' };
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockSettings });

      const res = await poeApi.getSettings();
      expect(res).toEqual(mockSettings);
    });

    it('updateSettings posts data to /api/settings', async () => {
      const payload = { league: 'Settlers' };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { league: 'Settlers' } });

      const res = await poeApi.updateSettings(payload);
      expect(res).toEqual({ league: 'Settlers' });
      expect(axios.post).toHaveBeenCalledWith('/api/settings', payload, undefined);
    });
  });

  describe('Characters & Stash Tabs API with Fallback Handling', () => {
    it('getCharacters returns array on success or fallback to [] on error', async () => {
      const mockChars = [{ name: 'Slayer', level: 95 }];
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockChars });
      const res = await poeApi.getCharacters();
      expect(res).toEqual(mockChars);

      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Network error'));
      const fallbackRes = await poeApi.getCharacters();
      expect(fallbackRes).toEqual([]);
    });

    it('getWealthSnapshots falls back to empty array [] on error', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('500 Internal Error'));
      const res = await poeApi.getWealthSnapshots();
      expect(res).toEqual([]);
    });

    it('getStashTabs returns tab list or falls back to []', async () => {
      const mockTabs = [{ i: 0, id: '1', n: 'Currency', type: 'CurrencyStash' }];
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockTabs });
      const res = await poeApi.getStashTabs('Settlers');
      expect(res).toEqual(mockTabs);

      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Failed'));
      const fallbackRes = await poeApi.getStashTabs();
      expect(fallbackRes).toEqual([]);
    });

    it('takeWealthSnapshot and clearWealthSnapshots', async () => {
      const mockSnapshot = { totalChaos: 5000, totalDivine: 30 };
      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockSnapshot });
      const res = await poeApi.takeWealthSnapshot();
      expect(res).toEqual(mockSnapshot);

      vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true } });
      const clearRes = await poeApi.clearWealthSnapshots();
      expect(clearRes?.success).toBe(true);
    });

    it('getWealthProgress falls back to default idle object on error', async () => {
      vi.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Offline'));
      const res = await poeApi.getWealthProgress();
      expect(res).toEqual({ active: false, currentTab: 0, totalTabs: 0, currentTabName: '', stage: 'idle' });
    });
  });
});
