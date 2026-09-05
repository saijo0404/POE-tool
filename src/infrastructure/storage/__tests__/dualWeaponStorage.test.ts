import { describe, it, expect, beforeEach } from 'vitest';
import { DualWeaponStorage } from '../dualWeaponStorage';
import { createEmptyLoadout } from '../../../domain/dualSpec/loadoutManager';
import type { DualSpecAllocation, DualWeaponLoadout } from '../../../domain/dualSpec/types';

describe('DualWeaponStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    DualWeaponStorage.clear();
  });

  it('returns default empty loadout when storage is empty', () => {
    const loadout = DualWeaponStorage.getLoadout();
    expect(loadout).toEqual(createEmptyLoadout());
  });

  it('saves and retrieves loadout successfully', () => {
    const customLoadout: DualWeaponLoadout = {
      set1: {
        mainHand: {
          id: 'w_1',
          name: '戰弓',
          baseType: '戰弓',
          weaponType: 'Bow',
          category: 'TwoHanded',
          isTwoHanded: true
        },
        offHand: null
      },
      set2: { mainHand: null, offHand: null },
      activeSet: 'Set2'
    };

    const saved = DualWeaponStorage.saveLoadout(customLoadout);
    expect(saved).toBe(true);

    const retrieved = DualWeaponStorage.getLoadout();
    expect(retrieved.activeSet).toBe('Set2');
    expect(retrieved.set1.mainHand?.name).toBe('戰弓');
  });

  it('saves and retrieves dual spec allocation', () => {
    expect(DualWeaponStorage.getDualSpecAllocation()).toBeNull();

    const mockAllocation: DualSpecAllocation = {
      characterLevel: 85,
      maxGlobalPoints: 108,
      allocatedGlobalPoints: 90,
      maxWeaponPoints: 24,
      allocatedSet1WeaponPoints: 20,
      allocatedSet2WeaponPoints: 24,
      globalNodes: [],
      set1Nodes: [],
      set2Nodes: []
    };

    const saved = DualWeaponStorage.saveDualSpecAllocation(mockAllocation);
    expect(saved).toBe(true);

    const retrieved = DualWeaponStorage.getDualSpecAllocation();
    expect(retrieved).toEqual(mockAllocation);
  });

  it('clears storage keys cleanly', () => {
    DualWeaponStorage.saveLoadout(createEmptyLoadout());
    DualWeaponStorage.clear();

    expect(DualWeaponStorage.getDualSpecAllocation()).toBeNull();
  });
});
