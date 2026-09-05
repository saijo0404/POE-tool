import { describe, it, expect } from 'vitest';
import {
  calculateTujenHaggle,
  calculateDannigArbitrage,
  calculateLogbookEv,
} from '../expeditionEngine';
import { EXPEDITION_REMNANTS } from '../expeditionData';

describe('expeditionEngine', () => {
  describe('calculateTujenHaggle', () => {
    it('should calculate safe offer, aggressive offer, and estimated savings', () => {
      const askingPrice = 100;
      const advice = calculateTujenHaggle(askingPrice);

      expect(advice.askingPrice).toBe(100);
      expect(advice.firstOfferSafe).toBe(52);
      expect(advice.firstOfferAggressive).toBe(45);
      expect(advice.secondCounterOffer).toBe(68);
      expect(advice.estimatedSavings).toBe(48);
      expect(advice.savingsPercent).toBe(48);
      expect(advice.tipZh).toContain('首出');
    });

    it('should handle small asking prices gracefully', () => {
      const advice = calculateTujenHaggle(10);
      expect(advice.firstOfferSafe).toBe(5);
      expect(advice.firstOfferAggressive).toBe(5);
      expect(advice.secondCounterOffer).toBe(7);
      expect(advice.estimatedSavings).toBe(5);
    });
  });

  describe('calculateDannigArbitrage', () => {
    it('should calculate arbitrage profit when converting sun artifacts at discount', () => {
      // 100 sun artifacts (each 2c = 200c value)
      // Converted at 0.6 ratio yields 100 / 0.6 = 166.67 target artifacts (each 1.5c = 250c)
      // net profit = 50c
      const res = calculateDannigArbitrage(100, 'black_scythe', 2.0, 1.5, 0.6);
      expect(res.convertedCount).toBeGreaterThan(100);
      expect(res.netProfitChaos).toBeGreaterThan(0);
    });

    it('should return zero or negative when conversion is unfavorable', () => {
      const res = calculateDannigArbitrage(100, 'order', 3.0, 1.0, 0.8);
      expect(res.netProfitChaos).toBeLessThan(0);
    });
  });

  describe('calculateLogbookEv', () => {
    it('should calculate basic logbook EV without remnants', () => {
      const res = calculateLogbookEv('black_scythe', 83, [], 60);
      expect(res.selectedFaction).toBe('black_scythe');
      expect(res.areaLevel).toBe(83);
      expect(res.hasDeadlyAffixes).toBe(false);
      expect(res.estimatedGrossChaos).toBeGreaterThan(60);
      expect(res.netProfitChaos).toBe(res.estimatedGrossChaos - 60);
      expect(res.recommendation).toBe('run');
    });

    it('should flag deadly affixes and warn player', () => {
      const deadlyRemnant = EXPEDITION_REMNANTS.find((r) => r.isDeadly)!.id;
      const res = calculateLogbookEv('sun', 83, [deadlyRemnant], 70);

      expect(res.hasDeadlyAffixes).toBe(true);
      expect(res.deadlyRemnantNames.length).toBeGreaterThan(0);
      expect(res.recommendation).toBe('warning_deadly');
    });

    it('should multiply rewards when duplicate runic monster remnant is selected', () => {
      const baseRes = calculateLogbookEv('black_scythe', 83, [], 60);
      const dupRemnant = EXPEDITION_REMNANTS.find((r) => r.id === 'duplicated_runic')!.id;
      const boostedRes = calculateLogbookEv('black_scythe', 83, [dupRemnant], 60);

      expect(boostedRes.totalRunicMonsterBonus).toBeGreaterThan(baseRes.totalRunicMonsterBonus);
      expect(boostedRes.estimatedGrossChaos).toBeGreaterThan(baseRes.estimatedGrossChaos);
    });
  });
});
