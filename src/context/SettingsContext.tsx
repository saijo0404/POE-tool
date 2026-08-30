import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AppSettings, CharacterInfo } from '../types/poe';
import { poeApi } from '../services/api';
import { SettingsContext } from './settingsContextDef';
export type { SettingsContextType } from './settingsContextDef';

const defaultSettings: AppSettings = {
  league: 'Auto',
  poesessid: '',
  accountName: '',
  autoSnapshotEnabled: true,
  autoSnapshotIntervalMinutes: 60,
  useDemoData: false,
  poetoken: '',
  cf_clearance: '',
  userAgent: '',
  hotkey: 'ctrl+c+d'
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const cached = localStorage.getItem('poe_settings_cache');
      if (cached) return { ...defaultSettings, ...JSON.parse(cached) };
    } catch {}
    return defaultSettings;
  });
  const [characters, setCharacters] = useState<CharacterInfo[]>([]);
  const [divineRate, setDivineRate] = useState<number>(150);
  const [isRateRefreshing, setIsRateRefreshing] = useState<boolean>(false);
  const [_isLoading, setIsLoading] = useState<boolean>(true);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const charactersRef = useRef(characters);
  charactersRef.current = characters;

  const refreshCharacters = useCallback(async (): Promise<void> => {
    try {
      const chars = await poeApi.getCharacters();
      if (Array.isArray(chars)) {
        setCharacters(chars);
        charactersRef.current = chars;
      }
    } catch {
      console.warn('[SettingsContext] Failed to load characters');
    }
  }, []);

  const refreshDivineRate = useCallback(async (customLeague?: string, forceRefresh?: boolean) => {
    setIsRateRefreshing(true);
    try {
      const currentSettings = settingsRef.current;
      const currentChars = charactersRef.current;
      const latestCharLeague = currentChars.length > 0 ? currentChars[0].league : undefined;
      const leagueToQuery = customLeague || (currentSettings.league && currentSettings.league !== 'Auto' ? currentSettings.league : (latestCharLeague || 'Settlers'));
      const priceData = await poeApi.getNinjaPrices(leagueToQuery, forceRefresh);
      if (priceData?.divineChaosRate && priceData.divineChaosRate > 0) {
        setDivineRate(priceData.divineChaosRate);
      }
    } catch {
      console.warn('[SettingsContext] Failed to load divine rate');
    } finally {
      setIsRateRefreshing(false);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const current = await poeApi.getSettings();
      if (current) {
        setSettings(current);
        settingsRef.current = current;
        try {
          localStorage.setItem('poe_settings_cache', JSON.stringify(current));
        } catch {}
        if (current.poesessid && current.accountName) {
          await refreshCharacters();
        }
        const currentChars = charactersRef.current;
        const latestCharLeague = currentChars.length > 0 ? currentChars[0].league : undefined;
        const targetLeague = current.league && current.league !== 'Auto' ? current.league : (latestCharLeague || 'Settlers');
        await refreshDivineRate(targetLeague, true);
      }
    } catch {
      console.warn('[SettingsContext] Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacters, refreshDivineRate]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshDivineRate(undefined, true);
    }, 10 * 60 * 1000);
    const timerNode = timer as unknown as { unref?: () => void };
    timerNode.unref?.();
    return () => clearInterval(timer);
  }, [refreshDivineRate]);

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
    try {
      const updated = await poeApi.updateSettings(newSettings);
      setSettings(updated);
      try {
        localStorage.setItem('poe_settings_cache', JSON.stringify(updated));
      } catch {}
      if (updated.league && updated.league !== 'Auto') {
        refreshDivineRate(updated.league, true);
      }
      return updated;
    } catch {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      return merged;
    }
  };

  const handleLogin = async () => {
    const res = await poeApi.loginAuth();
    if (res.success) {
      await refreshSettings();
    }
    return res;
  };

  const handleLogout = async () => {
    try {
      await poeApi.logoutAuth();
    } catch {}
    try {
      await poeApi.updateSettings({ poesessid: '', accountName: '' });
    } catch {}
    setSettings(prev => ({ ...prev, poesessid: '', accountName: '' }));
    setCharacters([]);
  };

  const activeLeague = settings.league && settings.league !== 'Auto'
    ? settings.league
    : (characters.length > 0 ? characters[0].league : 'Settlers');

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading: _isLoading,
        updateSettings: handleUpdateSettings,
        refreshSettings,
        refreshCharacters,
        refreshDivineRate,
        login: handleLogin,
        logout: handleLogout,
        divineRate,
        isRateRefreshing,
        characters,
        activeLeague,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
