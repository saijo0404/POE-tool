import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMappingTimers } from '../useMappingTimers';

describe('useMappingTimers Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default timer state and 0 session wall clock', () => {
    const { result } = renderHook(() => useMappingTimers());

    expect(result.current.timerState.status).toBe('idle');
    expect(result.current.timerState.elapsedSeconds).toBe(0);
    expect(result.current.sessionWallClockSeconds).toBe(0);
  });

  it('should tick session wall clock timer', () => {
    const { result } = renderHook(() => useMappingTimers());

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.sessionWallClockSeconds).toBe(3);
  });

  it('should handle pause, resume, reset', () => {
    const { result } = renderHook(() => useMappingTimers());

    act(() => {
      result.current.setTimerState(prev => ({ ...prev, status: 'running' }));
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.timerState.elapsedSeconds).toBe(2);

    act(() => {
      result.current.handlePauseMap();
    });
    expect(result.current.timerState.status).toBe('paused');

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.timerState.elapsedSeconds).toBe(2);

    act(() => {
      result.current.handleResumeMap();
    });
    expect(result.current.timerState.status).toBe('running');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timerState.elapsedSeconds).toBe(3);

    act(() => {
      result.current.handleResetTimer();
    });
    expect(result.current.timerState.status).toBe('idle');
    expect(result.current.timerState.elapsedSeconds).toBe(0);
  });
});
