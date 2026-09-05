import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { AppSettings, CharacterInfo, SessionHealthInfo } from '../types/poe';
import { poeApi } from '../services/api';
import { SettingsContext, loadSettingsCache } from './settingsContextDef';
export type { SettingsContextType } from './settingsContextDef';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettingsCache);
  const [characters, setCharacters] = useState<CharacterInfo[]>([]);
  const [sessionHealth, setSessionHealth] = useState<SessionHealthInfo | null>(null);
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

  const checkSessionHealth = useCallback(async (force?: boolean): Promise<SessionHealthInfo> => {
    try {
      const health = await poeApi.checkSessionHealth(force);
      setSessionHealth(health);
      return health;
    } catch (e) {
      const fallback: SessionHealthInfo = {
        state: 'networkError',
        message: e instanceof Error ? e.message : '無法確認 Session 狀態',
        lastCheckedEpochMs: Date.now(),
        hasPoesessid: Boolean(settingsRef.current.poesessid),
        hasCfClearance: Boolean(settingsRef.current.cf_clearance)
      };
      setSessionHealth(fallback);
      return fallback;
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
        await checkSessionHealth(false);
      }
    } catch {
      console.warn('[SettingsContext] Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacters, refreshDivineRate, checkSessionHealth]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) {
      return;
    }
    let unmounted = false;
    let unlistenFn: (() => void) | undefined;
    import('@tauri-apps/api/event')
      .then(({ listen }) => {
        if (unmounted) return;
        listen('auto-login-completed', () => {
          refreshSettings();
        }).then(unlisten => {
          unlistenFn = unlisten;
        });
      })
      .catch(() => {});

    return () => {
      unmounted = true;
      if (unlistenFn) unlistenFn();
    };
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
      await checkSessionHealth(false);
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
      await poeApi.updateSettings({ poesessid: '', accountName: '', cf_clearance: '' });
    } catch {}
    setSettings(prev => ({ ...prev, poesessid: '', accountName: '', cf_clearance: '' }));
    setCharacters([]);
    setSessionHealth({
      state: 'unconfigured',
      message: '尚未設定 POESESSID 官方憑證',
      lastCheckedEpochMs: Date.now(),
      hasPoesessid: false,
      hasCfClearance: false
    });
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
        sessionHealth,
        checkSessionHealth,
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
