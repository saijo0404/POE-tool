import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MappingRunsTable } from '../MappingRunsTable';
import type { MapRun } from '../../../domain/mapping/types';
import { DEFAULT_MAP_INVESTMENT } from '../../../domain/mapping/constants';

describe('MappingRunsTable', () => {
  const mockRuns: MapRun[] = [
    {
      id: 'run-1',
      runNumber: 1,
      mapName: 'Riverside Bluff',
      mapTier: 15,
      startTime: 1000,
      endTime: 1120,
      durationSeconds: 120,
      investment: { ...DEFAULT_MAP_INVESTMENT },
      grossRevenueChaos: 50,
      grossRevenueDivine: 0.33,
      netProfitChaos: 30,
      netProfitDivine: 0.2,
      drops: [
        {
          id: 'd1',
          name: 'Divine Orb',
          typeLine: 'Divine Orb',
          icon: '',
          category: 'Currency',
          deltaCount: 1,
          unitPriceChaos: 150,
          totalPriceChaos: 150,
          unitPriceDivine: 1,
          totalPriceDivine: 1
        }
      ],
      tabNames: ['Dump'],
      engine: 'poe2',
      goldEarned: 18000,
      goldPerHour: 540000,
      bossSlain: true,
      deathCount: 1,
      waystonesFound: 2,
      runesFound: 3
    }
  ];

  it('renders run row with PoE 2 badges (tier, gold, boss slain, deaths)', () => {
    const onDelete = vi.fn();
    render(<MappingRunsTable runs={mockRuns} onDeleteRun={onDelete} />);

    expect(screen.getByText(/#1 Riverside Bluff/)).toBeInTheDocument();
    expect(screen.getByText('T15')).toBeInTheDocument();
    expect(screen.getByText('💰 18.0k')).toBeInTheDocument();
    expect(screen.getByText('👑 討伐')).toBeInTheDocument();
    expect(screen.getByText('💀 x1')).toBeInTheDocument();
  });

  it('expands run details when clicked and displays PoE 2 drops summary', () => {
    const onDelete = vi.fn();
    render(<MappingRunsTable runs={mockRuns} onDeleteRun={onDelete} />);

    const row = screen.getByText(/#1 Riverside Bluff/);
    fireEvent.click(row);

    expect(screen.getByText(/金幣收益：18,000/)).toBeInTheDocument();
    expect(screen.getByText(/銘刻掉落：2 張/)).toBeInTheDocument();
    expect(screen.getByText(/符文掉落：3 顆/)).toBeInTheDocument();
    expect(screen.getByText('Divine Orb')).toBeInTheDocument();
  });

  it('calls onDeleteRun when clicking delete button', () => {
    const onDelete = vi.fn();
    render(<MappingRunsTable runs={mockRuns} onDeleteRun={onDelete} />);

    const deleteBtn = screen.getByTitle('刪除此場紀錄');
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith('run-1');
  });
});
