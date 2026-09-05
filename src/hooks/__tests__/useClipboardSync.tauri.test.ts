import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboardSync, type PoeItemCopiedPayload } from '../useClipboardSync';
import { poeApi } from '../../services/api';

const mockListen = vi.fn();

vi.mock('@tauri-apps/api/event', () => ({
  listen: (eventName: string, handler: unknown) => mockListen(eventName, handler)
}));

describe('useClipboardSync - Tauri Desktop Push Mode', () => {
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

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(clipboardSpy).not.toHaveBeenCalled();

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
