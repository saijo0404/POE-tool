import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildCalculator } from '../BuildCalculator';
import { poeApi } from '../../services/api';

describe('BuildCalculator Component', () => {
  const defaultProps = {
    league: 'Settlers',
    onShowToast: vi.fn(),
  };

  const mockBuildResult = {
    character: {
      account: 'TestAccount',
      name: 'SlayerGod',
      league: 'Settlers',
      level: 98,
      class: 'Duelist',
      ascendancy: 'Slayer',
    },
    totalChaos: 32000,
    totalDivine: 200,
    divineChaosRate: 160,
    categories: {
      equipment: {
        totalChaos: 20000,
        totalDivine: 125,
        items: [
          {
            name: 'Mageblood',
            typeLine: 'Heavy Belt',
            category: 'equipment' as const,
            rarity: 'Unique',
            icon: '',
            slot: 'Belt',
            priceChaos: 16000,
            priceDivine: 100,
            confidence: 'high' as const,
            tradeQueryJson: '{"name":"Mageblood"}',
          },
          {
            name: 'Starforge',
            typeLine: 'Infernal Sword',
            category: 'equipment' as const,
            rarity: 'Unique',
            icon: '',
            slot: 'Weapon',
            priceChaos: 4000,
            priceDivine: 25,
            confidence: 'medium' as const,
            tradeSearchUrl: 'https://trade.search/starforge',
          }
        ]
      },
      gems: {
        totalChaos: 8000,
        totalDivine: 50,
        items: [
          {
            name: 'Awakened Multistrike Support',
            typeLine: 'Support Gem',
            category: 'gem' as const,
            rarity: 'Gem',
            icon: '',
            priceChaos: 8000,
            priceDivine: 50,
            confidence: 'high' as const,
          }
        ]
      },
      flasks: {
        totalChaos: 2000,
        totalDivine: 12.5,
        items: [
          {
            name: 'Progenesis',
            typeLine: 'Amethyst Flask',
            category: 'flask' as const,
            rarity: 'Unique',
            icon: '',
            priceChaos: 2000,
            priceDivine: 12.5,
            confidence: 'high' as const,
          }
        ]
      },
      jewels: {
        totalChaos: 2000,
        totalDivine: 12.5,
        items: [
          {
            name: 'Watcher\'s Eye',
            typeLine: 'Prismatic Jewel',
            category: 'jewel' as const,
            rarity: 'Unique',
            icon: '',
            priceChaos: 2000,
            priceDivine: 12.5,
            confidence: 'medium' as const,
          }
        ]
      }
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders input box, quick buttons, and calculates build costs successfully', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'calculateBuild').mockResolvedValue(mockBuildResult);

    await act(async () => {
      render(<BuildCalculator {...defaultProps} onShowToast={onShowToast} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'https://poe.ninja/builds/char/TestAccount/SlayerGod1' } });

    const calcBtn = screen.getByRole('button', { name: /計算成本/i });
    await act(async () => {
      fireEvent.click(calcBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('SlayerGod')).toBeInTheDocument();
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
      expect(screen.getByText('Starforge')).toBeInTheDocument();
    });

    expect(onShowToast).toHaveBeenCalledWith('Build 成本計算完成並已儲存快取！');
  });

  it('handles build calculation failure gracefully and displays error banner', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'calculateBuild').mockRejectedValue(new Error('PoB decode error'));

    await act(async () => {
      render(<BuildCalculator {...defaultProps} onShowToast={onShowToast} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'invalid-url' } });

    const calcBtn = screen.getByRole('button', { name: /計算成本/i });
    await act(async () => {
      fireEvent.click(calcBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/PoB decode error/i)).toBeInTheDocument();
    });
  });

  it('switches category tabs (equipment, gems, flasks, jewels) and filters items', async () => {
    vi.spyOn(poeApi, 'calculateBuild').mockResolvedValue(mockBuildResult);

    await act(async () => {
      render(<BuildCalculator {...defaultProps} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'https://pobb.in/test-tabs' } });

    const calcBtn = screen.getByRole('button', { name: /計算成本/i });
    await act(async () => {
      fireEvent.click(calcBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
    });

    // Switch to Gems Tab
    const gemsTab = screen.getByText(/💎 寶石/i);
    await act(async () => {
      fireEvent.click(gemsTab);
    });
    expect(screen.getByText('Awakened Multistrike Support')).toBeInTheDocument();

    // Switch to Flasks Tab
    const flasksTab = screen.getByText(/🧪 藥劑/i);
    await act(async () => {
      fireEvent.click(flasksTab);
    });
    expect(screen.getByText('Progenesis')).toBeInTheDocument();

    // Switch to Jewels Tab
    const jewelsTab = screen.getByText(/🔮 珠寶/i);
    await act(async () => {
      fireEvent.click(jewelsTab);
    });
    expect(screen.getByText('Watcher\'s Eye')).toBeInTheDocument();
  });

  it('fetches live market price for an item with queryJson and opens trade search url', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'calculateBuild').mockResolvedValue(mockBuildResult);
    vi.spyOn(poeApi, 'fetchBuildItemLivePrice').mockResolvedValue({
      id: 'trade-live-1',
      total: 10,
      estimatedMinPriceDivine: 110,
      estimatedMinPriceChaos: 17600,
      estimatedMedianPriceDivine: 115,
      estimatedMedianPriceChaos: 18400,
      tradeUrl: '',
      listings: [],
    });
    const createUrlSpy = vi.spyOn(poeApi, 'createTradeSearchUrl').mockResolvedValue('https://trade.official/url');
    const openUrlSpy = vi.spyOn(poeApi, 'openExternalUrl').mockResolvedValue();

    await act(async () => {
      render(<BuildCalculator {...defaultProps} onShowToast={onShowToast} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'https://pobb.in/test-live' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /計算成本/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
    });

    // Click live price query button on Mageblood
    const livePriceBtn = screen.getByRole('button', { name: /同步現貨/i });
    await act(async () => {
      fireEvent.click(livePriceBtn);
    });

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('官方現貨價'));
    });

    // Click trade link on Mageblood (has tradeQueryJson)
    const tradeLinkBtns = screen.getAllByRole('button', { name: /Trade/i });
    await act(async () => {
      fireEvent.click(tradeLinkBtns[0]);
    });
    expect(createUrlSpy).toHaveBeenCalled();

    // Click trade link on Starforge (has tradeSearchUrl)
    await act(async () => {
      fireEvent.click(tradeLinkBtns[1]);
    });
    expect(openUrlSpy).toHaveBeenCalledWith('https://trade.search/starforge');
  });
});
