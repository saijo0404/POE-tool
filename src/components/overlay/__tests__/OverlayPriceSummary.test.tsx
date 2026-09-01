import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverlayPriceSummary } from '../OverlayPriceSummary';
import type { TradeSearchResult } from '../../../types/poe';

describe('OverlayPriceSummary Component', () => {
  const mockResults: TradeSearchResult = {
    id: 'search-123',
    total: 42,
    listings: [],
    estimatedMinPriceChaos: 150,
    estimatedMinPriceDivine: 1.2,
    estimatedMedianPriceChaos: 180,
    estimatedMedianPriceDivine: 1.5
  };

  it('renders estimated minimum price and median price metrics', () => {
    render(
      <OverlayPriceSummary
        tradeResults={mockResults}
        searching={false}
        onRefreshSearch={vi.fn()}
      />
    );

    expect(screen.getByText('1.20')).toBeInTheDocument();
    expect(screen.getByText('1.50')).toBeInTheDocument();
    expect(screen.getByText(/42 筆/)).toBeInTheDocument();
  });

  it('shows loading spinner when searching is true', () => {
    render(
      <OverlayPriceSummary
        tradeResults={mockResults}
        searching={true}
        onRefreshSearch={vi.fn()}
      />
    );

    expect(screen.getByText(/查詢中/i)).toBeInTheDocument();
  });

  it('triggers onRefreshSearch when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(
      <OverlayPriceSummary
        tradeResults={mockResults}
        searching={false}
        onRefreshSearch={onRefresh}
      />
    );

    const refreshBtn = screen.getByRole('button', { name: /重新查詢/i });
    fireEvent.click(refreshBtn);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
