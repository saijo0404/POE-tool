import { describe, it, expect } from 'vitest';
import {
  aggregateRelicStats,
  estimateRoomEV,
  forecastSanctumRun
} from '../sanctumRelicEngine';
import type { SanctumRelic, SanctumStrategyConfig } from '../types';

describe('sanctumRelicEngine', () => {
  describe('aggregateRelicStats', () => {
    it('returns empty stats for empty relics', () => {
      const stats = aggregateRelicStats([]);
      expect(stats).toEqual({});
    });

    it('aggregates multiple relic affixes by statKey', () => {
      const relics: SanctumRelic[] = [
        {
          id: 'r1',
          name: '神聖聖物 1',
          affixes: [
            { id: 'mitigation_1', nameZh: '決心減免', nameEn: 'Resolve Mitigation', statKey: 'resolveMitigation', value: 20 },
            { id: 'discount_1', nameZh: '商人折扣', nameEn: 'Merchant Discount', statKey: 'merchantDiscount', value: 25 }
          ]
        },
        {
          id: 'r2',
          name: '神聖聖物 2',
          affixes: [
            { id: 'mitigation_2', nameZh: '決心減免', nameEn: 'Resolve Mitigation', statKey: 'resolveMitigation', value: 15 },
            { id: 'divine_drop', nameZh: '額外神聖掉落', nameEn: 'Extra Divine', statKey: 'additionalDivineDrop', value: 2 }
          ]
        }
      ];

      const stats = aggregateRelicStats(relics);
      expect(stats['resolveMitigation']).toBe(35);
      expect(stats['merchantDiscount']).toBe(25);
      expect(stats['additionalDivineDrop']).toBe(2);
    });
  });

  describe('estimateRoomEV', () => {
    it('calculates combat room EV and reduces risk with resolve mitigation', () => {
      const baseline = estimateRoomEV('combat', 3, {});
      const withMitigation = estimateRoomEV('combat', 3, { resolveMitigation: 40 });

      expect(baseline.baseRiskScore).toBe(30);
      expect(withMitigation.adjustedRiskScore).toBeLessThan(baseline.adjustedRiskScore);
      expect(baseline.expectedChaos).toBeGreaterThan(0);
    });

    it('calculates boss room EV and boosts Divine when extra divine relic is equipped', () => {
      const normalBoss = estimateRoomEV('boss', 4, {});
      const extraDivineBoss = estimateRoomEV('boss', 4, { additionalDivineDrop: 2 });

      expect(extraDivineBoss.expectedDivine).toBeGreaterThan(normalBoss.expectedDivine);
    });
  });

  describe('forecastSanctumRun', () => {
    it('forecasts balanced sanctum run with survival and EV', () => {
      const config: SanctumStrategyConfig = {
        preferredPlaystyle: 'balanced',
        relics: [
          {
            id: 'r1',
            name: '商人與減免聖物',
            affixes: [
              { id: 'm1', nameZh: '決心減免', nameEn: 'Mitigation', statKey: 'resolveMitigation', value: 25 },
              { id: 'd1', nameZh: '商人折扣', nameEn: 'Discount', statKey: 'merchantDiscount', value: 30 }
            ]
          }
        ]
      };

      const result = forecastSanctumRun(config);
      expect(result.survivalRatePct).toBeGreaterThanOrEqual(60);
      expect(result.expectedTotalNetChaos).toBeGreaterThan(0);
      expect(result.expectedTotalNetDivine).toBeGreaterThan(0);
      expect(result.recommendedPath.length).toBeGreaterThan(0);
      expect(result.strategicNotes.length).toBeGreaterThan(0);
    });

    it('adapts recommendations for high_yield vs safe_clear playstyle', () => {
      const safeConfig: SanctumStrategyConfig = {
        preferredPlaystyle: 'safe_clear',
        relics: []
      };
      const yieldConfig: SanctumStrategyConfig = {
        preferredPlaystyle: 'high_yield',
        relics: []
      };

      const safeResult = forecastSanctumRun(safeConfig);
      const yieldResult = forecastSanctumRun(yieldConfig);

      expect(safeResult.recommendedPath[0]).toContain('泉水');
      expect(yieldResult.recommendedPath[0]).toContain('寶藏');
    });
  });
});
