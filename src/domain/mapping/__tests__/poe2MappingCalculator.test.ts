import { describe, it, expect } from 'vitest';
import {
  calculateGoldPerHour,
  formatGold,
  formatGoldPerHour,
  computePoe2SessionStats
} from '../poe2MappingCalculator';
import { computeSessionStats } from '../mappingCalculator';
import type { MapRun } from '../types';
import { DEFAULT_MAP_INVESTMENT } from '../constants';

describe('poe2MappingCalculator', () => {
  describe('calculateGoldPerHour', () => {
    it('should return 0 when duration is zero or gold is zero', () => {
      expect(calculateGoldPerHour(0, 100)).toBe(0);
      expect(calculateGoldPerHour(1000, 0)).toBe(0);
    });

    it('should correctly calculate hourly rate', () => {
      // 5,000 gold in 120 seconds (2 mins) -> 150,000 gold/hr
      expect(calculateGoldPerHour(5000, 120)).toBe(150000);
    });
  });

  describe('formatGold & formatGoldPerHour', () => {
    it('should format numbers with comma, k, or M', () => {
      expect(formatGold(500)).toBe('500');
      expect(formatGold(12500)).toBe('12.5k');
      expect(formatGold(1500000)).toBe('1.50M');
    });

    it('should append /hr suffix', () => {
      expect(formatGoldPerHour(250000)).toBe('250.0k /hr');
    });
  });

  describe('computePoe2SessionStats', () => {
    const mockRuns: MapRun[] = [
      {
        id: 'r1',
        runNumber: 1,
        startTime: 1000,
        endTime: 1120,
        durationSeconds: 120,
        investment: { ...DEFAULT_MAP_INVESTMENT },
        grossRevenueChaos: 50,
        grossRevenueDivine: 0.33,
        netProfitChaos: 30,
        netProfitDivine: 0.2,
        drops: [],
        tabNames: [],
        engine: 'poe2',
        goldEarned: 5000,
        bossSlain: true,
        deathCount: 0,
        waystonesFound: 2,
        runesFound: 3
      },
      {
        id: 'r2',
        runNumber: 2,
        startTime: 2000,
        endTime: 2180,
        durationSeconds: 180,
        investment: { ...DEFAULT_MAP_INVESTMENT },
        grossRevenueChaos: 80,
        grossRevenueDivine: 0.5,
        netProfitChaos: 60,
        netProfitDivine: 0.4,
        drops: [],
        tabNames: [],
        engine: 'poe2',
        goldEarned: 10000,
        bossSlain: false,
        deathCount: 1,
        waystonesFound: 1,
        runesFound: 2
      }
    ];

    it('should aggregate gold, boss kills, deaths, and drops across runs', () => {
      const stats = computePoe2SessionStats(mockRuns, 300);
      expect(stats.totalGoldEarned).toBe(15000);
      expect(stats.avgGoldPerRun).toBe(7500);
      // Total duration = 300s = 1/12 hour. 15,000 / (1/12) = 180,000 /hr
      expect(stats.activeMappingGoldPerHour).toBe(180000);
      expect(stats.sessionTotalGoldPerHour).toBe(180000);
      expect(stats.totalBossSlain).toBe(1);
      expect(stats.bossSlainRate).toBe(50);
      expect(stats.totalDeaths).toBe(1);
      expect(stats.totalWaystonesFound).toBe(3);
      expect(stats.totalRunesFound).toBe(5);
    });

    it('should be seamlessly included when calling computeSessionStats', () => {
      const sessionStats = computeSessionStats(mockRuns, 300, 150);
      expect(sessionStats.totalRuns).toBe(2);
      expect(sessionStats.totalGoldEarned).toBe(15000);
      expect(sessionStats.avgGoldPerRun).toBe(7500);
      expect(sessionStats.totalBossSlain).toBe(1);
      expect(sessionStats.totalDeaths).toBe(1);
    });
  });
});
