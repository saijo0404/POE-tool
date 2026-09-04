import type { IStoragePort } from '../../application/ports/IStoragePort';
import { defaultStorage } from '../../infrastructure/storage/LocalStorageAdapter';

export type DeviceProfileMode = 'desktop' | 'steam-deck' | 'compact-hud';

export interface DeviceProfileConfig {
  mode: DeviceProfileMode;
  scaleFactor: number;
  touchTargetMinPx: number;
  fontSizeMultiplier: number;
  highContrastMode: boolean;
  overlayCompact: boolean;
}

export interface ViewportResolution {
  width: number;
  height: number;
}

export const DEVICE_PROFILE_STORAGE_KEY = 'poe_device_profile_mode';

const PROFILE_PRESETS: Record<DeviceProfileMode, DeviceProfileConfig> = {
  desktop: {
    mode: 'desktop',
    scaleFactor: 1.0,
    touchTargetMinPx: 32,
    fontSizeMultiplier: 1.0,
    highContrastMode: false,
    overlayCompact: false
  },
  'steam-deck': {
    mode: 'steam-deck',
    scaleFactor: 1.25,
    touchTargetMinPx: 48,
    fontSizeMultiplier: 1.15,
    highContrastMode: true,
    overlayCompact: false
  },
  'compact-hud': {
    mode: 'compact-hud',
    scaleFactor: 0.9,
    touchTargetMinPx: 36,
    fontSizeMultiplier: 0.95,
    highContrastMode: false,
    overlayCompact: true
  }
};

export function getProfileConfig(mode: DeviceProfileMode): DeviceProfileConfig {
  return { ...PROFILE_PRESETS[mode] };
}

export function detectSuggestedProfile(viewport: ViewportResolution): DeviceProfileMode {
  const { width, height } = viewport;
  const maxDim = Math.max(width, height);
  const minDim = Math.min(width, height);

  if (minDim < 600 || maxDim < 950) {
    return 'compact-hud';
  }
  if (maxDim <= 1366 && minDim <= 850) {
    return 'steam-deck';
  }
  return 'desktop';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function createDeviceProfileConfig(
  mode: DeviceProfileMode,
  overrides?: Partial<DeviceProfileConfig>
): DeviceProfileConfig {
  const base = getProfileConfig(mode);
  if (!overrides) return base;

  return {
    ...base,
    ...overrides,
    scaleFactor: clamp(overrides.scaleFactor ?? base.scaleFactor, 0.7, 2.0),
    touchTargetMinPx: clamp(overrides.touchTargetMinPx ?? base.touchTargetMinPx, 28, 64),
    fontSizeMultiplier: clamp(overrides.fontSizeMultiplier ?? base.fontSizeMultiplier, 0.8, 1.5)
  };
}

export function saveDeviceProfile(
  mode: DeviceProfileMode,
  storage: IStoragePort = defaultStorage
): void {
  storage.setItem(DEVICE_PROFILE_STORAGE_KEY, mode);
}

export function loadDeviceProfile(
  storage: IStoragePort = defaultStorage
): DeviceProfileMode {
  const saved = storage.getItem<string | null>(DEVICE_PROFILE_STORAGE_KEY, null);
  if (saved === 'steam-deck' || saved === 'compact-hud' || saved === 'desktop') {
    return saved;
  }
  return 'desktop';
}
