import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFaustusExchange } from '../useFaustusExchange';
import { poeApi } from '../../services/api';
import { createDefaultExchangeOverview } from '../../domain/exchange/defaultOverview';

vi.mock('../../services/api', () => ({
  poeApi: {
    getFaustusExchangeOverview: vi.fn(),
  },
}));

describe('useFaustusExchange Hook', () => {
  const mockOverview = createDefaultExchangeOverview('Settlers');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(poeApi.getFaustusExchangeOverview).mockResolvedValue(mockOverview);
  });

  it('fetches market overview on mount and sets items', async () => {
    const { result } = renderHook(() => useFaustusExchange({ league: 'Settlers' }));

    expect(result.current.loading).toBe(true);
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.marketData?.totalItems).toBe(mockOverview.totalItems);
    expect(result.current.filteredItems.length).toBeGreaterThan(0);
    expect(result.current.rates.divineChaosRate).toBe(mockOverview.divineChaosRate);
  });

  it('filters items by category and search query correctly', async () => {
    const { result } = renderHook(() => useFaustusExchange({ league: 'Settlers' }));
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setFilter((prev) => ({ ...prev, category: 'Currency' }));
    });
    expect(result.current.filteredItems.every((it) => it.category === 'Currency')).toBe(true);

    act(() => {
      result.current.setFilter((prev) => ({ ...prev, searchQuery: '神聖石' }));
    });
    expect(result.current.filteredItems.length).toBe(1);
    expect(result.current.filteredItems[0].name).toBe('Divine Orb');
  });

  it('computes gold fee calculation when item and quantity change', async () => {
    const { result } = renderHook(() => useFaustusExchange({ league: 'Settlers' }));
    await act(async () => {
      await Promise.resolve();
    });

    const divineItem = mockOverview.items.find((it) => it.name === 'Divine Orb');
    expect(divineItem).toBeDefined();

    act(() => {
      result.current.setSelectedItemForGoldCalc(divineItem || null);
      result.current.setGoldCalcQuantity(5);
    });

    expect(result.current.goldFeeCalculation).not.toBeNull();
    expect(result.current.goldFeeCalculation?.totalGoldFee).toBe(5 * 1250);
  });
});
