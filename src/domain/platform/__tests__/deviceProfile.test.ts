import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProfileConfig,
  detectSuggestedProfile,
  createDeviceProfileConfig,
  saveDeviceProfile,
  loadDeviceProfile
} from '../deviceProfile';
import type { IStoragePort } from '../../../application/ports/IStoragePort';

class MockStorage implements IStoragePort {
  private store = new Map<string, unknown>();

  getItem<T>(key: string, defaultValue: T): T {
    const val = this.store.get(key);
    return val !== undefined ? (val as T) : defaultValue;
  }

  setItem<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('deviceProfile (Issue #110)', () => {
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
  });

  it('returns appropriate default config for each profile mode', () => {
    const desktop = getProfileConfig('desktop');
    expect(desktop.mode).toBe('desktop');
    expect(desktop.scaleFactor).toBe(1.0);
    expect(desktop.touchTargetMinPx).toBe(32);
    expect(desktop.highContrastMode).toBe(false);

    const steamDeck = getProfileConfig('steam-deck');
    expect(steamDeck.mode).toBe('steam-deck');
    expect(steamDeck.scaleFactor).toBe(1.25);
    expect(steamDeck.touchTargetMinPx).toBe(48);
    expect(steamDeck.highContrastMode).toBe(true);
    expect(steamDeck.overlayCompact).toBe(false);

    const compact = getProfileConfig('compact-hud');
    expect(compact.mode).toBe('compact-hud');
    expect(compact.scaleFactor).toBe(0.9);
    expect(compact.overlayCompact).toBe(true);
  });

  it('detects suggested profile based on viewport resolution', () => {
    // Steam Deck native 1280x800 (16:10)
    expect(detectSuggestedProfile({ width: 1280, height: 800 })).toBe('steam-deck');
    // Steam Deck portrait or similar handheld
    expect(detectSuggestedProfile({ width: 800, height: 1280 })).toBe('steam-deck');
    // Standard Desktop 1080p
    expect(detectSuggestedProfile({ width: 1920, height: 1080 })).toBe('desktop');
    // Ultra-wide Desktop
    expect(detectSuggestedProfile({ width: 2560, height: 1440 })).toBe('desktop');
    // Very small screen / mini-window
    expect(detectSuggestedProfile({ width: 900, height: 500 })).toBe('compact-hud');
  });

  it('allows custom overrides and clamps values safely', () => {
    const custom = createDeviceProfileConfig('steam-deck', {
      scaleFactor: 3.5, // should clamp to max 2.0
      touchTargetMinPx: 10 // should clamp to min 28
    });

    expect(custom.scaleFactor).toBe(2.0);
    expect(custom.touchTargetMinPx).toBe(28);
    expect(custom.highContrastMode).toBe(true);
  });

  it('saves and loads device profile mode to storage', () => {
    expect(loadDeviceProfile(storage)).toBe('desktop');

    saveDeviceProfile('steam-deck', storage);
    expect(loadDeviceProfile(storage)).toBe('steam-deck');

    saveDeviceProfile('compact-hud', storage);
    expect(loadDeviceProfile(storage)).toBe('compact-hud');
  });
});
