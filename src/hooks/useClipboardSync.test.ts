import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboardSync, type PoeItemCopiedPayload } from './useClipboardSync';
import { poeApi } from '../services/api';

const mockListen = vi.fn();

vi.mock('@tauri-apps/api/event', () => ({
  listen: (eventName: string, handler: unknown) => mockListen(eventName, handler)
}));

describe('useClipboardSync Hook Lifecycle & Boundary Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    delete (window as unknown as { __TAURI__?: unknown }).__TAURI__;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  describe('Web Browser Fallback Mode (Polling)', () => {
    it('polls clipboard and triggers onItemDetected when new item text arrives', async () => {
      const itemDetectedSpy = vi.fn();
      vi.spyOn(poeApi, 'getLatestClipboard').mockResolvedValue({
        text: '稀有度: 傳奇\n賭神芬多\n--------',
        timestamp: 1000
      });

      renderHook(() =>
        useClipboardSync({
          enabled: true,
          intervalMs: 500,
          onItemDetected: itemDetectedSpy
        })
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(poeApi.getLatestClipboard).toHaveBeenCalled();
      expect(itemDetectedSpy).toHaveBeenCalledWith('稀有度: 傳奇\n賭神芬多\n--------');
    });

    it('does not re-trigger onItemDetected if text has not changed', async () => {
      const itemDetectedSpy = vi.fn();
      vi.spyOn(poeApi, 'getLatestClipboard').mockResolvedValue({
        text: '稀有度: 傳奇\n賭神芬多\n--------',
        timestamp: 1000
      });

      renderHook(() =>
        useClipboardSync({
          enabled: true,
          intervalMs: 500,
          onItemDetected: itemDetectedSpy
        })
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(itemDetectedSpy).toHaveBeenCalledTimes(1);

      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(itemDetectedSpy).toHaveBeenCalledTimes(1);
    });

    it('does not poll when enabled is false', async () => {
      const itemDetectedSpy = vi.fn();
      const clipboardSpy = vi.spyOn(poeApi, 'getLatestClipboard');

      renderHook(() =>
        useClipboardSync({
          enabled: false,
          intervalMs: 500,
          onItemDetected: itemDetectedSpy
        })
      );

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(clipboardSpy).not.toHaveBeenCalled();
      expect(itemDetectedSpy).not.toHaveBeenCalled();
    });

    it('cleans up interval timer on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = renderHook(() =>
        useClipboardSync({
          enabled: true,
          intervalMs: 500,
          onItemDetected: vi.fn()
        })
      );

      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Tauri Desktop Push Mode (Event Listener)', () => {
    it('subscribes to poe-item-copied event without polling and handles payload object', async () => {
      (window as unknown as { __TAURI_INTERNALS__: Record<string, unknown> }).__TAURI_INTERNALS__ = {};
      const itemDetectedSpy = vi.fn();
      const clipboardSpy = vi.spyOn(poeApi, 'getLatestClipboard');

      type EventHandler = (event: { payload: PoeItemCopiedPayload | string }) => void;
      let eventCallback: EventHandler | null = null;
      const unlistenSpy = vi.fn();

      mockListen.mockImplementation((eventName: string, handler: EventHandler) => {
        if (eventName === 'poe-item-copied') {
          eventCallback = handler;
        }
        return Promise.resolve(unlistenSpy);
      });

      const { unmount } = renderHook(() =>
        useClipboardSync({
          enabled: true,
          intervalMs: 500,
          onItemDetected: itemDetectedSpy
        })
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockListen).toHaveBeenCalledWith('poe-item-copied', expect.any(Function));

      // Ensure no polling interval is running in desktop mode
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(clipboardSpy).not.toHaveBeenCalled();

      // Trigger event with payload object
      act(() => {
        if (eventCallback) {
          (eventCallback as EventHandler)({
            payload: {
              text: '稀有度: 傳奇\n獵頭\n--------',
              timestamp: 2000
            }
          });
        }
      });

      expect(itemDetectedSpy).toHaveBeenCalledWith('稀有度: 傳奇\n獵頭\n--------');

      // Trigger duplicate text
      act(() => {
        if (eventCallback) {
          (eventCallback as EventHandler)({
            payload: {
              text: '稀有度: 傳奇\n獵頭\n--------',
              timestamp: 3000
            }
          });
        }
      });
      expect(itemDetectedSpy).toHaveBeenCalledTimes(1);

      // Unmount should trigger unlisten
      unmount();
      expect(unlistenSpy).toHaveBeenCalled();
    });

    it('handles string event payload in Tauri mode', async () => {
      (window as unknown as { __TAURI_INTERNALS__: Record<string, unknown> }).__TAURI_INTERNALS__ = {};
      const itemDetectedSpy = vi.fn();

      type EventHandler = (event: { payload: string }) => void;
      let eventCallback: EventHandler | null = null;

      mockListen.mockImplementation((eventName: string, handler: EventHandler) => {
        if (eventName === 'poe-item-copied') {
          eventCallback = handler;
        }
        return Promise.resolve(vi.fn());
      });

      renderHook(() =>
        useClipboardSync({
          enabled: true,
          onItemDetected: itemDetectedSpy
        })
      );

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        if (eventCallback) {
          (eventCallback as EventHandler)({
            payload: '稀有度: 傳奇\n魔血\n--------'
          });
        }
      });

      expect(itemDetectedSpy).toHaveBeenCalledWith('稀有度: 傳奇\n魔血\n--------');
    });
  });
});
