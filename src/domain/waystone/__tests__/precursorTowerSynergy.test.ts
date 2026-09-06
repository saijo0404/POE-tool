import { describe, it, expect } from 'vitest';
import {
  calculateTowerResonanceMultiplier,
  calculateTowerSynergy,
  createDefaultTowerSlots
} from '../precursorTowerSynergy';
import type { TowerSlotConfig } from '../towerBiomeTypes';

describe('precursorTowerSynergy', () => {
  describe('calculateTowerResonanceMultiplier', () => {
    it('returns 1.0 for 0 or 1 active tower', () => {
      expect(calculateTowerResonanceMultiplier(0)).toBe(1.0);
      expect(calculateTowerResonanceMultiplier(1)).toBe(1.0);
    });

    it('returns 1.15 for 2 active towers', () => {
      expect(calculateTowerResonanceMultiplier(2)).toBe(1.15);
    });

    it('returns 1.35 for 3 or more active towers', () => {
      expect(calculateTowerResonanceMultiplier(3)).toBe(1.35);
      expect(calculateTowerResonanceMultiplier(4)).toBe(1.35);
    });
  });

  describe('calculateTowerSynergy', () => {
    it('calculates single tower bonuses with 1.0 multiplier', () => {
      const towers: TowerSlotConfig[] = [
        { id: 't1', name: 'Tower 1', active: true, socketedTabletIds: ['gold_bounty'] }
      ];

      const res = calculateTowerSynergy(towers);
      expect(res.activeTowerCount).toBe(1);
      expect(res.resonanceMultiplier).toBe(1.0);
      expect(res.totalGoldMultiplier).toBe(1.8);
      expect(res.totalQuantityBonus).toBe(15);
    });

    it('applies resonance multiplier when 2 towers are active', () => {
      // gold_bounty: gold 1.8 (+0.8), quant 15
      // monster_pack: pack 25, rarity 20
      const towers: TowerSlotConfig[] = [
        { id: 't1', name: 'Tower 1', active: true, socketedTabletIds: ['gold_bounty'] },
        { id: 't2', name: 'Tower 2', active: true, socketedTabletIds: ['monster_pack'] }
      ];

      const res = calculateTowerSynergy(towers);
      expect(res.activeTowerCount).toBe(2);
      expect(res.resonanceMultiplier).toBe(1.15);
      // 15 * 1.15 = 17.25 -> 17
      expect(res.totalQuantityBonus).toBe(17);
      // 25 * 1.15 = 28.75 -> 29
      expect(res.totalPackSizeBonus).toBe(29);
      // 1 + 0.8 * 1.15 = 1 + 0.92 = 1.92
      expect(res.totalGoldMultiplier).toBe(1.92);
    });

    it('applies triple resonance multiplier when 3 towers are active', () => {
      const towers: TowerSlotConfig[] = [
        { id: 't1', name: 'Tower 1', active: true, socketedTabletIds: ['gold_bounty'] },
        { id: 't2', name: 'Tower 2', active: true, socketedTabletIds: ['monster_pack'] },
        { id: 't3', name: 'Tower 3', active: true, socketedTabletIds: ['boss_empower'] }
      ];

      const res = calculateTowerSynergy(towers);
      expect(res.activeTowerCount).toBe(3);
      expect(res.resonanceMultiplier).toBe(1.35);
      // bossLootMultiplier: 1 + 1.0 * 1.35 = 2.35
      expect(res.totalBossLootMultiplier).toBe(2.35);
    });

    it('aggregates endgame mechanics chances from tablets', () => {
      const towers: TowerSlotConfig[] = [
        { id: 't1', name: 'Tower 1', active: true, socketedTabletIds: ['breach_tablet'] },
        { id: 't2', name: 'Tower 2', active: true, socketedTabletIds: ['delirium_tablet'] }
      ];

      const res = calculateTowerSynergy(towers);
      expect(res.activeMechanics).toHaveLength(2);
      const breach = res.activeMechanics.find(m => m.mechanicType === 'Breach');
      expect(breach).toBeDefined();
      // 50 * 1.15 = 57.5 -> 58
      expect(breach?.totalChance).toBe(58);
    });

    it('ignores inactive towers', () => {
      const towers: TowerSlotConfig[] = [
        { id: 't1', name: 'Tower 1', active: true, socketedTabletIds: ['gold_bounty'] },
        { id: 't2', name: 'Tower 2', active: false, socketedTabletIds: ['monster_pack'] }
      ];

      const res = calculateTowerSynergy(towers);
      expect(res.activeTowerCount).toBe(1);
      expect(res.totalPackSizeBonus).toBe(0);
    });
  });

  describe('createDefaultTowerSlots', () => {
    it('returns 3 default tower slots with initial active states', () => {
      const slots = createDefaultTowerSlots();
      expect(slots).toHaveLength(3);
      expect(slots[0].active).toBe(true);
      expect(slots[1].active).toBe(true);
      expect(slots[2].active).toBe(false);
    });
  });
});
