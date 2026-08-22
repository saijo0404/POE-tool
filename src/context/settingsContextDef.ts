import { createContext } from 'react';
import type { AppSettings } from '../types/poe';

export interface SettingsContextType {
  settings: AppSettings;
  characters: any[];
  isLoading: boolean;
  activeLeague: string;
  divineRate: number;
  isRateRefreshing: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<AppSettings>;
  refreshSettings: () => Promise<void>;
  refreshCharacters: () => Promise<void>;
  refreshDivineRate: (league?: string, forceRefresh?: boolean) => Promise<void>;
  login: () => Promise<{ success: boolean; accountName?: string; poesessid?: string; error?: string }>;
  logout: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
