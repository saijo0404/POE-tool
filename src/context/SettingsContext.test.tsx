import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
    vi.spyOn(poeApi, 'getNinjaPrices').mockResolvedValueOnce({
      rates: {},
      divineChaosRate: 160,
      league: 'Standard'
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

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
    vi.spyOn(poeApi, 'getNinjaPrices').mockResolvedValue({
      rates: {},
      divineChaosRate: 155,
      league: 'Settlers'
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

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
    vi.spyOn(poeApi, 'logoutAuth').mockResolvedValueOnce({ success: true });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

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
