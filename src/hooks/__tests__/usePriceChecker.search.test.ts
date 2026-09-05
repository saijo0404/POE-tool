import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePriceChecker } from '../usePriceChecker';
import { poeApi } from '../../services/api';
import { mockParsedItem, mockTradeResult } from './priceCheckerMocks';

describe('usePriceChecker - Search & Lifecycle Suite', () => {
  const onShowToast = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('resets state when rawText is empty or cleared', async () => {
    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    expect(result.current.rawText).toBe('');
    expect(result.current.parsedItem).toBeNull();
    expect(result.current.tradeResults).toBeNull();
  });

  it('automatically parses item and triggers trade search on text input', async () => {
    vi.spyOn(poeApi, 'parseItem').mockResolvedValue(mockParsedItem);
    vi.spyOn(poeApi, 'searchTrade').mockResolvedValue(mockTradeResult);

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      result.current.setRawText('Rarity: Unique\nHeadhunter\nLeather Belt');
    });

    await waitFor(() => {
      expect(result.current.parsedItem).toEqual(mockParsedItem);
      expect(result.current.linksMin).toBe(6);
      expect(result.current.corruptedFilter).toBe(true);
      expect(result.current.tradeResults).toEqual(mockTradeResult);
    });
  });

  it('handles pagination (load more) and deduplicates listings', async () => {
    vi.spyOn(poeApi, 'parseItem').mockResolvedValue(mockParsedItem);
    vi.spyOn(poeApi, 'searchTrade')
      .mockResolvedValueOnce(mockTradeResult)
      .mockResolvedValueOnce({
        id: 'search-headhunter',
        total: 25,
        estimatedMinPriceDivine: 45,
        estimatedMinPriceChaos: 7200,
        estimatedMedianPriceDivine: 50,
        estimatedMedianPriceChaos: 8000,
        tradeUrl: 'https://trade.url',
        listings: [
          mockTradeResult.listings[0],
          {
            id: 'list-2',
            indexed: '2026-08-20T12:00:00Z',
            onlineStatus: 'online',
            priceAmount: 48,
            priceCurrency: 'divine',
            priceInChaos: 7680,
            priceInDivine: 48,
            whisper: '@Player2 Hi',
            accountName: 'Seller2',
            item: {
              name: 'Headhunter',
              typeLine: 'Leather Belt',
              icon: ''
            },
          }
        ]
      });

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      result.current.setRawText('Rarity: Unique\nHeadhunter\nLeather Belt');
    });

    await waitFor(() => {
      expect(result.current.tradeResults?.listings.length).toBe(1);
    });

    await act(async () => {
      await result.current.handleLoadMore();
    });

    expect(result.current.tradeResults?.listings.length).toBe(2);
  });

  it('manages recent search items in localStorage', async () => {
    vi.spyOn(poeApi, 'parseItem').mockResolvedValue(mockParsedItem);
    vi.spyOn(poeApi, 'searchTrade').mockResolvedValue(mockTradeResult);

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      result.current.setRawText('Rarity: Unique\nHeadhunter\nLeather Belt');
    });

    await waitFor(() => {
      expect(result.current.tradeResults).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleSearchTrade();
    });

    expect(result.current.recentSearches.length).toBe(1);
    expect(result.current.recentSearches[0].name).toBe('Headhunter');

    act(() => {
      result.current.handleSelectRecentSearch(result.current.recentSearches[0]);
    });

    act(() => {
      result.current.handleClearRecentSearches();
    });
    expect(result.current.recentSearches.length).toBe(0);
  });

  it('copies whisper text and sets copied state', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      await result.current.handleCopyWhisper(mockTradeResult.listings[0]);
    });

    expect(writeTextMock).toHaveBeenCalledWith('@Player Hi, I want to buy your Headhunter');
    expect(result.current.copiedId).toBe('list-1');
  });

  it('captures 403 and Cloudflare errors into authError and allows clearing', async () => {
    vi.spyOn(poeApi, 'parseItem').mockResolvedValue(mockParsedItem);
    vi.spyOn(poeApi, 'searchTrade').mockRejectedValueOnce(
      new Error('[CLOUDFLARE_CHALLENGE] 遭遇官方 Cloudflare WAF / Turnstile 安全驗證 (403)')
    );

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      result.current.setRawText('Rarity: Unique\nHeadhunter\nLeather Belt');
    });

    await waitFor(() => {
      expect(result.current.authError).toContain('CLOUDFLARE_CHALLENGE');
      expect(onShowToast).toHaveBeenCalled();
    });

    act(() => {
      result.current.clearAuthError();
    });
    expect(result.current.authError).toBeNull();
  });
});
