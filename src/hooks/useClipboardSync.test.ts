import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboardSync } from './useClipboardSync';
import { poeApi } from '../services/api';

describe('useClipboardSync Hook Lifecycle & Boundary Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
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

    // Fast-forward timer by 500ms
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(poeApi.getLatestClipboard).toHaveBeenCalled();
    expect(itemDetectedSpy).toHaveBeenCalledWith('稀有度: 傳奇\n賭神芬多\n--------');
  });

  it('does not re-trigger onItemDetected if timestamp has not changed', async () => {
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

    // Advance another 500ms with same timestamp
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
