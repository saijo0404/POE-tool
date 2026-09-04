import { useState, useEffect, useCallback } from 'react';
import {
  type DeviceProfileMode,
  type DeviceProfileConfig,
  getProfileConfig,
  detectSuggestedProfile,
  saveDeviceProfile,
  loadDeviceProfile
} from '../domain/platform/deviceProfile';
import type { IStoragePort } from '../application/ports/IStoragePort';
import { defaultStorage } from '../infrastructure/storage/LocalStorageAdapter';

export interface UseDeviceProfileResult {
  mode: DeviceProfileMode;
  config: DeviceProfileConfig;
  suggestedMode: DeviceProfileMode;
  setMode: (mode: DeviceProfileMode) => void;
  isCustomized: boolean;
}

function applyDomProperties(config: DeviceProfileConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--touch-target-min-size', `${config.touchTargetMinPx}px`);
  root.style.setProperty('--app-scale-factor', `${config.scaleFactor}`);
  root.style.setProperty('--font-size-multiplier', `${config.fontSizeMultiplier}`);

  if (config.highContrastMode) {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }

  if (config.overlayCompact) {
    root.setAttribute('data-compact-hud', 'true');
  } else {
    root.removeAttribute('data-compact-hud');
  }
}

export function useDeviceProfile(storage: IStoragePort = defaultStorage): UseDeviceProfileResult {
  const [mode, setModeState] = useState<DeviceProfileMode>(() => loadDeviceProfile(storage));
  const [suggestedMode, setSuggestedMode] = useState<DeviceProfileMode>('desktop');

  const checkViewport = useCallback(() => {
    if (typeof window !== 'undefined') {
      const suggested = detectSuggestedProfile({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setSuggestedMode(suggested);
    }
  }, []);

  useEffect(() => {
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [checkViewport]);

  const setMode = useCallback((newMode: DeviceProfileMode) => {
    setModeState(newMode);
    saveDeviceProfile(newMode, storage);
  }, [storage]);

  const config = getProfileConfig(mode);

  useEffect(() => {
    applyDomProperties(config);
  }, [config]);

  return {
    mode,
    config,
    suggestedMode,
    setMode,
    isCustomized: mode !== 'desktop'
  };
}
