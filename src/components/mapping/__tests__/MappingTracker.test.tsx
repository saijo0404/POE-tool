import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MappingTracker } from '../MappingTracker';
import { poeApi } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  poeApi: {
    getStashTabs: vi.fn().mockResolvedValue([
      { i: 0, id: 'tab0', n: 'Dump 1', type: 'NormalStash' },
      { i: 1, id: 'tab1', n: 'Dump 2', type: 'NormalStash' }
    ]),
    takeWealthSnapshot: vi.fn().mockResolvedValue({
      timestamp: new Date().toISOString(),
      league: 'Settlers',
      totalChaos: 100,
      totalDivine: 0.67,
      chaosRate: 150,
      tabSummaries: [],
      topItems: [],
      allItems: []
    })
  }
}));

// Mock ResizeObserver for Recharts
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;

describe('MappingTracker Component', () => {
  const onShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders summary cards, timer, tab selector and empty runs message', async () => {
    render(<MappingTracker league="Settlers" divineRate={150} onShowToast={onShowToast} />);
    await waitFor(() => expect(poeApi.getStashTabs).toHaveBeenCalled());

    expect(screen.getByText('當前 Session:')).toBeInTheDocument();
    expect(screen.getByText('已完成場次')).toBeInTheDocument();
    expect(screen.getByText('純刷圖時薪 (Active Div/hr)')).toBeInTheDocument();
    expect(screen.getByText('開始進圖 (Start Map)')).toBeInTheDocument();
    expect(screen.getByText(/指定追蹤的 Dump/)).toBeInTheDocument();
    expect(screen.getByText(/目前尚無刷圖結算紀錄/)).toBeInTheDocument();
  });

  it('opens and closes the investment modal', async () => {
    render(<MappingTracker league="Settlers" divineRate={150} onShowToast={onShowToast} />);
    await waitFor(() => expect(poeApi.getStashTabs).toHaveBeenCalled());

    const openBtn = screen.getByText('門票成本設定');
    fireEvent.click(openBtn);

    expect(screen.getByText('單場門票投資成本設定 (Map Investment)')).toBeInTheDocument();

    const cancelBtn = screen.getByText('取消');
    fireEvent.click(cancelBtn);

    expect(screen.queryByText('單場門票投資成本設定 (Map Investment)')).not.toBeInTheDocument();
  });

  it('starts map timer upon clicking start map button', async () => {
    render(<MappingTracker league="Settlers" divineRate={150} onShowToast={onShowToast} />);

    const startBtn = screen.getByText('開始進圖 (Start Map)');
    fireEvent.click(startBtn);

    expect(await screen.findByText('出圖放貨並結算 (Settle Run)')).toBeInTheDocument();
  });
});
