import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildCalculator } from '../BuildCalculator';
import { poeApi } from '../../services/api';
import { defaultProps, mockBuildResult } from './buildCalculatorMockData';

describe('BuildCalculator - Live Pricing & History Retention Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
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

    const livePriceBtn = screen.getByRole('button', { name: /同步現貨/i });
    await act(async () => {
      fireEvent.click(livePriceBtn);
    });

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('官方現貨價'));
    });

    const tradeLinkBtns = screen.getAllByRole('button', { name: /Trade/i });
    await act(async () => {
      fireEvent.click(tradeLinkBtns[0]);
    });
    expect(createUrlSpy).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(tradeLinkBtns[1]);
    });
    expect(openUrlSpy).toHaveBeenCalledWith('https://trade.search/starforge');
  });

  it('retains and displays previously synced live prices when loading build from history', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'calculateBuild').mockResolvedValue(mockBuildResult);
    vi.spyOn(poeApi, 'fetchBuildItemLivePrice').mockResolvedValue({
      id: 'trade-live-1',
      total: 5,
      estimatedMinPriceDivine: 120,
      estimatedMinPriceChaos: 19200,
      estimatedMedianPriceDivine: 125,
      estimatedMedianPriceChaos: 20000,
      tradeUrl: '',
      listings: [],
    });

    const targetUrl = 'https://pobb.in/test-history-retain';

    const { unmount } = render(<BuildCalculator {...defaultProps} onShowToast={onShowToast} />);

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: targetUrl } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /計算成本/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
    });

    const livePriceBtn = screen.getByRole('button', { name: /同步現貨/i });
    await act(async () => {
      fireEvent.click(livePriceBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('官方現貨')).toBeInTheDocument();
      expect(screen.getByText('120 div')).toBeInTheDocument();
    });

    unmount();

    render(<BuildCalculator {...defaultProps} onShowToast={onShowToast} />);

    const historyBtn = screen.getByRole('button', { name: /歷史/i });
    expect(historyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(historyBtn);
    });

    const historyEntry = screen.getByText('SlayerGod');
    expect(historyEntry).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(historyEntry);
    });

    await waitFor(() => {
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
      expect(screen.getByText('官方現貨')).toBeInTheDocument();
      expect(screen.getByText('120 div')).toBeInTheDocument();
    });

    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('保留'));
  });
});
