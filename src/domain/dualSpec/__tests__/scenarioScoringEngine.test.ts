import { describe, it, expect } from 'vitest';
import { evaluateScenarioFit } from '../scenarioScoringEngine';
import type { DualWeaponLoadout, EquippedWeapon } from '../types';
import type { ComboSynergyReport } from '../deltaTypes';

describe('scenarioScoringEngine', () => {
  const bowWeapon: EquippedWeapon = {
    id: 'bow_1',
    name: '高級戰弓',
    baseType: '戰弓',
    weaponType: 'Bow',
    category: 'TwoHanded',
    isTwoHanded: true,
    physicalDps: 450,
    attacksPerSecond: 1.8,
    critChance: 8.5
  };

  const swordAndShieldLoadout: DualWeaponLoadout = {
    set1: {
      mainHand: {
        id: 's_1',
        name: '單手劍',
        baseType: '細劍',
        weaponType: 'OneHandSword',
        category: 'OneHanded',
        isTwoHanded: false,
        physicalDps: 600,
        attacksPerSecond: 1.7,
        critChance: 9.0
      },
      offHand: {
        id: 'sh_1',
        name: '塔盾',
        baseType: '塔盾',
        weaponType: 'Shield',
        category: 'OffHand',
        isTwoHanded: false
      }
    },
    set2: { mainHand: bowWeapon, offHand: null },
    activeSet: 'Set1'
  };

  const weakLoadout: DualWeaponLoadout = {
    set1: {
      mainHand: {
        id: 'w_1',
        name: '破舊木棒',
        baseType: '單手槌',
        weaponType: 'OneHandMace',
        category: 'OneHanded',
        isTwoHanded: false,
        physicalDps: 50,
        attacksPerSecond: 1.1,
        critChance: 5.0
      },
      offHand: null
    },
    set2: { mainHand: null, offHand: null },
    activeSet: 'Set1'
  };

  it('scores high for clearing scenario with fast attack speed and high dps', () => {
    const report = evaluateScenarioFit(swordAndShieldLoadout, 'clearing');
    expect(report.score).toBeGreaterThanOrEqual(70);
    expect(['S', 'A']).toContain(report.grade);
    expect(report.strengths.some(s => s.includes('出色的攻擊/施法頻率'))).toBe(true);
  });

  it('scores high for bossing scenario with shield defense and high single target dps', () => {
    const mockCombo: ComboSynergyReport = {
      steps: [],
      synergyScore: 85,
      crossWeaponSwaps: 2,
      comboMultiplier: 1.3,
      synergiesTriggered: ['焦油燃爆 (Oil & Fire Detonation)']
    };

    const report = evaluateScenarioFit(swordAndShieldLoadout, 'bossing', mockCombo);
    expect(report.score).toBeGreaterThanOrEqual(70);
    expect(['S', 'A']).toContain(report.grade);
    expect(report.strengths.some(s => s.includes('配備盾牌'))).toBe(true);
    expect(report.strengths.some(s => s.includes('焦油燃爆'))).toBe(true);
  });

  it('identifies weaknesses and gives recommendations for under-geared loadout', () => {
    const report = evaluateScenarioFit(weakLoadout, 'bossing');
    expect(report.grade).toBe('C');
    expect(report.score).toBeLessThan(50);
    expect(report.weaknesses.some(w => w.includes('當前裝備基礎傷害偏低'))).toBe(true);
    expect(report.weaknesses.some(w => w.includes('攻堅王戰缺乏盾牌防禦機制'))).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('supports balanced scenario evaluation', () => {
    const report = evaluateScenarioFit(swordAndShieldLoadout, 'balanced');
    expect(report.scenario).toBe('balanced');
    expect(report.score).toBeGreaterThan(0);
  });
});
