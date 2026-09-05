import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOverlayPrice } from '../useOverlayPrice';
import { poeApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  poeApi: {
    parseItem: vi.fn(),
    searchTrade: vi.fn(),
    hideOverlayWindow: vi.fn(),
    setOverlayClickThrough: vi.fn(),
    createTradeSearchUrl: vi.fn(),
    travelToHideout: vi.fn()
  }
}));

vi.mock('../useSettings', () => ({
  useSettings: () => ({
    settings: {
      overlayEnabled: true,
      overlayOpacity: 0.9,
      overlayScale: 1.0,
      overlayClickThrough: false,
      overlayAutoCloseOnBlur: true
    },
    activeLeague: 'Standard'
  })
}));

describe('useOverlayPrice Hook', () => {
  it('initializes with default overlay settings', () => {
    const { result } = renderHook(() => useOverlayPrice());

    expect(result.current.opacity).toBe(0.9);
    expect(result.current.scale).toBe(1.0);
    expect(result.current.clickThrough).toBe(false);
    expect(result.current.parsedItem).toBeNull();
  });

  it('parses item text and triggers trade search automatically', async () => {
    const mockParsed = {
      name: '魔血',
      baseType: '重革腰帶',
      rarity: 'Unique' as const,
      language: 'zh' as const,
      implicits: [],
      explicits: [],
      rawText: 'mock'
    };

    const mockSearchResults = {
      id: 'search-1',
      total: 10,
      listings: [],
      estimatedMinPriceChaos: 100,
      estimatedMinPriceDivine: 1,
      estimatedMedianPriceChaos: 150,
      estimatedMedianPriceDivine: 1.5
    };

    vi.mocked(poeApi.parseItem).mockResolvedValue(mockParsed);
    vi.mocked(poeApi.searchTrade).mockResolvedValue(mockSearchResults);

    const { result } = renderHook(() => useOverlayPrice());

    await act(async () => {
      await result.current.loadAndParseItem('稀有度: 傳奇\n魔血\n重革腰帶');
    });

    expect(poeApi.parseItem).toHaveBeenCalledWith('稀有度: 傳奇\n魔血\n重革腰帶');
    expect(poeApi.searchTrade).toHaveBeenCalled();
    expect(result.current.parsedItem).toEqual(mockParsed);
    expect(result.current.tradeResults).toEqual(mockSearchResults);
  });

  it('calls hideOverlayWindow when handleCloseOverlay is invoked', async () => {
    const { result } = renderHook(() => useOverlayPrice());

    await act(async () => {
      await result.current.handleCloseOverlay();
    });

    expect(poeApi.hideOverlayWindow).toHaveBeenCalled();
  });

  it('passes PoE 2 engine and dedicated filters to searchTrade for PoE 2 items', async () => {
    const mockPoe2Parsed = {
      name: '尋路石 (階級 15)',
      baseType: '尋路石 (階級 15)',
      rarity: 'Normal' as const,
      language: 'zh' as const,
      implicits: [],
      explicits: [],
      rawText: 'mock poe2',
      engine: 'poe2' as const,
      waystoneTier: 15,
      spirit: 50,
      runeSockets: 'S S'
    };

    vi.mocked(poeApi.parseItem).mockResolvedValue(mockPoe2Parsed);
    vi.mocked(poeApi.searchTrade).mockResolvedValue({
      id: 'poe2-search',
      total: 5,
      listings: [],
      estimatedMinPriceChaos: 50,
      estimatedMinPriceDivine: 0.5,
      estimatedMedianPriceChaos: 60,
      estimatedMedianPriceDivine: 0.6
    });

    const { result } = renderHook(() => useOverlayPrice());

    await act(async () => {
      await result.current.loadAndParseItem('物品種類: 尋路石\n稀有度: 普通\n尋路石 (階級 15)');
    });

    expect(poeApi.searchTrade).toHaveBeenCalledWith(
      expect.objectContaining({
        engine: 'poe2',
        waystoneTierMin: 15,
        spiritMin: 50,
        runeSocketsMin: 2
      })
    );
  });
});
