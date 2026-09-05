import { describe, it, expect } from 'vitest';
import {
  checkSkillCompatibility,
  resolveSkillBinding,
  resolveAllSkills,
  inferSkillRequirement
} from '../skillBindingResolver';
import type { BoundSkill, DualWeaponLoadout, EquippedWeapon } from '../types';

describe('skillBindingResolver', () => {
  const bowWeapon: EquippedWeapon = {
    id: 'bow_1',
    name: '戰弓',
    baseType: '戰弓',
    weaponType: 'Bow',
    category: 'TwoHanded',
    isTwoHanded: true
  };

  const wandWeapon: EquippedWeapon = {
    id: 'wand_1',
    name: '魔杖',
    baseType: '魔杖',
    weaponType: 'Wand',
    category: 'OneHanded',
    isTwoHanded: false
  };

  const shieldWeapon: EquippedWeapon = {
    id: 'shield_1',
    name: '塔盾',
    baseType: '塔盾',
    weaponType: 'Shield',
    category: 'OffHand',
    isTwoHanded: false
  };

  const mockLoadout: DualWeaponLoadout = {
    set1: { mainHand: bowWeapon, offHand: null },
    set2: { mainHand: wandWeapon, offHand: shieldWeapon },
    activeSet: 'Set1'
  };

  it('checks skill compatibility correctly with requirements', () => {
    const bowSkill: BoundSkill = {
      id: 'skill_1',
      name: '閃電箭',
      preference: 'Auto',
      resolvedSet: 'Set1',
      isCompatible: true,
      requirements: { allowedWeaponTypes: ['Bow'] }
    };

    expect(checkSkillCompatibility(bowSkill, mockLoadout.set1).isCompatible).toBe(true);
    expect(checkSkillCompatibility(bowSkill, mockLoadout.set2).isCompatible).toBe(false);

    const shieldSkill: BoundSkill = {
      id: 'skill_2',
      name: '盾牌衝鋒',
      preference: 'Auto',
      resolvedSet: 'Set2',
      isCompatible: true,
      requirements: { requiresShield: true }
    };

    expect(checkSkillCompatibility(shieldSkill, mockLoadout.set1).isCompatible).toBe(false);
    expect(checkSkillCompatibility(shieldSkill, mockLoadout.set2).isCompatible).toBe(true);
  });

  it('resolves skill bindings with Set1 and Set2 explicit preferences', () => {
    const skillSet1: BoundSkill = {
      id: 's1',
      name: '閃電箭',
      preference: 'Set1',
      resolvedSet: 'Set1',
      isCompatible: true,
      requirements: { allowedWeaponTypes: ['Bow'] }
    };

    const resolved1 = resolveSkillBinding(skillSet1, mockLoadout);
    expect(resolved1.resolvedSet).toBe('Set1');
    expect(resolved1.isCompatible).toBe(true);

    const skillSet2Incompatible: BoundSkill = {
      id: 's2',
      name: '閃電箭',
      preference: 'Set2',
      resolvedSet: 'Set2',
      isCompatible: true,
      requirements: { allowedWeaponTypes: ['Bow'] }
    };

    const resolved2 = resolveSkillBinding(skillSet2Incompatible, mockLoadout);
    expect(resolved2.resolvedSet).toBe('Set2');
    expect(resolved2.isCompatible).toBe(false);
    expect(resolved2.incompatibilityReason).toBeDefined();
  });

  it('automatically maps skills to compatible weapon set in Auto mode', () => {
    const bowSkill: BoundSkill = {
      id: 's_bow',
      name: '閃電箭矢',
      preference: 'Auto',
      resolvedSet: 'Set1',
      isCompatible: true,
      requirements: { allowedWeaponTypes: ['Bow'] }
    };

    const sparkSkill: BoundSkill = {
      id: 's_spark',
      name: '電球法術',
      preference: 'Auto',
      resolvedSet: 'Set1',
      isCompatible: true,
      requirements: { allowedWeaponTypes: ['Wand'] }
    };

    const resolvedBow = resolveSkillBinding(bowSkill, mockLoadout);
    expect(resolvedBow.resolvedSet).toBe('Set1');
    expect(resolvedBow.isCompatible).toBe(true);

    const resolvedSpark = resolveSkillBinding(sparkSkill, mockLoadout);
    expect(resolvedSpark.resolvedSet).toBe('Set2');
    expect(resolvedSpark.isCompatible).toBe(true);
  });

  it('infers skill requirements based on skill name keywords', () => {
    expect(inferSkillRequirement('Shield Charge').requiresShield).toBe(true);
    expect(inferSkillRequirement('盾牌衝擊').requiresShield).toBe(true);
    expect(inferSkillRequirement('Armor Piercing Crossbow Bolt').allowedWeaponTypes).toContain('Crossbow');
    expect(inferSkillRequirement('Lightning Arrow').allowedWeaponTypes).toContain('Bow');
    expect(inferSkillRequirement('旋風雙頭杖').allowedWeaponTypes).toContain('Quarterstaff');
    expect(inferSkillRequirement('火球法術 Spark').allowedWeaponTypes).toContain('Wand');
    expect(inferSkillRequirement('劈砍橫掃 Cleave').allowedWeaponTypes).toContain('TwoHandAxe');
  });

  it('resolves a batch of skills at once', () => {
    const skills: BoundSkill[] = [
      {
        id: '1',
        name: 'Bow Skill',
        preference: 'Auto',
        resolvedSet: 'Set1',
        isCompatible: true,
        requirements: { allowedWeaponTypes: ['Bow'] }
      },
      {
        id: '2',
        name: 'Shield Skill',
        preference: 'Auto',
        resolvedSet: 'Set1',
        isCompatible: true,
        requirements: { requiresShield: true }
      }
    ];

    const resolved = resolveAllSkills(skills, mockLoadout);
    expect(resolved[0].resolvedSet).toBe('Set1');
    expect(resolved[1].resolvedSet).toBe('Set2');
  });
});
