import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeaponSwap } from '../useWeaponSwap';
import { DualWeaponStorage } from '../../infrastructure/storage/dualWeaponStorage';
import type { BoundSkill, EquippedWeapon } from '../../domain/dualSpec';

describe('useWeaponSwap', () => {
  beforeEach(() => {
    localStorage.clear();
    DualWeaponStorage.clear();
  });

  const bowWeapon: EquippedWeapon = {
    id: 'bow_1',
    name: '戰弓',
    baseType: '戰弓',
    weaponType: 'Bow',
    category: 'TwoHanded',
    isTwoHanded: true,
    physicalDps: 300,
    attacksPerSecond: 1.5,
    critChance: 6.0,
    spirit: 50
  };

  const wandWeapon: EquippedWeapon = {
    id: 'wand_1',
    name: '魔杖',
    baseType: '魔杖',
    weaponType: 'Wand',
    category: 'OneHanded',
    isTwoHanded: false,
    physicalDps: 50,
    attacksPerSecond: 1.4,
    critChance: 8.0,
    spirit: 80
  };

  it('initializes with default Set1 and empty loadout', () => {
    const { result } = renderHook(() => useWeaponSwap());

    expect(result.current.activeSet).toBe('Set1');
    expect(result.current.activeWeapon).toBeNull();
    expect(result.current.isCompact).toBe(false);
    expect(result.current.isDeltaExpanded).toBe(false);
  });

  it('equips weapon and switches active weapon sets', () => {
    const { result } = renderHook(() => useWeaponSwap());

    act(() => {
      result.current.equipWeapon('Set1', 'mainHand', bowWeapon);
      result.current.equipWeapon('Set2', 'mainHand', wandWeapon);
    });

    expect(result.current.activeWeapon?.name).toBe('戰弓');

    act(() => {
      result.current.swapWeaponSet('Set2');
    });

    expect(result.current.activeSet).toBe('Set2');
    expect(result.current.activeWeapon?.name).toBe('魔杖');
  });

  it('detects incompatible skills when switching between weapon sets', () => {
    const skills: BoundSkill[] = [
      {
        id: 'bow_skill',
        name: '閃電箭',
        preference: 'Auto',
        resolvedSet: 'Set1',
        isCompatible: true,
        requirements: { allowedWeaponTypes: ['Bow'] }
      }
    ];

    const { result } = renderHook(() => useWeaponSwap({ initialSkills: skills }));

    act(() => {
      result.current.equipWeapon('Set1', 'mainHand', bowWeapon);
      result.current.equipWeapon('Set2', 'mainHand', wandWeapon);
    });

    expect(result.current.incompatibleSkills).toHaveLength(0);

    // Switch to Set2 where wand is equipped: bow_skill should now be incompatible if activeSet is Set2!
    act(() => {
      result.current.swapWeaponSet('Set2');
      result.current.bindSkill('bow_skill', 'Set2');
    });

    expect(result.current.incompatibleSkills).toHaveLength(1);
    expect(result.current.incompatibleSkills[0].name).toBe('閃電箭');
  });

  it('toggles compact and delta expanded state', () => {
    const { result } = renderHook(() => useWeaponSwap());

    expect(result.current.isCompact).toBe(false);
    act(() => {
      result.current.toggleCompact();
    });
    expect(result.current.isCompact).toBe(true);

    expect(result.current.isDeltaExpanded).toBe(false);
    act(() => {
      result.current.toggleDeltaExpanded();
    });
    expect(result.current.isDeltaExpanded).toBe(true);
  });

  it('handles hotkey keydown listener for weapon swap', () => {
    const { result } = renderHook(() => useWeaponSwap({ hotkey: 'x', enableHotkey: true }));

    expect(result.current.activeSet).toBe('Set1');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    });

    expect(result.current.activeSet).toBe('Set2');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'X' }));
    });

    expect(result.current.activeSet).toBe('Set1');
  });
});
