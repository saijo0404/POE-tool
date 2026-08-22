import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeSummaryCard } from './TradeSummaryCard';
import type { TradeSearchResult } from '../../types/poe';

describe('TradeSummaryCard Component', () => {
  const defaultProps = {
    tradeResults: null,
    searching: false,
    onRefreshSearch: vi.fn(),
  };

  it('renders loading banner when searching is true and tradeResults is null', () => {
    render(<TradeSummaryCard {...defaultProps} searching={true} />);

    expect(screen.getByText(/正在向 GGG 官方市集查詢即時刊登與行情估價中\.\.\./i)).toBeInTheDocument();
  });

  it('renders initial unsearched state with "立即市集查價" button when tradeResults is null', () => {
    const onRefreshSearch = vi.fn();
    render(<TradeSummaryCard {...defaultProps} onRefreshSearch={onRefreshSearch} />);

    expect(screen.getByText(/裝備屬性解析完成，點擊右側按鈕開始向市集比價：/i)).toBeInTheDocument();

    const searchBtn = screen.getByRole('button', { name: /立即市集查價/i });
    expect(searchBtn).toBeInTheDocument();

    fireEvent.click(searchBtn);
    expect(onRefreshSearch).toHaveBeenCalledTimes(1);
  });

  it('renders price statistics when tradeResults contains valid Divine and Chaos estimations', () => {
    const mockResults: TradeSearchResult = {
      id: 'search-123',
      total: 42,
      estimatedMinPriceDivine: 5.5,
      estimatedMinPriceChaos: 880,
      estimatedMedianPriceDivine: 12.0,
      estimatedMedianPriceChaos: 1920,
      tradeUrl: 'https://www.pathofexile.com/trade/search/Settlers/search-123',
      listings: [],
    };

    const onRefreshSearch = vi.fn();
    render(<TradeSummaryCard {...defaultProps} tradeResults={mockResults} onRefreshSearch={onRefreshSearch} />);

    expect(screen.getByText(/市場行情估價 \(共 42 筆\)/i)).toBeInTheDocument();
    expect(screen.getByText(/最低價:/i)).toBeInTheDocument();
    expect(screen.getByText('5.5 Divine')).toBeInTheDocument();
    expect(screen.getByText(/880 Chaos/i)).toBeInTheDocument();

    expect(screen.getByText(/中位數價:/i)).toBeInTheDocument();
    expect(screen.getByText('12 Divine')).toBeInTheDocument();
    expect(screen.getByText(/1920 Chaos/i)).toBeInTheDocument();

    const tradeLink = screen.getByRole('link', { name: /開啟官方拍賣場/i });
    expect(tradeLink).toBeInTheDocument();
    expect(tradeLink).toHaveAttribute('href', 'https://www.pathofexile.com/trade/search/Settlers/search-123');

    const refreshBtn = screen.getByRole('button', { name: /重新查詢/i });
    fireEvent.click(refreshBtn);
    expect(onRefreshSearch).toHaveBeenCalledTimes(1);
  });

  it('handles edge cases when prices are 0 and tradeUrl is missing', () => {
    const mockZeroResults: TradeSearchResult = {
      id: 'search-456',
      total: 0,
      estimatedMinPriceDivine: 0,
      estimatedMinPriceChaos: 0,
      estimatedMedianPriceDivine: 0,
      estimatedMedianPriceChaos: 0,
      tradeUrl: '',
      listings: [],
    };

    render(<TradeSummaryCard {...defaultProps} tradeResults={mockZeroResults} />);

    expect(screen.getByText(/市場行情估價 \(共 0 筆\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/最低價:/i)).toBeNull();
    expect(screen.queryByText(/中位數價:/i)).toBeNull();
    expect(screen.queryByRole('link', { name: /開啟官方拍賣場/i })).toBeNull();
  });

  it('disables button and shows searching indicator during re-query', () => {
    const mockResults: TradeSearchResult = {
      id: 'search-789',
      total: 10,
      estimatedMinPriceDivine: 1,
      estimatedMinPriceChaos: 160,
      estimatedMedianPriceDivine: 2,
      estimatedMedianPriceChaos: 320,
      tradeUrl: 'https://trade.url',
      listings: [],
    };

    render(<TradeSummaryCard {...defaultProps} tradeResults={mockResults} searching={true} />);

    const refreshBtn = screen.getByRole('button', { name: /查詢中\.\.\./i });
    expect(refreshBtn).toBeDisabled();
  });
});
