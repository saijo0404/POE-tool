import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FaustusExchangeHub } from '../exchange/FaustusExchangeHub';
import { poeApi } from '../../services/api';
import { createDefaultExchangeOverview } from '../../domain/exchange/defaultOverview';

vi.mock('../../services/api', () => ({
  poeApi: {
    getFaustusExchangeOverview: vi.fn(),
    createTradeSearchUrl: vi.fn(),
  },
}));

describe('FaustusExchangeHub Component', () => {
  const mockOverview = createDefaultExchangeOverview('Settlers');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(poeApi.getFaustusExchangeOverview).mockResolvedValue(mockOverview);
  });

  it('renders Faustus exchange header, conversion matrix, gold calculator and items', async () => {
    render(<FaustusExchangeHub league="Settlers" />);

    expect(screen.getByText(/Faustus 官方黑市大宗通貨交易所/i)).toBeInTheDocument();
    expect(screen.getByText(/跨幣種即時折算矩陣/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Faustus 金幣 \(Gold\) 手續費即時試算機/i)).toBeInTheDocument();
      expect(screen.getAllByText(/神聖石/i).length).toBeGreaterThan(0);
    });
  });

  it('allows switching categories to filter items', async () => {
    render(<FaustusExchangeHub league="Settlers" />);

    await waitFor(() => {
      expect(screen.getAllByText(/神聖石/i).length).toBeGreaterThan(0);
    });

    const scarabBtn = screen.getByText('聖甲蟲');
    fireEvent.click(scarabBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/保全聖甲蟲/i).length).toBeGreaterThan(0);
    });
  });

  it('filters items through search input', async () => {
    render(<FaustusExchangeHub league="Settlers" />);

    await waitFor(() => {
      expect(screen.getAllByText(/神聖石/i).length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/搜尋名稱/i);
    fireEvent.change(searchInput, { target: { value: '卡蘭德' } });

    await waitFor(() => {
      expect(screen.getAllByText(/卡蘭德的魔鏡/i).length).toBeGreaterThan(0);
      expect(screen.queryByText('38,400')).not.toBeInTheDocument();
    });
  });

  it('triggers refresh and shows toast', async () => {
    const onShowToast = vi.fn();
    render(<FaustusExchangeHub league="Settlers" onShowToast={onShowToast} />);

    const refreshBtn = await screen.findByText(/重新整理行情/i);
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('Faustus 交易所即時行情與套利資料已更新'));
    });
  });
});
