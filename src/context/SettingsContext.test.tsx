import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SettingsProvider } from './SettingsContext';
import { useSettings } from '../hooks/useSettings';
import { poeApi } from '../services/api';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.localStorage.clear();
    vi.spyOn(poeApi, 'getNinjaPrices').mockResolvedValue({
      rates: {},
      divineChaosRate: 150,
      league: 'Standard'
    });
    vi.spyOn(poeApi, 'getCharacters').mockResolvedValue([]);
  });

  it('provides default settings and fallback values when rendered within provider', async () => {
    vi.spyOn(poeApi, 'getSettings').mockResolvedValueOnce({
      league: 'Auto',
      poesessid: '',
      accountName: '',
      autoSnapshotEnabled: true,
      autoSnapshotIntervalMinutes: 60,
      useDemoData: false
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings).toBeDefined();
    expect(result.current.activeLeague).toBeDefined();
  });

  it('updates settings and persists cache to localStorage', async () => {
    const updatedMock = {
      league: 'Settlers',
      poesessid: 'sess_abc',
      accountName: 'Tester',
      autoSnapshotEnabled: true,
      autoSnapshotIntervalMinutes: 30,
      useDemoData: false
    };

    vi.spyOn(poeApi, 'getSettings').mockResolvedValueOnce(updatedMock);
    vi.spyOn(poeApi, 'updateSettings').mockResolvedValueOnce(updatedMock);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateSettings({ league: 'Settlers' });
    });

    expect(result.current.settings.league).toBe('Settlers');
  });

  it('handles logout and clears characters', async () => {
    vi.spyOn(poeApi, 'getSettings').mockResolvedValue({
      league: 'Standard',
      poesessid: '',
      accountName: '',
      autoSnapshotEnabled: false,
      autoSnapshotIntervalMinutes: 60,
      useDemoData: false
    });
    vi.spyOn(poeApi, 'logoutAuth').mockResolvedValue({ success: true });
    vi.spyOn(poeApi, 'updateSettings').mockResolvedValue({
      league: 'Standard',
      poesessid: '',
      accountName: '',
      autoSnapshotEnabled: false,
      autoSnapshotIntervalMinutes: 60,
      useDemoData: false
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.characters).toEqual([]);
  });

  it('returns graceful default fallback when used outside of provider', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.league).toBe('Auto');
    expect(result.current.divineRate).toBe(150);
  });
});
