import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToastNotification } from '../useToastNotification';

describe('useToastNotification Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with null toastMsg', () => {
    const { result } = renderHook(() => useToastNotification());
    expect(result.current.toastMsg).toBeNull();
  });

  it('sets toast message and auto-dismisses after duration', () => {
    const { result } = renderHook(() => useToastNotification(2000));

    act(() => {
      result.current.showToast('Test Toast Notification');
    });

    expect(result.current.toastMsg).toBe('Test Toast Notification');

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.toastMsg).toBe('Test Toast Notification');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.toastMsg).toBeNull();
  });

  it('resets timer when showToast is called consecutively', () => {
    const { result } = renderHook(() => useToastNotification(2000));

    act(() => {
      result.current.showToast('First Message');
    });
    expect(result.current.toastMsg).toBe('First Message');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.showToast('Second Message');
    });
    expect(result.current.toastMsg).toBe('Second Message');

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.toastMsg).toBe('Second Message');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.toastMsg).toBeNull();
  });

  it('clears toast immediately on clearToast', () => {
    const { result } = renderHook(() => useToastNotification(3000));

    act(() => {
      result.current.showToast('Immediate Clear');
    });
    expect(result.current.toastMsg).toBe('Immediate Clear');

    act(() => {
      result.current.clearToast();
    });
    expect(result.current.toastMsg).toBeNull();
  });
});
