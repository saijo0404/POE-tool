import { describe, it, expect } from 'vitest';
import {
  calculateCategoryAllocations,
  calculateNetWorthTimeline,
  detectWealthLeapPoints,
  exportPortfolioToMarkdown,
  exportPortfolioToCSV,
  exportPortfolioToDiscord,
  generateDonutChartPaths
} from '../portfolioCalculator';
import type { StashItem, WealthSnapshot } from '../../../types/poe';
import type { PortfolioAnalysisResult } from '../types';

describe('portfolioCalculator', () => {
  const mockItems: StashItem[] = [
    {
      id: 'item-1',
      name: 'Divine Orb',
      typeLine: 'Divine Orb',
      icon: '',
      category: 'Currency',
      tabName: 'CurrencyTab',
      unitPriceChaos: 150,
      totalPriceChaos: 3000,
      unitPriceDivine: 1,
      totalPriceDivine: 20,
      stackSize: 20
    },
    {
      id: 'item-2',
      name: 'The Apothecary',
      typeLine: 'The Apothecary',
      icon: '',
      category: 'DivCard',
      tabName: 'Cards',
      unitPriceChaos: 7500,
      totalPriceChaos: 15000,
      unitPriceDivine: 50,
      totalPriceDivine: 100,
      stackSize: 2
    },
    {
      id: 'item-3',
      name: 'Deafening Essence of Envy',
      typeLine: 'Deafening Essence of Envy',
      icon: '',
      category: 'Essence',
      tabName: 'Essences',
      unitPriceChaos: 30,
      totalPriceChaos: 300,
      unitPriceDivine: 0.2,
      totalPriceDivine: 2,
      stackSize: 10
    }
  ];

  describe('calculateCategoryAllocations', () => {
    it('aggregates items into categories and computes percentages', () => {
      const allocations = calculateCategoryAllocations(mockItems, 150);
      expect(allocations.length).toBeGreaterThan(0);

      const divcard = allocations.find(a => a.category === 'DivCard');
      expect(divcard).toBeDefined();
      expect(divcard?.totalChaos).toBe(15000);
      expect(divcard?.percentage).toBeGreaterThan(80); // ~81.9%
      expect(divcard?.topItems.length).toBe(1);

      const totalPct = allocations.reduce((sum, a) => sum + a.percentage, 0);
      expect(Math.round(totalPct)).toBe(100);
    });

    it('handles empty items array gracefully', () => {
      const allocations = calculateCategoryAllocations([], 150);
      expect(allocations).toEqual([]);
    });
  });

  describe('calculateNetWorthTimeline and detectWealthLeapPoints', () => {
    const mockSnapshots: WealthSnapshot[] = [
      {
        timestamp: '2026-08-25T10:00:00Z',
        league: 'Settlers',
        totalChaos: 500,
        totalDivine: 3.3,
        chaosRate: 150,
        tabSummaries: [],
        topItems: []
      },
      {
        timestamp: '2026-08-26T10:00:00Z',
        league: 'Settlers',
        totalChaos: 1000,
        totalDivine: 6.7,
        chaosRate: 150,
        tabSummaries: [],
        topItems: []
      },
      {
        timestamp: '2026-08-27T10:00:00Z',
        league: 'Settlers',
        totalChaos: 18000, // Big jump!
        totalDivine: 120,
        chaosRate: 150,
        tabSummaries: [],
        topItems: []
      }
    ];

    it('calculates net worth timeline points', () => {
      const timeline = calculateNetWorthTimeline(mockSnapshots);
      expect(timeline.length).toBe(3);
      expect(timeline[0].totalChaos).toBe(500);
      expect(timeline[2].totalDivine).toBe(120);
    });

    it('identifies critical leap milestones (> 20% gain and > 10D change)', () => {
      const timeline = calculateNetWorthTimeline(mockSnapshots);
      const withLeaps = detectWealthLeapPoints(timeline);
      const bigJump = withLeaps.find(p => p.totalChaos === 18000);
      expect(bigJump?.isLeapPoint).toBe(true);
      expect(bigJump?.leapNote).toContain('淨值大幅飛躍');
    });
  });

  describe('exports', () => {
    const analysis: PortfolioAnalysisResult = {
      totalChaos: 18300,
      totalDivine: 122,
      divineRate: 150,
      totalGrowthPercent: 150.5,
      totalGrowthChaos: 11000,
      categories: calculateCategoryAllocations(mockItems, 150),
      timeline: []
    };

    it('exports structured markdown table and summary', () => {
      const md = exportPortfolioToMarkdown(analysis, 'Settlers');
      expect(md).toContain('# 💼 POE_tool 玩家資產組合分析總結');
      expect(md).toContain('Settlers');
      expect(md).toContain('| 品類 | 總價值 (Chaos) | 總價值 (Divine) | 佔比 (%) |');
      expect(md).toContain('命運卡 (Divination)');
    });

    it('exports CSV formatted records', () => {
      const csv = exportPortfolioToCSV(analysis.categories);
      expect(csv).toContain('Category,ChaosValue,DivineValue,Percentage,ItemCount,TopItem');
      expect(csv).toContain('DivCard,15000,100');
    });

    it('exports Discord copyable summary', () => {
      const discord = exportPortfolioToDiscord(analysis, 'Settlers');
      expect(discord).toContain('```');
      expect(discord).toContain('總淨值估算');
      expect(discord).toContain('Settlers');
    });
  });

  describe('generateDonutChartPaths', () => {
    it('generates svg arc paths for donut chart slices', () => {
      const allocations = calculateCategoryAllocations(mockItems, 150);
      const paths = generateDonutChartPaths(allocations, 100, 60);
      expect(paths.length).toBe(allocations.length);
      expect(paths[0].path).toContain('M');
      expect(paths[0].path).toContain('A');
    });

    it('returns empty array when allocations is empty', () => {
      expect(generateDonutChartPaths([], 100, 60)).toEqual([]);
    });

    it('ensures single category with 100% allocation has a non-negligible sweep (> 0.01px difference) to prevent SVG renderer arc degeneration', () => {
      const singleCategory = [{
        category: 'Currency' as const,
        label: '通貨 (Currency)',
        totalChaos: 5000,
        totalDivine: 33.3,
        percentage: 100,
        itemCount: 5,
        topItems: [],
        color: '#f59e0b'
      }];

      const paths = generateDonutChartPaths(singleCategory, 100, 60);
      expect(paths.length).toBe(1);
      const d = paths[0].path;
      const match = d.match(/M\s+([\d.-]+)\s+([\d.-]+)\s+A\s+[\d.-]+\s+[\d.-]+\s+0\s+1\s+1\s+([\d.-]+)\s+([\d.-]+)/);
      expect(match).not.toBeNull();
      if (match) {
        const [, x1Str, y1Str, x2Str, y2Str] = match;
        const dist = Math.hypot(parseFloat(x2Str) - parseFloat(x1Str), parseFloat(y2Str) - parseFloat(y1Str));
        expect(dist).toBeGreaterThanOrEqual(0.01);
      }
    });
  });
});
