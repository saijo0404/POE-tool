import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AppSettings } from '../types/poe';
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
  const [characters, setCharacters] = useState<any[]>([]);
  const [divineRate, setDivineRate] = useState<number>(150);
  const [isRateRefreshing, setIsRateRefreshing] = useState<boolean>(false);
  const [_isLoading, setIsLoading] = useState<boolean>(true);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const charactersRef = useRef(characters);
  charactersRef.current = characters;

  const refreshCharacters = useCallback(async () => {
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
      const leagueToQuery = customLeague || (currentSettings.league !== 'Auto' ? currentSettings.league : (latestCharLeague || 'Standard'));
      const priceData = await poeApi.getNinjaPrices(leagueToQuery, forceRefresh);
      if (priceData?.divineChaosRate) {
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
      }
    } catch {
      console.warn('[SettingsContext] Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacters]);

  // Initial load on mount
  useEffect(() => {
    refreshSettings().then(() => {
      refreshDivineRate();
    });
  }, [refreshSettings, refreshDivineRate]);

  // Periodic automatic background polling for live exchange rate every 10 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      refreshDivineRate(undefined, true);
    }, 10 * 60 * 1000);
    if (timer && typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }
    return () => clearInterval(timer);
  }, [refreshDivineRate]);

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
    const updated = await poeApi.updateSettings(newSettings);
    setSettings(updated);
    try {
      localStorage.setItem('poe_settings_cache', JSON.stringify(updated));
    } catch {}
    if (updated.poesessid && updated.accountName) {
      refreshCharacters();
    }
    if (updated.league) {
      refreshDivineRate(updated.league, true);
    }
    return updated;
  };

  const handleLogin = async () => {
    const result = await poeApi.loginAuth();
    if (result.success) {
      await refreshSettings();
      await refreshDivineRate(undefined, true);
    }
    return result;
  };

  const handleLogout = async () => {
    await poeApi.logoutAuth();
    await refreshSettings();
    setCharacters([]);
  };

  const latestChar = characters.length > 0 ? characters[0] : null;
  const isKnownLeague = (l?: string): boolean => {
    if (!l) return false;
    const norm = l.toLowerCase();
    return norm.includes('standard') || norm.includes('settlers') || norm.includes('allflame') || norm.includes('hardcore') || norm.includes('ruthless');
  };
  const activeLeague = settings.league === 'Auto'
    ? (isKnownLeague(latestChar?.league) ? latestChar!.league : 'Standard')
    : (settings.league || 'Standard');

  return (
    <SettingsContext.Provider
      value={{
        settings,
        characters,
        isLoading: _isLoading,
        activeLeague,
        divineRate,
        isRateRefreshing,
        updateSettings: handleUpdateSettings,
        refreshSettings,
        refreshCharacters,
        refreshDivineRate,
        login: handleLogin,
        logout: handleLogout
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
