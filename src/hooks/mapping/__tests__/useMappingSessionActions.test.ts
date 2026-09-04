import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMappingSessionActions } from '../useMappingSessionActions';
import type { MapRun } from '../../../domain/mapping/types';

describe('useMappingSessionActions Hook', () => {
  const defaultProps = {
    league: 'Settlers',
    divineRate: 150,
    sessionWallClockSeconds: 60,
    onShowToast: vi.fn(),
    onResetTimers: vi.fn()
  };

  it('should initialize with default session and calculate initial stats', () => {
    const { result } = renderHook(() => useMappingSessionActions(defaultProps));

    expect(result.current.sessions.length).toBeGreaterThan(0);
    expect(result.current.activeSession).toBeDefined();
    expect(result.current.stats.totalRuns).toBe(0);
  });

  it('should add runs and delete runs', () => {
    const { result } = renderHook(() => useMappingSessionActions(defaultProps));

    const mockRun: MapRun = {
      id: 'test_run_1',
      runNumber: 1,
      startTime: 1000,
      endTime: 2000,
      durationSeconds: 60,
      investment: {
        mapCostChaos: 10,
        scarabsCostChaos: 20,
        craftCostChaos: 0,
        otherCostChaos: 0,
        totalCostChaos: 30,
        totalCostDivine: 0.2
      },
      grossRevenueChaos: 180,
      grossRevenueDivine: 1.2,
      netProfitChaos: 150,
      netProfitDivine: 1.0,
      drops: [],
      tabNames: ['Dump 1']
    };

    act(() => {
      result.current.addMapRun(mockRun);
    });

    expect(result.current.activeSession.runs.length).toBe(1);
    expect(result.current.activeSession.runs[0].id).toBe('test_run_1');

    act(() => {
      result.current.handleDeleteRun('test_run_1');
    });

    expect(result.current.activeSession.runs.length).toBe(0);
    expect(defaultProps.onShowToast).toHaveBeenCalledWith('已刪除指定場次紀錄');
  });

  it('should create new session and reset timers', () => {
    const onResetTimers = vi.fn();
    const { result } = renderHook(() =>
      useMappingSessionActions({ ...defaultProps, onResetTimers })
    );

    act(() => {
      result.current.handleCreateSession('T17 打寶 Session', 'T17 劇毒');
    });

    expect(result.current.activeSession.name).toBe('T17 打寶 Session');
    expect(result.current.activeSession.strategyName).toBe('T17 劇毒');
    expect(onResetTimers).toHaveBeenCalled();
  });
});
