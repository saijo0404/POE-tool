import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Poe2GoldTrackerCard } from '../Poe2GoldTrackerCard';
import type { MappingSessionStats, MapRun } from '../../../domain/mapping/types';
import { DEFAULT_MAP_INVESTMENT } from '../../../domain/mapping/constants';

describe('Poe2GoldTrackerCard', () => {
  const mockStats: MappingSessionStats = {
    totalRuns: 3,
    totalDurationSeconds: 600,
    avgDurationSeconds: 200,
    totalCostChaos: 30,
    totalCostDivine: 0.2,
    totalRevenueChaos: 120,
    totalRevenueDivine: 0.8,
    totalNetProfitChaos: 90,
    totalNetProfitDivine: 0.6,
    activeMappingDivPerHour: 3.6,
    activeMappingChaosPerHour: 540,
    sessionTotalDivPerHour: 3.6,
    sessionTotalChaosPerHour: 540,
    topDrops: [],
    totalGoldEarned: 45000,
    avgGoldPerRun: 15000,
    activeMappingGoldPerHour: 270000,
    sessionTotalGoldPerHour: 270000,
    totalBossSlain: 2,
    bossSlainRate: 67,
    totalDeaths: 1,
    totalWaystonesFound: 4,
    totalRunesFound: 3
  };

  const mockRuns: MapRun[] = [
    {
      id: 'r1',
      runNumber: 1,
      mapName: 'Riverside Bluff',
      mapTier: 15,
      startTime: 1000,
      endTime: 1200,
      durationSeconds: 200,
      investment: { ...DEFAULT_MAP_INVESTMENT },
      grossRevenueChaos: 40,
      grossRevenueDivine: 0.25,
      netProfitChaos: 30,
      netProfitDivine: 0.2,
      drops: [],
      tabNames: [],
      engine: 'poe2',
      goldEarned: 15000,
      goldPerHour: 270000,
      waystonesFound: 2,
      runesFound: 1,
      bossSlain: true,
      deathCount: 0
    }
  ];

  it('renders all PoE 2 gold and asset metrics correctly', () => {
    const onImportRuns = vi.fn();
    const onShowToast = vi.fn();

    render(
      <Poe2GoldTrackerCard
        stats={mockStats}
        runs={mockRuns}
        onImportRuns={onImportRuns}
        onShowToast={onShowToast}
      />
    );

    expect(screen.getByText('PoE 2 金幣與終局資產收益 (Gold & Endgame Assets)')).toBeInTheDocument();
    expect(screen.getByText('總累積金幣')).toBeInTheDocument();
    expect(screen.getByText('45.0k')).toBeInTheDocument();
    expect(screen.getByText('270.0k /hr')).toBeInTheDocument();
    expect(screen.getByText('15.0k')).toBeInTheDocument();
    expect(screen.getByText('2 / 1 場 (67%)')).toBeInTheDocument();
    expect(screen.getByText('1 次')).toBeInTheDocument();
    expect(screen.getByText('4 張')).toBeInTheDocument();
    expect(screen.getByText('3 顆')).toBeInTheDocument();
  });

  it('toggles the log importer section open and closed', () => {
    const onImportRuns = vi.fn();
    const onShowToast = vi.fn();

    render(
      <Poe2GoldTrackerCard
        stats={mockStats}
        runs={mockRuns}
        onImportRuns={onImportRuns}
        onShowToast={onShowToast}
      />
    );

    const toggleBtn = screen.getByText('開啟日誌解析器');
    fireEvent.click(toggleBtn);

    expect(screen.getByText('收合日誌解析器')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Generating level 79 area/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('收合日誌解析器'));
    expect(screen.queryByPlaceholderText(/Generating level 79 area/)).not.toBeInTheDocument();
  });

  it('parses pasted log lines and triggers onImportRuns', () => {
    const onImportRuns = vi.fn();
    const onShowToast = vi.fn();

    render(
      <Poe2GoldTrackerCard
        stats={mockStats}
        runs={mockRuns}
        onImportRuns={onImportRuns}
        onShowToast={onShowToast}
      />
    );

    fireEvent.click(screen.getByText('開啟日誌解析器'));

    const textarea = screen.getByPlaceholderText(/Generating level 79 area/);
    const sampleLog = `
2024/12/06 18:20:00 [INFO Client] : Generating level 79 area "Riverside Bluff" with seed 1
2024/12/06 18:20:05 [INFO Client] : Entering area Riverside Bluff
2024/12/06 18:21:00 [INFO Client] : You have received 6,000 Gold.
2024/12/06 18:22:00 [INFO Client] : Quest Complete: Defeat the Map Boss
2024/12/06 18:23:00 [INFO Client] : You have entered Hideout.
    `.trim();

    fireEvent.change(textarea, { target: { value: sampleLog } });

    const importBtn = screen.getByText('解析並匯入刷圖紀錄');
    fireEvent.click(importBtn);

    expect(onImportRuns).toHaveBeenCalledTimes(1);
    const importedRuns = onImportRuns.mock.calls[0][0];
    expect(importedRuns).toHaveLength(1);
    expect(importedRuns[0].mapName).toBe('Riverside Bluff');
    expect(importedRuns[0].mapTier).toBe(15);
    expect(importedRuns[0].goldEarned).toBe(6000);
    expect(importedRuns[0].bossSlain).toBe(true);

    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('成功匯入 1 場銘刻地圖紀錄'));
  });

  it('warns when trying to parse empty log text', () => {
    const onImportRuns = vi.fn();
    const onShowToast = vi.fn();

    render(
      <Poe2GoldTrackerCard
        stats={mockStats}
        runs={mockRuns}
        onImportRuns={onImportRuns}
        onShowToast={onShowToast}
      />
    );

    fireEvent.click(screen.getByText('開啟日誌解析器'));
    fireEvent.click(screen.getByText('解析並匯入刷圖紀錄'));

    expect(onShowToast).toHaveBeenCalledWith('請先貼上 Client.txt 日誌內容');
    expect(onImportRuns).not.toHaveBeenCalled();
  });
});
