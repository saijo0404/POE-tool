import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboardSync } from '../useClipboardSync';
import { poeApi } from '../../services/api';

describe('useClipboardSync - Web Polling Mode', () => {
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
