import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PortfolioAnalysisHub } from '../PortfolioAnalysisHub';
import type { WealthSnapshot } from '../../../types/poe';

describe('PortfolioAnalysisHub', () => {
  const mockSnapshot: WealthSnapshot = {
    timestamp: '2026-08-25T10:00:00Z',
    league: 'Settlers',
    totalChaos: 5000,
    totalDivine: 33.3,
    chaosRate: 150,
    tabSummaries: [],
    topItems: [
      {
        id: '1',
        name: 'Mageblood',
        typeLine: 'Heavy Belt',
        icon: '',
        category: 'Equipment',
        tabName: 'Gear',
        unitPriceChaos: 4000,
        totalPriceChaos: 4000,
        unitPriceDivine: 26.6,
        totalPriceDivine: 26.6,
        stackSize: 1
      },
      {
        id: '2',
        name: 'Chaos Orb',
        typeLine: 'Chaos Orb',
        icon: '',
        category: 'Currency',
        tabName: 'Currency',
        unitPriceChaos: 1,
        totalPriceChaos: 1000,
        unitPriceDivine: 0.006,
        totalPriceDivine: 6.7,
        stackSize: 1000
      }
    ]
  };

  it('renders portfolio analysis hub with donut chart and drilldown list', () => {
    const onShowToast = vi.fn();
    render(
      <PortfolioAnalysisHub
        snapshots={[mockSnapshot]}
        latestSnapshot={mockSnapshot}
        divineRate={150}
        league="Settlers"
        onShowToast={onShowToast}
      />
    );

    expect(screen.getByText(/玩家資產組合結構分析與淨值成長報表/)).toBeInTheDocument();
    expect(screen.getByText(/資產組合分類佔比/)).toBeInTheDocument();
    expect(screen.getAllByText(/Mageblood/).length).toBeGreaterThan(0);
  });

  it('opens and closes export modal', () => {
    render(
      <PortfolioAnalysisHub
        snapshots={[mockSnapshot]}
        latestSnapshot={mockSnapshot}
        divineRate={150}
        league="Settlers"
      />
    );

    const exportBtn = screen.getByText(/匯出分析總結/);
    fireEvent.click(exportBtn);

    expect(screen.getByText(/匯出資產分析報表與社群分享/)).toBeInTheDocument();

    const closeBtn = screen.getByText('關閉');
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/匯出資產分析報表與社群分享/)).not.toBeInTheDocument();
  });
});
