import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WealthChart } from '../WealthChart';
import type { WealthSnapshot } from '../../types/poe';

describe('WealthChart Component', () => {
  it('renders fallback card when snapshots is empty', () => {
    render(<WealthChart snapshots={[]} />);

    expect(screen.getByText(/暫無歷史資產快照資料/i)).toBeInTheDocument();
  });

  it('renders chart, time range selectors, and positive profit statistics', () => {
    const now = Date.now();
    const mockSnapshots: WealthSnapshot[] = [
      {
        timestamp: new Date(now - 3 * 3600 * 1000).toISOString(),
        league: 'Settlers',
        totalChaos: 1000,
        totalDivine: 6.25,
        chaosRate: 160,
        hourlyChangeChaos: 100,
        hourlyChangeDivine: 0.625,
        tabSummaries: [],
        topItems: [],
      },
      {
        timestamp: new Date(now).toISOString(),
        league: 'Settlers',
        totalChaos: 2000,
        totalDivine: 12.5,
        chaosRate: 160,
        hourlyChangeChaos: 333,
        hourlyChangeDivine: 2.08,
        tabSummaries: [],
        topItems: [],
      },
    ];

    render(<WealthChart snapshots={mockSnapshots} />);

    expect(screen.getByText(/資產成長趨勢曲線/i)).toBeInTheDocument();
    expect(screen.getByText(/區間淨利: \+6\.25 Div \(\+1000 c\)/i)).toBeInTheDocument();
    expect(screen.getByText(/平均產值: \+2\.08 Div\/hr/i)).toBeInTheDocument();

    // Click time range buttons
    const btn3d = screen.getByText('近3天');
    fireEvent.click(btn3d);

    const btn7d = screen.getByText('近7天');
    fireEvent.click(btn7d);

    const btnAll = screen.getByText('全部歷史');
    fireEvent.click(btnAll);

    const btn24h = screen.getByText('近24小時');
    fireEvent.click(btn24h);
  });

  it('handles negative profit correctly and displays negative delta values', () => {
    const now = Date.now();
    const mockLossSnapshots: WealthSnapshot[] = [
      {
        timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
        league: 'Settlers',
        totalChaos: 5000,
        totalDivine: 30,
        chaosRate: 160,
        hourlyChangeChaos: 0,
        hourlyChangeDivine: 0,
        tabSummaries: [],
        topItems: [],
      },
      {
        timestamp: new Date(now).toISOString(),
        league: 'Settlers',
        totalChaos: 3000,
        totalDivine: 18,
        chaosRate: 160,
        hourlyChangeChaos: -1000,
        hourlyChangeDivine: -6,
        tabSummaries: [],
        topItems: [],
      },
    ];

    render(<WealthChart snapshots={mockLossSnapshots} />);

    expect(screen.getByText(/區間淨利: -12 Div \(-2000 c\)/i)).toBeInTheDocument();
    expect(screen.getByText(/平均產值: -6 Div\/hr/i)).toBeInTheDocument();
  });
});
