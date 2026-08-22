import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WealthTracker } from '../WealthTracker';
import { poeApi } from '../../services/api';
import type { WealthSnapshot } from '../../types/poe';

describe('WealthTracker Component', () => {
  const defaultProps = {
    league: 'Settlers',
    onShowToast: vi.fn(),
  };

  const mockSnapshot: WealthSnapshot = {
    timestamp: '2026-08-20T12:00:00Z',
    league: 'Settlers',
    totalChaos: 16000,
    totalDivine: 100,
    chaosRate: 160,
    hourlyChangeChaos: 800,
    hourlyChangeDivine: 5,
    tabSummaries: [
      { tabName: 'Currency', category: 'Currency', itemCount: 50, totalValueChaos: 10000, totalValueDivine: 62.5 },
      { tabName: 'Cards', category: 'DivCard', itemCount: 20, totalValueChaos: 6000, totalValueDivine: 37.5 },
    ],
    topItems: [
      { id: '1', name: 'Mirror of Kalandra', typeLine: 'Mirror of Kalandra', tabName: 'Currency', category: 'Currency', stackSize: 1, unitPriceChaos: 8000, totalPriceChaos: 8000, unitPriceDivine: 50, totalPriceDivine: 50, icon: '' },
      { id: '2', name: 'House of Mirrors', typeLine: 'House of Mirrors', tabName: 'Cards', category: 'DivCard', stackSize: 1, unitPriceChaos: 4000, totalPriceChaos: 4000, unitPriceDivine: 25, totalPriceDivine: 25, icon: '' }
    ],
    allItems: [
      { id: '1', name: 'Mirror of Kalandra', typeLine: 'Mirror of Kalandra', tabName: 'Currency', category: 'Currency', stackSize: 1, unitPriceChaos: 8000, totalPriceChaos: 8000, unitPriceDivine: 50, totalPriceDivine: 50, icon: '' },
      { id: '2', name: 'House of Mirrors', typeLine: 'House of Mirrors', tabName: 'Cards', category: 'DivCard', stackSize: 1, unitPriceChaos: 4000, totalPriceChaos: 4000, unitPriceDivine: 25, totalPriceDivine: 25, icon: '' },
      { id: '3', name: 'Chaos Orb', typeLine: 'Chaos Orb', tabName: 'Currency', category: 'Currency', stackSize: 200, unitPriceChaos: 1, totalPriceChaos: 200, unitPriceDivine: 0.00625, totalPriceDivine: 1.25, icon: '' },
    ]
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(poeApi, 'getWealthSnapshots').mockResolvedValue([mockSnapshot]);
  });

  it('renders summary cards, tab breakdown, and action buttons on load', async () => {
    await act(async () => {
      render(<WealthTracker {...defaultProps} />);
    });

    expect(screen.getByText(/Hourly Wealth Tracker/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/\+5/)).toBeInTheDocument();
    expect(screen.getByText('1 : 160')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
  });

  it('shows empty placeholder when no snapshot data exists', async () => {
    vi.spyOn(poeApi, 'getWealthSnapshots').mockResolvedValue([]);

    await act(async () => {
      render(<WealthTracker {...defaultProps} />);
    });

    expect(screen.getByText(/尚未讀取到真實資產數據/i)).toBeInTheDocument();
    expect(screen.getByText(/POESESSID/i)).toBeInTheDocument();
  });

  it('handles creating snapshot flow with progress polling and success toast', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'getWealthSnapshots').mockResolvedValue([]);
    vi.spyOn(poeApi, 'takeWealthSnapshot').mockResolvedValue(mockSnapshot);
    vi.spyOn(poeApi, 'getWealthProgress').mockResolvedValue({
      active: true,
      currentTab: 5,
      totalTabs: 10,
      currentTabName: 'Currency Tab',
      stage: 'fetching'
    });

    await act(async () => {
      render(<WealthTracker {...defaultProps} onShowToast={onShowToast} />);
    });

    const createBtn = screen.getByRole('button', { name: /立即計算目前資產快照/i });

    await act(async () => {
      fireEvent.click(createBtn);
    });

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith('已成功獲取您角色與倉庫的真實資產數據！');
    });
  });

  it('handles snapshot failure gracefully', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'takeWealthSnapshot').mockRejectedValue(new Error('Snapshot failed'));

    await act(async () => {
      render(<WealthTracker {...defaultProps} onShowToast={onShowToast} />);
    });

    const createBtn = screen.getByRole('button', { name: /立即計算目前資產快照/i });

    await act(async () => {
      fireEvent.click(createBtn);
    });

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith('建立快照失敗');
    });
  });

  it('exports CSV report and clears snapshot history', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'clearWealthSnapshots').mockResolvedValue({ success: true });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await act(async () => {
      render(<WealthTracker {...defaultProps} onShowToast={onShowToast} />);
    });

    const exportBtn = screen.getByTitle('下載完整歷程 CSV 報表');
    await act(async () => {
      fireEvent.click(exportBtn);
    });
    expect(onShowToast).toHaveBeenCalledWith('已成功匯出資產歷程 CSV 報表！');
    expect(clickSpy).toHaveBeenCalled();

    const clearBtn = screen.getByTitle('重置快照紀錄');
    await act(async () => {
      fireEvent.click(clearBtn);
    });
    expect(onShowToast).toHaveBeenCalledWith('已清除歷史快照資料');
    clickSpy.mockRestore();
  });

  it('copies Discord markdown summary to clipboard', async () => {
    const onShowToast = vi.fn();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await act(async () => {
      render(<WealthTracker {...defaultProps} onShowToast={onShowToast} />);
    });

    const shareBtn = screen.getByTitle('複製 Discord Markdown 格式');
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    expect(writeTextMock).toHaveBeenCalled();
    const copiedText = writeTextMock.mock.calls[0][0];
    expect(copiedText).toContain('Path of Exile 資產統計報表');
    expect(copiedText).toContain('76.25 Divine');
    expect(onShowToast).toHaveBeenCalledWith('已複製 Discord 格式資產摘要！可直接在聊天室貼上分享');
  });
});
