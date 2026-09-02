import { describe, it, expect, vi } from 'vitest';
import type { MappingSession, MappingSessionStats } from '../types';
import { formatDuration, generateDiscordMappingReport, exportMappingSessionCsv } from '../mappingExport';

describe('mappingExport', () => {
  describe('formatDuration', () => {
    it('should format seconds into mm:ss', () => {
      expect(formatDuration(45)).toBe('0m 45s');
      expect(formatDuration(125)).toBe('2m 05s');
    });

    it('should format hours when >= 3600 seconds', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
    });
  });

  const mockSession: MappingSession = {
    id: 's1',
    name: '8-Mod Dunes Farming',
    league: 'Settlers',
    strategyName: '軍團大軍 (Legion Dunes)',
    defaultInvestment: {
      mapCostChaos: 5,
      scarabsCostChaos: 20,
      craftCostChaos: 5,
      otherCostChaos: 0,
      totalCostChaos: 30,
      totalCostDivine: 0.2
    },
    selectedTabNames: ['Dump 1'],
    runs: [
      {
        id: 'r1',
        runNumber: 1,
        startTime: 1000,
        endTime: 1180,
        durationSeconds: 180,
        investment: {
          mapCostChaos: 5,
          scarabsCostChaos: 20,
          craftCostChaos: 5,
          otherCostChaos: 0,
          totalCostChaos: 30,
          totalCostDivine: 0.2
        },
        grossRevenueChaos: 180,
        grossRevenueDivine: 1.2,
        netProfitChaos: 150,
        netProfitDivine: 1.0,
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
        tabNames: ['Dump 1']
      }
    ],
    createdAt: 1000,
    updatedAt: 1200
  };

  const mockStats: MappingSessionStats = {
    totalRuns: 1,
    totalDurationSeconds: 180,
    avgDurationSeconds: 180,
    totalCostChaos: 30,
    totalCostDivine: 0.2,
    totalRevenueChaos: 180,
    totalRevenueDivine: 1.2,
    totalNetProfitChaos: 150,
    totalNetProfitDivine: 1.0,
    activeMappingDivPerHour: 20,
    activeMappingChaosPerHour: 3000,
    sessionTotalDivPerHour: 20,
    sessionTotalChaosPerHour: 3000,
    topDrops: [
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
    ]
  };

  describe('generateDiscordMappingReport', () => {
    it('should generate properly formatted discord markdown report', () => {
      const report = generateDiscordMappingReport(mockSession, mockStats);
      expect(report).toContain('**Path of Exile 刷圖收益統計結算報表 (Settlers)**');
      expect(report).toContain('**8-Mod Dunes Farming**');
      expect(report).toContain('軍團大軍 (Legion Dunes)');
      expect(report).toContain('總刷圖場次: **1 場**');
      expect(report).toContain('平均每場耗時: **3m 00s**');
      expect(report).toContain('累積淨利潤: **1 Divine** (150 Chaos)');
      expect(report).toContain('純刷圖淨時薪: **20 Div/hr**');
      expect(report).toContain('**Divine Orb** x1 ≈ 150c (1 Div)');
    });
  });

  describe('exportMappingSessionCsv', () => {
    it('should invoke toast when no runs exist', () => {
      const toastSpy = vi.fn();
      const emptySession = { ...mockSession, runs: [] };
      exportMappingSessionCsv(emptySession, mockStats, toastSpy);
      expect(toastSpy).toHaveBeenCalledWith('目前尚無已完成的刷圖場次資料可匯出');
    });
  });
});
