import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MapPerformanceHeatmap } from '../MapPerformanceHeatmap';
import type { MapRun } from '../../../domain/mapping/types';

describe('MapPerformanceHeatmap', () => {
  it('renders empty placeholder when runs are empty', () => {
    render(<MapPerformanceHeatmap runs={[]} />);
    expect(screen.getByText(/尚無足夠的地圖場次資料/)).toBeInTheDocument();
  });

  it('renders heatmap statistics when runs are provided', () => {
    const mockRuns: MapRun[] = [
      {
        id: 'r1',
        runNumber: 1,
        mapName: '幽閉墓穴 (Dunes)',
        mapTier: 16,
        startTime: 100,
        endTime: 220,
        durationSeconds: 120,
        investment: {
          mapCostChaos: 5,
          scarabsCostChaos: 10,
          craftCostChaos: 5,
          otherCostChaos: 0,
          totalCostChaos: 20,
          totalCostDivine: 0.13
        },
        grossRevenueChaos: 80,
        grossRevenueDivine: 0.53,
        netProfitChaos: 60,
        netProfitDivine: 0.4,
        drops: [
          {
            id: 'd1',
            name: '崇高石',
            typeLine: '崇高石',
            icon: '',
            category: 'Currency',
            deltaCount: 1,
            unitPriceChaos: 20,
            totalPriceChaos: 20,
            unitPriceDivine: 0.13,
            totalPriceDivine: 0.13
          }
        ],
        tabNames: ['dump']
      }
    ];

    render(<MapPerformanceHeatmap runs={mockRuns} divineRate={150} />);

    expect(screen.getByText('地圖歷史地形收益熱力圖 (Map Performance Heatmap)')).toBeInTheDocument();
    expect(screen.getAllByText(/幽閉墓穴 \(Dunes\)/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/T16/)).toBeInTheDocument();
    expect(screen.getByText(/\+60 C/)).toBeInTheDocument();
    expect(screen.getByText(/崇高石/)).toBeInTheDocument();
  });
});
