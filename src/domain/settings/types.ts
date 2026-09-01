export interface AppSettings {
  league: string;
  poesessid: string;
  accountName: string;
  autoSnapshotEnabled: boolean;
  autoSnapshotIntervalMinutes: number;
  useDemoData: boolean;
  poetoken?: string;
  cf_clearance?: string;
  userAgent?: string;
  hotkey?: string;
  selectedStashTabs?: number[];
  maxStashTabs?: number;
  overlayEnabled?: boolean;
  overlayOpacity?: number;
  overlayClickThrough?: boolean;
  overlayAutoCloseOnBlur?: boolean;
  overlayScale?: number;
}

export interface CharacterInfo {
  name: string;
  league: string;
  class: string;
  level: number;
  accountName?: string;
  experience?: number;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  charactersCount?: number;
  characters?: CharacterInfo[];
}

export interface LoginAuthResult {
  success: boolean;
  accountName?: string;
  poesessid?: string;
  message?: string;
  error?: string;
}

export interface AuthStatusResult {
  loggedIn: boolean;
  accountName: string;
}

export type SessionState =
  | 'valid'
  | 'expired'
  | 'cloudflareBlocked'
  | 'unconfigured'
  | 'networkError';

export interface SessionHealthInfo {
  state: SessionState;
  message: string;
  accountName?: string;
  lastCheckedEpochMs: number;
  hasPoesessid: boolean;
  hasCfClearance: boolean;
}
