import { describe, it, expect } from 'vitest';
import {
  createEmptyLoadout,
  switchActiveWeaponSet,
  swapWeaponSets,
  equipWeaponToSet,
  unequipAll
} from '../loadoutManager';
import type { EquippedWeapon } from '../types';

describe('loadoutManager', () => {
  const bowWeapon: EquippedWeapon = {
    id: 'bow_1',
    name: '戰弓',
    baseType: '戰弓',
    weaponType: 'Bow',
    category: 'TwoHanded',
    isTwoHanded: true
  };

  const quiverWeapon: EquippedWeapon = {
    id: 'quiver_1',
    name: '箭袋',
    baseType: '箭袋',
    weaponType: 'Quiver',
    category: 'OffHand',
    isTwoHanded: false
  };

  const greatsword: EquippedWeapon = {
    id: '2h_sword_1',
    name: '巨劍',
    baseType: '巨劍',
    weaponType: 'TwoHandSword',
    category: 'TwoHanded',
    isTwoHanded: true
  };

  const shield: EquippedWeapon = {
    id: 'shield_1',
    name: '圓盾',
    baseType: '圓盾',
    weaponType: 'Shield',
    category: 'OffHand',
    isTwoHanded: false
  };

  const oneHandAxe: EquippedWeapon = {
    id: 'axe_1',
    name: '戰斧',
    baseType: '戰斧',
    weaponType: 'OneHandAxe',
    category: 'OneHanded',
    isTwoHanded: false
  };

  it('initializes empty loadout with Set1 active', () => {
    const loadout = createEmptyLoadout();
    expect(loadout.activeSet).toBe('Set1');
    expect(loadout.set1.mainHand).toBeNull();
    expect(loadout.set1.offHand).toBeNull();
    expect(loadout.set2.mainHand).toBeNull();
    expect(loadout.set2.offHand).toBeNull();
  });

  it('switches active set between Set1 and Set2', () => {
    let loadout = createEmptyLoadout();
    loadout = switchActiveWeaponSet(loadout);
    expect(loadout.activeSet).toBe('Set2');

    loadout = switchActiveWeaponSet(loadout, 'Set1');
    expect(loadout.activeSet).toBe('Set1');
  });

  it('swaps set1 and set2 configurations', () => {
    let loadout = createEmptyLoadout();
    loadout = equipWeaponToSet(loadout, 'Set1', 'mainHand', bowWeapon);
    loadout = equipWeaponToSet(loadout, 'Set2', 'mainHand', greatsword);

    const swapped = swapWeaponSets(loadout);
    expect(swapped.set1.mainHand?.id).toBe('2h_sword_1');
    expect(swapped.set2.mainHand?.id).toBe('bow_1');
  });

  it('handles two-handed weapon and offhand compatibility upon equipping', () => {
    let loadout = createEmptyLoadout();

    // Bow allows Quiver
    loadout = equipWeaponToSet(loadout, 'Set1', 'mainHand', bowWeapon);
    loadout = equipWeaponToSet(loadout, 'Set1', 'offHand', quiverWeapon);
    expect(loadout.set1.mainHand?.weaponType).toBe('Bow');
    expect(loadout.set1.offHand?.weaponType).toBe('Quiver');

    // Equipping Two-handed melee sword unsets incompatible offhand
    loadout = equipWeaponToSet(loadout, 'Set1', 'mainHand', greatsword);
    expect(loadout.set1.mainHand?.weaponType).toBe('TwoHandSword');
    expect(loadout.set1.offHand).toBeNull();

    // Equipping shield while having greatsword unsets the 2H greatsword
    loadout = equipWeaponToSet(loadout, 'Set1', 'offHand', shield);
    expect(loadout.set1.offHand?.weaponType).toBe('Shield');
    expect(loadout.set1.mainHand).toBeNull();

    // Equipping 1H Axe and Shield is valid
    loadout = equipWeaponToSet(loadout, 'Set1', 'mainHand', oneHandAxe);
    expect(loadout.set1.mainHand?.weaponType).toBe('OneHandAxe');
    expect(loadout.set1.offHand?.weaponType).toBe('Shield');
  });

  it('unequips weapons correctly with unequipAll', () => {
    let loadout = createEmptyLoadout();
    loadout = equipWeaponToSet(loadout, 'Set1', 'mainHand', bowWeapon);
    loadout = equipWeaponToSet(loadout, 'Set2', 'mainHand', greatsword);

    const clearedSet1 = unequipAll(loadout, 'Set1');
    expect(clearedSet1.set1.mainHand).toBeNull();
    expect(clearedSet1.set2.mainHand).not.toBeNull();

    const clearedAll = unequipAll(loadout);
    expect(clearedAll.set1.mainHand).toBeNull();
    expect(clearedAll.set2.mainHand).toBeNull();
  });
});
