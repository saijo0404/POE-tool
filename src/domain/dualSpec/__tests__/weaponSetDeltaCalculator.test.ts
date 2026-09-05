import { describe, it, expect } from 'vitest';
import {
  calculateAggregatedStats,
  calculateMetric,
  calculateWeaponSetDelta
} from '../weaponSetDeltaCalculator';
import type { DualWeaponLoadout, EquippedWeapon, DualSpecPassiveNode } from '../types';

describe('weaponSetDeltaCalculator', () => {
  const bowWeapon: EquippedWeapon = {
    id: 'bow_1',
    name: '戰弓',
    baseType: '戰弓',
    weaponType: 'Bow',
    category: 'TwoHanded',
    isTwoHanded: true,
    physicalDps: 300,
    elementalDps: 150,
    attacksPerSecond: 1.5,
    critChance: 6.0,
    spirit: 50
  };



  const wand: EquippedWeapon = {
    id: 'wand_1',
    name: '魔杖',
    baseType: '魔杖',
    weaponType: 'Wand',
    category: 'OneHanded',
    isTwoHanded: false,
    physicalDps: 50,
    elementalDps: 200,
    attacksPerSecond: 1.4,
    critChance: 8.0,
    spirit: 100
  };

  const shield: EquippedWeapon = {
    id: 'shield_1',
    name: '盾牌',
    baseType: '盾牌',
    weaponType: 'Shield',
    category: 'OffHand',
    isTwoHanded: false,
    spirit: 30
  };

  it('aggregates stats with passive modifiers correctly', () => {
    const passives: DualSpecPassiveNode[] = [
      {
        id: 'p1',
        name: 'Bow Damage Node',
        type: 'weapon',
        stats: { increased_damage: 20, increased_attack_speed: 10 }
      }
    ];

    const stats = calculateAggregatedStats({ mainHand: bowWeapon, offHand: null }, passives);
    // Base phys = 300, dmgMod = 1.2, speedMod = 1.1 => 300 * 1.2 * 1.1 = 396
    expect(stats.physicalDps).toBe(396);
    expect(stats.attacksPerSecond).toBe(1.65);
    expect(stats.spirit).toBe(50);
    expect(stats.isDualWield).toBe(false);
    expect(stats.hasShield).toBe(false);
  });

  it('calculates metrics and percentage changes safely', () => {
    const metric1 = calculateMetric(100, 150);
    expect(metric1.delta).toBe(50);
    expect(metric1.percentChange).toBe(50);

    const metricFromZero = calculateMetric(0, 100);
    expect(metricFromZero.delta).toBe(100);
    expect(metricFromZero.percentChange).toBe(100);

    const metricBothZero = calculateMetric(0, 0);
    expect(metricBothZero.delta).toBe(0);
    expect(metricBothZero.percentChange).toBe(0);
  });

  it('calculates complete delta report between two weapon sets', () => {
    const loadout: DualWeaponLoadout = {
      set1: { mainHand: bowWeapon, offHand: null },
      set2: { mainHand: wand, offHand: shield },
      activeSet: 'Set1'
    };

    const report = calculateWeaponSetDelta(loadout);

    expect(report.set1Stats.totalDps).toBe(450);
    expect(report.set2Stats.totalDps).toBe(250);
    expect(report.deltas.totalDps.delta).toBe(-200);
    expect(report.deltas.spirit.delta).toBe(80); // 130 - 50 = 80
    expect(report.set2Stats.hasShield).toBe(true);
    expect(report.summary.some(s => s.includes('武器組 2 啟用盾牌防禦'))).toBe(true);
  });

  it('aggregates dual wield stats with attack speed bonus', () => {
    const axe1: EquippedWeapon = {
      id: 'a1',
      name: '斧1',
      baseType: '單手斧',
      weaponType: 'OneHandAxe',
      category: 'OneHanded',
      isTwoHanded: false,
      physicalDps: 200,
      attacksPerSecond: 1.5,
      critChance: 5.0
    };
    const axe2: EquippedWeapon = {
      id: 'a2',
      name: '斧2',
      baseType: '單手斧',
      weaponType: 'OneHandAxe',
      category: 'OneHanded',
      isTwoHanded: false,
      physicalDps: 200,
      attacksPerSecond: 1.5,
      critChance: 5.0
    };

    const stats = calculateAggregatedStats({ mainHand: axe1, offHand: axe2 });
    expect(stats.isDualWield).toBe(true);
    expect(stats.attacksPerSecond).toBe(1.65); // 1.5 * 1.1
    expect(stats.physicalDps).toBe(400);
  });
});
