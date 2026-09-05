import { describe, it, expect } from 'vitest';
import {
  calculateOilArbitrage,
  calculateAllUpgrades,
  findAnointmentByNotable,
  calculateBlightMapEv,
} from '../blightOilEngine';
import { BLIGHT_OILS, NOTABLE_ANOINTMENTS } from '../blightData';
import type { BlightOil } from '../types';

describe('blightOilEngine', () => {
  describe('calculateOilArbitrage', () => {
    const tealOil: BlightOil = {
      id: 'teal',
      nameZh: '青藍聖油',
      nameEn: 'Teal Oil',
      tier: 5,
      defaultPriceChaos: 2,
      dropWeight: 100,
      mapEffectZh: '怪物生成速度加快',
    };

    const azureOil: BlightOil = {
      id: 'azure',
      nameZh: '天藍聖油',
      nameEn: 'Azure Oil',
      tier: 6,
      defaultPriceChaos: 8,
      dropWeight: 80,
      mapEffectZh: '地圖掉落數量提高',
    };

    it('should recommend upgrade when 3:1 recipe yields profit', () => {
      // 3 * 2 = 6c cost, sell for 8c -> +2c profit
      const result = calculateOilArbitrage(tealOil, azureOil, 2, 8);
      expect(result.fromOilId).toBe('teal');
      expect(result.toOilId).toBe('azure');
      expect(result.threeToOneCostChaos).toBe(6);
      expect(result.arbitrageProfitChaos).toBe(2);
      expect(result.recommendation).toBe('upgrade');
    });

    it('should recommend sell_raw when raw sell price is higher than upgraded yield', () => {
      // 3 * 3 = 9c cost, sell for 7c -> -2c
      const result = calculateOilArbitrage(tealOil, azureOil, 3, 7);
      expect(result.arbitrageProfitChaos).toBe(-2);
      expect(result.recommendation).toBe('sell_raw');
    });

    it('should return neutral when exact break-even', () => {
      const result = calculateOilArbitrage(tealOil, azureOil, 3, 9);
      expect(result.arbitrageProfitChaos).toBe(0);
      expect(result.recommendation).toBe('neutral');
    });
  });

  describe('calculateAllUpgrades', () => {
    it('should compute upgrades across adjacent oil tiers', () => {
      const priceMap: Record<string, number> = {
        clear: 0.2,
        sepia: 0.5,
        amber: 1,
        verdant: 2,
      };
      const subset = BLIGHT_OILS.slice(0, 4);
      const results = calculateAllUpgrades(subset, priceMap);
      expect(results.length).toBe(3); // clear->sepia, sepia->amber, amber->verdant
    });
  });

  describe('findAnointmentByNotable', () => {
    it('should find anointment by Chinese notable name', () => {
      const results = findAnointmentByNotable('主權', NOTABLE_ANOINTMENTS);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].notableNameZh).toBe('主權');
      expect(results[0].requiredOils).toEqual(['silver', 'silver', 'silver']);
    });

    it('should find anointment by English notable name (case-insensitive)', () => {
      const results = findAnointmentByNotable('charisma', NOTABLE_ANOINTMENTS);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].notableNameEn.toLowerCase()).toBe('charisma');
    });
  });

  describe('calculateBlightMapEv', () => {
    it('should calculate blighted map EV with 3 oils', () => {
      const selectedOils = ['amber', 'amber', 'amber'];
      const baseCost = 25;
      const result = calculateBlightMapEv('blighted', selectedOils, baseCost);

      expect(result.mapType).toBe('blighted');
      expect(result.selectedOilIds).toHaveLength(3);
      expect(result.totalOilCostChaos).toBeGreaterThan(0);
      expect(result.estimatedGrossChaos).toBeGreaterThan(baseCost);
      expect(result.estimatedNetProfitChaos).toBe(
        result.estimatedGrossChaos - (baseCost + result.totalOilCostChaos)
      );
    });

    it('should calculate blight-ravaged map EV with up to 9 oils', () => {
      const selectedOils = [
        'crimson', 'crimson', 'crimson',
        'opal', 'opal', 'silver',
        'golden', 'golden', 'teal'
      ];
      const baseCost = 120;
      const result = calculateBlightMapEv('blight_ravaged', selectedOils, baseCost);

      expect(result.mapType).toBe('blight_ravaged');
      expect(result.selectedOilIds).toHaveLength(9);
      expect(result.luckyChestChancePercent).toBeGreaterThan(0);
      expect(result.quantityBonusPercent).toBeGreaterThan(0);
      expect(result.estimatedGrossChaos).toBeGreaterThan(baseCost);
    });
  });
});
