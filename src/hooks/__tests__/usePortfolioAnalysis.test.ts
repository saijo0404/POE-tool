import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePortfolioAnalysis } from '../usePortfolioAnalysis';
import type { WealthSnapshot } from '../../types/poe';

describe('usePortfolioAnalysis', () => {
  const onShowToast = vi.fn();

  const mockSnapshots: WealthSnapshot[] = [
    {
      timestamp: '2026-08-20T10:00:00Z',
      league: 'Settlers',
      totalChaos: 1000,
      totalDivine: 6.7,
      chaosRate: 150,
      tabSummaries: [],
      topItems: []
    },
    {
      timestamp: '2026-08-25T10:00:00Z',
      league: 'Settlers',
      totalChaos: 4500,
      totalDivine: 30,
      chaosRate: 150,
      tabSummaries: [],
      topItems: [
        {
          id: 'div-1',
          name: 'Divine Orb',
          typeLine: 'Divine Orb',
          icon: '',
          category: 'Currency',
          tabName: 'Currency',
          unitPriceChaos: 150,
          totalPriceChaos: 3000,
          unitPriceDivine: 1,
          totalPriceDivine: 20,
          stackSize: 20
        },
        {
          id: 'card-1',
          name: 'The Doctor',
          typeLine: 'The Doctor',
          icon: '',
          category: 'DivCard',
          tabName: 'Cards',
          unitPriceChaos: 1500,
          totalPriceChaos: 1500,
          unitPriceDivine: 10,
          totalPriceDivine: 10,
          stackSize: 1
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('initializes with calculated allocations and net worth timeline', () => {
    const { result } = renderHook(() =>
      usePortfolioAnalysis({
        snapshots: mockSnapshots,
        latestSnapshot: mockSnapshots[1],
        divineRate: 150,
        league: 'Settlers',
        onShowToast
      })
    );

    expect(result.current.categoryAllocations.length).toBe(2);
    expect(result.current.analysisResult.totalChaos).toBe(4500);
    expect(result.current.analysisResult.totalDivine).toBe(30);
    expect(result.current.timeline.length).toBe(2);
  });

  it('allows changing timeframe and selected category', () => {
    const { result } = renderHook(() =>
      usePortfolioAnalysis({
        snapshots: mockSnapshots,
        latestSnapshot: mockSnapshots[1],
        divineRate: 150,
        onShowToast
      })
    );

    act(() => {
      result.current.setSelectedCategory('DivCard');
    });
    expect(result.current.selectedCategory).toBe('DivCard');
    expect(result.current.selectedCategoryAllocation?.category).toBe('DivCard');

    act(() => {
      result.current.setTimeframe('7d');
    });
    expect(result.current.timeframe).toBe('7d');
  });

  it('copies exports to clipboard and triggers toasts', async () => {
    const { result } = renderHook(() =>
      usePortfolioAnalysis({
        snapshots: mockSnapshots,
        latestSnapshot: mockSnapshots[1],
        divineRate: 150,
        onShowToast
      })
    );

    await act(async () => {
      await result.current.handleCopyMarkdown();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('Markdown'));

    await act(async () => {
      await result.current.handleCopyCSV();
    });
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('CSV'));

    await act(async () => {
      await result.current.handleCopyDiscord();
    });
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('Discord'));
  });
});
