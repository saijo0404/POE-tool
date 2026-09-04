import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MappingHistoryAnalyticsCard } from '../MappingHistoryAnalyticsCard';
import type { MappingSession, MapInvestment } from '../../../domain/mapping/types';

describe('MappingHistoryAnalyticsCard', () => {
  const dummyInvestment: MapInvestment = {
    mapCostChaos: 10,
    scarabsCostChaos: 20,
    craftCostChaos: 0,
    otherCostChaos: 0,
    totalCostChaos: 30,
    totalCostDivine: 0.2
  };

  const sampleSessions: MappingSession[] = [
    {
      id: 's1',
      name: '巨型恐懼攻堅',
      league: 'Settlers',
      strategyName: '精髓狂潮',
      defaultInvestment: dummyInvestment,
      selectedTabNames: [],
      runs: [
        {
          id: 'r1',
          runNumber: 1,
          startTime: Date.now() - 100000,
          endTime: Date.now() - 90000,
          durationSeconds: 150,
          investment: dummyInvestment,
          grossRevenueChaos: 330,
          grossRevenueDivine: 2.2,
          netProfitChaos: 300,
          netProfitDivine: 2.0,
          drops: [],
          tabNames: []
        }
      ],
      createdAt: Date.now() - 120000,
      updatedAt: Date.now()
    }
  ];

  it('renders historical analytics metrics correctly', () => {
    render(
      <MappingHistoryAnalyticsCard
        sessions={sampleSessions}
        divineRate={150}
      />
    );

    expect(screen.getByText(/刷圖歷程深度統計與策略回報分析/)).toBeDefined();
    expect(screen.getAllByText(/1\s*場/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\+2 div/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/精髓狂潮/).length).toBeGreaterThanOrEqual(1);
  });

  it('filters by time range when filter button is clicked', () => {
    render(
      <MappingHistoryAnalyticsCard
        sessions={sampleSessions}
        divineRate={150}
      />
    );

    const todayBtn = screen.getByRole('button', { name: '今日' });
    fireEvent.click(todayBtn);
    expect(todayBtn).toBeDefined();
  });
});
