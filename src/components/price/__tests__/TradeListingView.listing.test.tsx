import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeListingView } from '../TradeListingView';
import type { TradeSearchResult } from '../../../types/poe';
import {
  mockTradeResults,
  mockListingWithHideoutToken,
  mockListingWithFullItem
} from './tradeListingTestMocks';

describe('TradeListingView - Listing Display & Hover Interactions', () => {
  it('renders listings with Travel to Hideout and Whisper buttons', () => {
    render(
      <TradeListingView
        tradeResults={mockTradeResults}
        copiedId={null}
        onCopyWhisper={vi.fn()}
      />
    );

    expect(screen.getByText(/刊登清單明細/)).toBeInTheDocument();
    expect(screen.getByText('ProTrader#1234')).toBeInTheDocument();
    expect(screen.getByText('CasualBuyer#5678')).toBeInTheDocument();
    expect(screen.getByText(/⚡ 前往藏身處 \(Travel to Hideout\)/)).toBeInTheDocument();
    expect(screen.getByText(/前往藏身處 \(\/hideout\)/)).toBeInTheDocument();
  });

  it('handles load more and sort changes', () => {
    const loadMoreSpy = vi.fn();
    const sortChangeSpy = vi.fn();

    const extendedResults: TradeSearchResult = {
      ...mockTradeResults,
      total: 50,
      listings: [mockListingWithHideoutToken]
    };

    render(
      <TradeListingView
        tradeResults={extendedResults}
        copiedId={null}
        onCopyWhisper={vi.fn()}
        onLoadMore={loadMoreSpy}
        onChangeSortBy={sortChangeSpy}
      />
    );

    const loadMoreBtn = screen.getByText(/載入更多刊登/);
    fireEvent.click(loadMoreBtn);
    expect(loadMoreSpy).toHaveBeenCalled();

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });
    expect(sortChangeSpy).toHaveBeenCalledWith('price_desc');
  });

  it('displays detailed item affixes and stats when hovering over a trade listing item', () => {
    const searchResult: TradeSearchResult = {
      ...mockTradeResults,
      listings: [mockListingWithFullItem]
    };

    render(
      <TradeListingView
        tradeResults={searchResult}
        copiedId={null}
        onCopyWhisper={vi.fn()}
      />
    );

    const itemElement = screen.getByText('Headhunter');
    fireEvent.mouseEnter(itemElement);

    expect(screen.getAllByText('Headhunter').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Leather Belt').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+40 to maximum Life')).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('When you Kill a Rare Monster'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('+20 to maximum Energy Shield'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('Enchanted mod test'))).toBeInTheDocument();
  });
});
