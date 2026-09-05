import { DEFAULT_BUILD_PRESETS } from './buildPresets';
import type { BuildPreset } from './types';

const STORAGE_KEY_SELECTED = 'poe_build_fit_selected_preset';
const STORAGE_KEY_CUSTOM = 'poe_build_fit_custom_presets';

export function getStoredSelectedPresetId(): string {
  if (typeof window === 'undefined' || !window.localStorage) return 'life_fire_rf';
  return window.localStorage.getItem(STORAGE_KEY_SELECTED) || 'life_fire_rf';
}

export function setStoredSelectedPresetId(id: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY_SELECTED, id);
}

export function getStoredCustomPresets(): BuildPreset[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_CUSTOM);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setStoredCustomPresets(presets: BuildPreset[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(presets));
}

export function getAllAvailablePresets(): BuildPreset[] {
  const custom = getStoredCustomPresets();
  return [...DEFAULT_BUILD_PRESETS, ...custom];
}
