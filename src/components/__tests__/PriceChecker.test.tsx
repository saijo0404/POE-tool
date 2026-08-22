import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PriceChecker } from '../PriceChecker';
import { poeApi } from '../../services/api';

describe('PriceChecker Component', () => {
  const defaultProps = {
    league: 'Settlers',
    onShowToast: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders input area and clipboard paste button', async () => {
    await act(async () => {
      render(<PriceChecker {...defaultProps} />);
    });

    expect(screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i)).toBeInTheDocument();
    expect(screen.getAllByText(/讀取剪貼簿/i)[0]).toBeInTheDocument();
  });

  it('handles externalText prop and updates item text', async () => {
    const externalSample = `Rarity: Unique\nMageblood\nHeavy Belt`;
    vi.spyOn(poeApi, 'parseItem').mockResolvedValue({
      name: 'Mageblood',
      baseType: 'Heavy Belt',
      rarity: 'Unique',
      language: 'en',
      rawText: externalSample,
      implicits: [],
      explicits: [],
    });
    vi.spyOn(poeApi, 'searchTrade').mockResolvedValue({
      id: 'trade-mb',
      total: 10,
      estimatedMinPriceDivine: 150,
      estimatedMinPriceChaos: 24000,
      estimatedMedianPriceDivine: 160,
      estimatedMedianPriceChaos: 25600,
      tradeUrl: '',
      listings: [],
    });

    const { rerender } = render(<PriceChecker {...defaultProps} externalText="" />);

    await act(async () => {
      rerender(<PriceChecker {...defaultProps} externalText={externalSample} />);
    });

    const textarea = screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(externalSample);
  });
});
