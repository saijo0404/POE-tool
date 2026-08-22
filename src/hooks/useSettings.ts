import { useContext } from 'react';
import { SettingsContext } from '../context/settingsContextDef';
import type { SettingsContextType } from '../context/settingsContextDef';
import type { AppSettings } from '../types/poe';

const fallbackDefaultSettings: AppSettings = {
  league: 'Auto',
  poesessid: '',
  accountName: '',
  autoSnapshotEnabled: true,
  autoSnapshotIntervalMinutes: 60,
  useDemoData: false
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      settings: fallbackDefaultSettings,
      isLoading: false,
      updateSettings: async (s: Partial<AppSettings>) => ({ ...fallbackDefaultSettings, ...s }),
      refreshSettings: async () => {},
      refreshCharacters: async () => {},
      refreshDivineRate: async () => {},
      login: async () => ({ success: true }),
      logout: async () => {},
      divineRate: 150,
      isRateRefreshing: false,
      characters: [],
      activeLeague: 'Standard'
    };
  }
  return context;
}

export default useSettings;
