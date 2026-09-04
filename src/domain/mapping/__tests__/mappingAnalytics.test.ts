import { describe, it, expect } from 'vitest';
import {
  analyzeMappingHistory,
  formatDurationZh,
  filterMappingSessions
} from '../mappingAnalytics';
import type { MappingSession, MapRun, MapInvestment } from '../types';

describe('mappingAnalytics', () => {
  const dummyInvestment: MapInvestment = {
    mapCostChaos: 10,
    scarabsCostChaos: 20,
    craftCostChaos: 0,
    otherCostChaos: 0,
    totalCostChaos: 30,
    totalCostDivine: 0.2
  };

  const createRun = (
    id: string,
    runNumber: number,
    durationSeconds: number,
    netProfitChaos: number,
    startTime: number
  ): MapRun => ({
    id,
    runNumber,
    startTime,
    endTime: startTime + durationSeconds * 1000,
    durationSeconds,
    investment: dummyInvestment,
    grossRevenueChaos: netProfitChaos + 30,
    grossRevenueDivine: (netProfitChaos + 30) / 150,
    netProfitChaos,
    netProfitDivine: Math.round((netProfitChaos / 150) * 100) / 100,
    drops: [],
    tabNames: []
  });

  describe('formatDurationZh', () => {
    it('formats seconds correctly', () => {
      expect(formatDurationZh(0)).toBe('0 秒');
      expect(formatDurationZh(45)).toBe('45 秒');
      expect(formatDurationZh(150)).toBe('2 分 30 秒');
      expect(formatDurationZh(3665)).toBe('1 小時 1 分');
    });
  });

  describe('analyzeMappingHistory', () => {
    it('handles empty sessions gracefully', () => {
      const res = analyzeMappingHistory([], undefined, 150);
      expect(res.totalSessions).toBe(0);
      expect(res.totalRuns).toBe(0);
      expect(res.totalDurationSeconds).toBe(0);
      expect(res.totalNetProfitChaos).toBe(0);
      expect(res.totalNetProfitDivine).toBe(0);
      expect(res.overallDivPerHour).toBe(0);
      expect(res.topRuns).toEqual([]);
      expect(res.lowestRun).toBeUndefined();
      expect(res.strategyBreakdown).toEqual([]);
    });

    it('calculates macro KPIs across multiple sessions and runs', () => {
      const now = Date.now();
      const session1: MappingSession = {
        id: 's1',
        name: '掘獄密港速刷',
        league: 'Settlers',
        strategyName: '點金速刷',
        defaultInvestment: dummyInvestment,
        selectedTabNames: [],
        runs: [
          createRun('r1', 1, 120, 150, now - 5000),
          createRun('r2', 2, 180, 300, now - 4000)
        ],
        createdAt: now - 6000,
        updatedAt: now
      };

      const session2: MappingSession = {
        id: 's2',
        name: '巨型恐懼攻堅',
        league: 'Settlers',
        strategyName: '精髓狂潮',
        defaultInvestment: dummyInvestment,
        selectedTabNames: [],
        runs: [
          createRun('r3', 1, 300, 600, now - 2000),
          createRun('r4', 2, 200, -20, now - 1000)
        ],
        createdAt: now - 3000,
        updatedAt: now
      };

      const res = analyzeMappingHistory([session1, session2], undefined, 150);

      expect(res.totalSessions).toBe(2);
      expect(res.totalRuns).toBe(4);
      expect(res.totalDurationSeconds).toBe(800); // 120 + 180 + 300 + 200
      expect(res.avgRunDurationSeconds).toBe(200);
      expect(res.totalNetProfitChaos).toBe(1030); // 150 + 300 + 600 - 20
      expect(res.totalNetProfitDivine).toBe(6.87); // 1030 / 150
      expect(res.topRuns.length).toBe(3);
      expect(res.topRuns[0].netProfitChaos).toBe(600);
      expect(res.lowestRun?.netProfitChaos).toBe(-20);

      // Strategy breakdown
      expect(res.strategyBreakdown.length).toBe(2);
      const essenceStrat = res.strategyBreakdown.find(s => s.strategyName === '精髓狂潮');
      expect(essenceStrat?.runCount).toBe(2);
      expect(essenceStrat?.totalNetProfitChaos).toBe(580);
    });
  });

  describe('filterMappingSessions', () => {
    it('filters by league and strategy name', () => {
      const now = Date.now();
      const sessions: MappingSession[] = [
        {
          id: 's1',
          name: 'S1',
          league: 'Settlers',
          strategyName: '點金速刷',
          defaultInvestment: dummyInvestment,
          selectedTabNames: [],
          runs: [],
          createdAt: now,
          updatedAt: now
        },
        {
          id: 's2',
          name: 'S2',
          league: 'Standard',
          strategyName: '點金速刷',
          defaultInvestment: dummyInvestment,
          selectedTabNames: [],
          runs: [],
          createdAt: now,
          updatedAt: now
        },
        {
          id: 's3',
          name: 'S3',
          league: 'Settlers',
          strategyName: '精髓狂潮',
          defaultInvestment: dummyInvestment,
          selectedTabNames: [],
          runs: [],
          createdAt: now,
          updatedAt: now
        }
      ];

      const filteredLeague = filterMappingSessions(sessions, { league: 'Settlers' });
      expect(filteredLeague.length).toBe(2);

      const filteredStrategy = filterMappingSessions(sessions, { strategyName: '精髓狂潮' });
      expect(filteredStrategy.length).toBe(1);
      expect(filteredStrategy[0].id).toBe('s3');
    });

    it('filters runs by time range', () => {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const session: MappingSession = {
        id: 's1',
        name: 'S1',
        league: 'Settlers',
        defaultInvestment: dummyInvestment,
        selectedTabNames: [],
        runs: [
          createRun('r-recent', 1, 100, 50, now - 1000),
          createRun('r-old', 2, 100, 50, now - 10 * dayMs)
        ],
        createdAt: now - 12 * dayMs,
        updatedAt: now
      };

      const filtered7Days = filterMappingSessions([session], { timeRange: '7days' });
      expect(filtered7Days[0].runs.length).toBe(1);
      expect(filtered7Days[0].runs[0].id).toBe('r-recent');
    });
  });
});
