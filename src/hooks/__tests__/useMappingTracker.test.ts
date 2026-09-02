import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMappingTracker } from '../useMappingTracker';
import { poeApi } from '../../services/api';
import type { WealthSnapshot } from '../../types/poe';

vi.mock('../../services/api', () => ({
  poeApi: {
    getStashTabs: vi.fn().mockResolvedValue([{ i: 0, id: 'tab0', n: 'Dump 1', type: 'NormalStash' }]),
    takeWealthSnapshot: vi.fn()
  }
}));

describe('useMappingTracker', () => {
  const onShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('should initialize with default session and idle timer state', () => {
    const { result } = renderHook(() =>
      useMappingTracker({ league: 'Settlers', divineRate: 150, onShowToast })
    );

    expect(result.current.sessions.length).toBeGreaterThan(0);
    expect(result.current.activeSession).toBeDefined();
    expect(result.current.timerState.status).toBe('idle');
    expect(result.current.timerState.elapsedSeconds).toBe(0);
  });

  it('should handle timer state transitions (start, pause, resume, reset)', async () => {
    const mockSnapA: WealthSnapshot = {
      timestamp: new Date().toISOString(),
      league: 'Settlers',
      totalChaos: 100,
      totalDivine: 0.67,
      chaosRate: 150,
      tabSummaries: [],
      topItems: [],
      allItems: []
    };
    vi.mocked(poeApi.takeWealthSnapshot).mockResolvedValue(mockSnapA);

    const { result } = renderHook(() =>
      useMappingTracker({ league: 'Settlers', divineRate: 150, onShowToast })
    );

    await act(async () => {
      await result.current.handleStartMap();
    });
    expect(result.current.timerState.status).toBe('running');
    expect(result.current.snapshotA).toEqual(mockSnapA);

    act(() => {
      result.current.handlePauseMap();
    });
    expect(result.current.timerState.status).toBe('paused');

    act(() => {
      result.current.handleResumeMap();
    });
    expect(result.current.timerState.status).toBe('running');

    act(() => {
      result.current.handleResetTimer();
    });
    expect(result.current.timerState.status).toBe('idle');
    expect(result.current.timerState.elapsedSeconds).toBe(0);
  });

  it('should finish map, calculate deltas and record new MapRun', async () => {
    const mockSnapA: WealthSnapshot = {
      timestamp: new Date().toISOString(),
      league: 'Settlers',
      totalChaos: 100,
      totalDivine: 0.67,
      chaosRate: 150,
      tabSummaries: [],
      topItems: [],
      allItems: [
        {
          id: '1',
          name: 'Divine Orb',
          typeLine: 'Divine Orb',
          icon: '',
          stackSize: 1,
          tabName: '倉庫: Dump 1',
          category: 'Currency',
          unitPriceChaos: 150,
          totalPriceChaos: 150,
          unitPriceDivine: 1,
          totalPriceDivine: 1
        }
      ]
    };

    const mockSnapB: WealthSnapshot = {
      timestamp: new Date().toISOString(),
      league: 'Settlers',
      totalChaos: 400,
      totalDivine: 2.67,
      chaosRate: 150,
      tabSummaries: [],
      topItems: [],
      allItems: [
        {
          id: '1',
          name: 'Divine Orb',
          typeLine: 'Divine Orb',
          icon: '',
          stackSize: 3,
          tabName: '倉庫: Dump 1',
          category: 'Currency',
          unitPriceChaos: 150,
          totalPriceChaos: 450,
          unitPriceDivine: 1,
          totalPriceDivine: 3
        }
      ]
    };

    vi.mocked(poeApi.takeWealthSnapshot)
      .mockResolvedValueOnce(mockSnapA)
      .mockResolvedValueOnce(mockSnapB);

    const { result } = renderHook(() =>
      useMappingTracker({ league: 'Settlers', divineRate: 150, onShowToast })
    );

    await act(async () => {
      await result.current.handleStartMap();
    });

    await act(async () => {
      await result.current.handleFinishAndSettle();
    });

    expect(result.current.activeSession.runs).toHaveLength(1);
    const run = result.current.activeSession.runs[0];
    expect(run.runNumber).toBe(1);
    expect(run.grossRevenueChaos).toBe(300); // 2 Divine difference = 300 chaos
    expect(run.drops).toHaveLength(1);
    expect(run.drops[0].deltaCount).toBe(2);
  });

  it('should allow deleting runs and creating sessions', () => {
    const { result } = renderHook(() =>
      useMappingTracker({ league: 'Settlers', divineRate: 150, onShowToast })
    );

    act(() => {
      result.current.handleCreateSession('Juiced Dunes Farm', '軍團拓荒');
    });

    expect(result.current.activeSession.name).toBe('Juiced Dunes Farm');
    expect(result.current.activeSession.strategyName).toBe('軍團拓荒');

    act(() => {
      result.current.handleUpdateSelectedTabs(['Dump 1', 'Dump 2']);
    });
    expect(result.current.activeSession.selectedTabNames).toEqual(['Dump 1', 'Dump 2']);
  });
});
