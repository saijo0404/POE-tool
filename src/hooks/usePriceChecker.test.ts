import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePriceChecker, formatModText } from './usePriceChecker';
import { poeApi } from '../services/api';
import type { ParsedItem, TradeSearchResult } from '../types/poe';

describe('formatModText helper', () => {
  it('formats various mod representations', () => {
    expect(formatModText(null)).toBe('');
    expect(formatModText(undefined)).toBe('');
    expect(formatModText('+50 to Life')).toBe('+50 to Life');
    expect(formatModText({ text: '+10 to Str' })).toBe('+10 to Str');
    expect(formatModText({ name: '+20 to Dex' })).toBe('+20 to Dex');
    expect(formatModText({ description: '+30 to Int' })).toBe('+30 to Int');
    expect(formatModText({ mods: [{ text: 'Mod1' }, { text: 'Mod2' }] })).toBe('Mod1, Mod2');
    expect(formatModText({ id: 'mod.id' })).toBe('mod.id');
    expect(formatModText(123)).toBe('123');
  });
});

describe('usePriceChecker Hook', () => {
  const onShowToast = vi.fn();

  const mockParsedItem: ParsedItem = {
    name: 'Headhunter',
    baseType: 'Leather Belt',
    rarity: 'Unique',
    sockets: 'W-W-W-W-W-W',
    corrupted: true,
    itemLevel: 85,
    language: 'en',
    rawText: 'Rarity: Unique\nHeadhunter\nLeather Belt',
    implicits: [
      { id: 'implicit.life', text: '+40 to maximum Life', englishText: '+40 to maximum Life', value: 40, type: 'implicit', enabled: true }
    ],
    explicits: [
      { id: 'explicit.dex', text: '+50 to Dexterity', englishText: '+50 to Dexterity', value: 50, type: 'explicit', enabled: true },
      { id: 'explicit.minor', text: 'increased stun and block recovery', englishText: 'increased stun and block recovery', value: 20, type: 'explicit', enabled: true }
    ]
  };

  const mockTradeResult: TradeSearchResult = {
    id: 'search-headhunter',
    total: 25,
    estimatedMinPriceDivine: 45,
    estimatedMinPriceChaos: 7200,
    estimatedMedianPriceDivine: 50,
    estimatedMedianPriceChaos: 8000,
    tradeUrl: 'https://trade.url',
    listings: [
      {
        id: 'list-1',
        indexed: '2026-08-20T12:00:00Z',
        onlineStatus: 'online',
        priceAmount: 45,
        priceCurrency: 'divine',
        priceInChaos: 7200,
        priceInDivine: 45,
        whisper: '@Player Hi, I want to buy your Headhunter',
        accountName: 'Seller1',
        item: {
          name: 'Headhunter',
          typeLine: 'Leather Belt',
          icon: ''
        },
      }
    ]
  };

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
      expect(result.current.linksMin).toBe(6); // Sockets: W-W-W-W-W-W
      expect(result.current.corruptedFilter).toBe(true);
      expect(result.current.tradeResults).toEqual(mockTradeResult);
    });
  });

  it('handles mod toggles and adjusts min/max calculation values', async () => {
    vi.spyOn(poeApi, 'parseItem').mockResolvedValue(mockParsedItem);
    vi.spyOn(poeApi, 'searchTrade').mockResolvedValue(mockTradeResult);

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      result.current.setRawText('Rarity: Unique\nHeadhunter\nLeather Belt');
    });

    await waitFor(() => {
      expect(result.current.mods.length).toBeGreaterThan(0);
    });

    // Toggle mod 0
    act(() => {
      result.current.handleToggleMod(0);
    });
    expect(result.current.mods[0].enabled).toBe(true);

    // Change Min Value
    act(() => {
      result.current.handleChangeMinValue(0, 35);
    });
    expect(result.current.mods[0].minValue).toBe(35);

    // Change Max Value
    act(() => {
      result.current.handleChangeMaxValue(0, 60);
    });
    expect(result.current.mods[0].maxValue).toBe(60);
  });

  it('supports adding and removing custom mods', async () => {
    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    act(() => {
      result.current.handleAddCustomMod({
        text: '+100 to Maximum Life',
        value: 100,
        minValue: 85,
      });
    });

    expect(result.current.mods.length).toBe(1);
    expect(result.current.mods[0].text).toBe('+100 to Maximum Life');
    expect(result.current.mods[0].minValue).toBe(85);

    act(() => {
      result.current.handleRemoveMod(0);
    });
    expect(result.current.mods.length).toBe(0);
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
          mockTradeResult.listings[0], // Duplicate listing
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

    // Manually trigger search to store in recent searches
    await act(async () => {
      await result.current.handleSearchTrade();
    });

    expect(result.current.recentSearches.length).toBe(1);
    expect(result.current.recentSearches[0].name).toBe('Headhunter');

    // Select recent search item
    act(() => {
      result.current.handleSelectRecentSearch(result.current.recentSearches[0]);
    });

    // Clear recent searches
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
