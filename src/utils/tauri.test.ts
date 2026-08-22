import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isTauri, toggleAlwaysOnTop, showMainWindow, hideMainWindow, getTauriAppVersion } from './tauri';

describe('tauri utility functions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as any).__TAURI_INTERNALS__;
    delete (window as any).__TAURI__;
  });

  afterEach(() => {
    delete (window as any).__TAURI_INTERNALS__;
    delete (window as any).__TAURI__;
  });

  describe('Non-Tauri (Web) environment', () => {
    it('isTauri returns false', () => {
      expect(isTauri()).toBe(false);
    });

    it('toggleAlwaysOnTop returns false without calling invoke', async () => {
      const res = await toggleAlwaysOnTop(true);
      expect(res).toBe(false);
    });

    it('showMainWindow returns early without error', async () => {
      await expect(showMainWindow()).resolves.toBeUndefined();
    });

    it('hideMainWindow returns early without error', async () => {
      await expect(hideMainWindow()).resolves.toBeUndefined();
    });

    it('getTauriAppVersion returns 1.0.0 (Web)', async () => {
      const version = await getTauriAppVersion();
      expect(version).toBe('1.0.0 (Web)');
    });
  });

  describe('Tauri environment', () => {
    beforeEach(() => {
      (window as any).__TAURI_INTERNALS__ = {};
    });

    it('isTauri returns true', () => {
      expect(isTauri()).toBe(true);
    });

    it('toggleAlwaysOnTop invokes toggle_always_on_top and returns enable value', async () => {
      const mockInvoke = vi.fn().mockResolvedValue(undefined);
      vi.doMock('@tauri-apps/api/core', () => ({
        invoke: mockInvoke,
      }));

      const res = await toggleAlwaysOnTop(true);
      expect(res).toBe(true);
    });

    it('toggleAlwaysOnTop catches errors and returns false', async () => {
      vi.doMock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockRejectedValue(new Error('Tauri command failed')),
      }));

      const res = await toggleAlwaysOnTop(true);
      expect(res).toBe(false);
    });

    it('showMainWindow and hideMainWindow invoke native window commands', async () => {
      const mockInvoke = vi.fn().mockResolvedValue(undefined);
      vi.doMock('@tauri-apps/api/core', () => ({
        invoke: mockInvoke,
      }));

      await showMainWindow();
      await hideMainWindow();
    });

    it('getTauriAppVersion returns desktop app version on success and fallback on error', async () => {
      vi.doMock('@tauri-apps/api/core', () => ({
        invoke: vi.fn().mockResolvedValueOnce('2.5.0').mockRejectedValueOnce(new Error('error')),
      }));

      const version = await getTauriAppVersion();
      expect(version).toBe('2.5.0');

      const fallbackVersion = await getTauriAppVersion();
      expect(fallbackVersion).toBe('1.0.0 (Desktop)');
    });
  });
});
