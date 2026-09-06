import { createContext } from 'react';
import type { AppSettings, CharacterInfo, SessionHealthInfo } from '../types/poe';

export interface SettingsContextType {
  settings: AppSettings;
  characters: CharacterInfo[];
  sessionHealth: SessionHealthInfo | null;

  isLoading: boolean;
  activeLeague: string;
  divineRate: number;
  isRateRefreshing: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<AppSettings>;
  refreshSettings: () => Promise<void>;
  refreshCharacters: () => Promise<void>;
  refreshDivineRate: (league?: string, forceRefresh?: boolean) => Promise<void>;
  checkSessionHealth: (force?: boolean) => Promise<SessionHealthInfo>;
  login: () => Promise<{ success: boolean; accountName?: string; poesessid?: string; error?: string }>;
  logout: () => Promise<void>;
}

export const DEFAULT_SETTINGS: AppSettings = {
  league: 'Auto',
  poesessid: '',
  accountName: '',
  autoSnapshotEnabled: true,
  autoSnapshotIntervalMinutes: 60,
  useDemoData: false,
  poetoken: '',
  cf_clearance: '',
  userAgent: '',
  hotkey: 'ctrl+c+d',
  focusModeEnabled: false
};

export function loadSettingsCache(): AppSettings {
  try {
    const cached = localStorage.getItem('poe_settings_cache');
    if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

