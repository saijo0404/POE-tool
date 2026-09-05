import { describe, it, expect } from 'vitest';
import { evaluateComboChain } from '../comboSynergyEngine';
import type { ComboStep } from '../deltaTypes';

describe('comboSynergyEngine', () => {
  it('handles empty combo steps gracefully', () => {
    const report = evaluateComboChain([]);
    expect(report.synergyScore).toBe(0);
    expect(report.comboMultiplier).toBe(1.0);
    expect(report.crossWeaponSwaps).toBe(0);
    expect(report.synergiesTriggered).toHaveLength(0);
  });

  it('detects cross-weapon swaps and synergistic status combos', () => {
    // Combo: Set1 casts Oil -> Set2 casts Fire Ignite => Oil & Fire Detonation!
    const steps: ComboStep[] = [
      {
        skillId: 's1',
        skillName: '焦油箭 (Tar Arrow)',
        weaponSet: 'Set1',
        appliedEffect: 'Oil'
      },
      {
        skillId: 's2',
        skillName: '烈焰橫掃 (Flame Sweep)',
        weaponSet: 'Set2',
        appliedEffect: 'Ignite'
      }
    ];

    const report = evaluateComboChain(steps);
    expect(report.crossWeaponSwaps).toBe(1);
    expect(report.comboMultiplier).toBe(1.35); // 1.0 + 0.35
    expect(report.synergiesTriggered).toContain('焦油燃爆 (Oil & Fire Detonation)');
    expect(report.synergyScore).toBeGreaterThanOrEqual(70);
  });

  it('evaluates multi-step combo chain with freeze into shatter slam', () => {
    const steps: ComboStep[] = [
      {
        skillId: 's1',
        skillName: '冰霜新星 (Frost Nova)',
        weaponSet: 'Set1',
        appliedEffect: 'Freeze'
      },
      {
        skillId: 's2',
        skillName: '巨槌碎擊 (Heavy Slam)',
        weaponSet: 'Set2',
        consumesEffect: 'Stun'
      },
      {
        skillId: 's3',
        skillName: '處決割裂 (Execute Bleed)',
        weaponSet: 'Set1',
        appliedEffect: 'Bleed'
      }
    ];

    const report = evaluateComboChain(steps);
    expect(report.crossWeaponSwaps).toBe(2);
    expect(report.synergiesTriggered).toContain('冰凍碎裂猛擊 (Shatter Stun Slam)');
    expect(report.comboMultiplier).toBeGreaterThan(1.0);
  });

  it('gives modest synergy score when skills do not swap weapons or synergize', () => {
    const steps: ComboStep[] = [
      { skillId: 's1', skillName: '普通攻擊', weaponSet: 'Set1' },
      { skillId: 's2', skillName: '重擊', weaponSet: 'Set1' }
    ];

    const report = evaluateComboChain(steps);
    expect(report.crossWeaponSwaps).toBe(0);
    expect(report.synergiesTriggered).toHaveLength(0);
    expect(report.comboMultiplier).toBe(1.0);
    expect(report.synergyScore).toBe(40);
  });
});
