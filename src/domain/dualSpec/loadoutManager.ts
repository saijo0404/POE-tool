import type {
  DualWeaponLoadout,
  EquippedWeapon,
  WeaponSet,
  WeaponSlot
} from './types';
import { isValidOffHand } from './weaponClassifier';

export function createEmptyLoadout(): DualWeaponLoadout {
  return {
    set1: { mainHand: null, offHand: null },
    set2: { mainHand: null, offHand: null },
    activeSet: 'Set1'
  };
}

export function switchActiveWeaponSet(
  loadout: DualWeaponLoadout,
  targetSet?: WeaponSet
): DualWeaponLoadout {
  const nextSet = targetSet ?? (loadout.activeSet === 'Set1' ? 'Set2' : 'Set1');
  return {
    ...loadout,
    activeSet: nextSet
  };
}

export function swapWeaponSets(loadout: DualWeaponLoadout): DualWeaponLoadout {
  return {
    set1: { ...loadout.set2 },
    set2: { ...loadout.set1 },
    activeSet: loadout.activeSet
  };
}

export function equipWeaponToSet(
  loadout: DualWeaponLoadout,
  set: WeaponSet,
  slot: WeaponSlot,
  weapon: EquippedWeapon | null
): DualWeaponLoadout {
  const currentSet = set === 'Set1' ? loadout.set1 : loadout.set2;
  let newMain = currentSet.mainHand;
  let newOff = currentSet.offHand;

  if (slot === 'mainHand') {
    newMain = weapon;
    if (weapon) {
      if (weapon.isTwoHanded) {
        // If two-handed but allows quiver (Bow/Crossbow), keep quiver if already equipped
        if (newOff && !isValidOffHand(weapon.weaponType, newOff.weaponType)) {
          newOff = null;
        }
      }
    }
  } else {
    // Equipping to offHand
    newOff = weapon;
    if (weapon && newMain) {
      if (!isValidOffHand(newMain.weaponType, weapon.weaponType)) {
        // If mainHand was incompatible with this offhand (e.g. 2H melee weapon), unequip mainHand
        newMain = null;
      }
    }
  }

  const updatedConfig = { mainHand: newMain, offHand: newOff };

  return {
    ...loadout,
    set1: set === 'Set1' ? updatedConfig : loadout.set1,
    set2: set === 'Set2' ? updatedConfig : loadout.set2
  };
}

export function unequipAll(
  loadout: DualWeaponLoadout,
  targetSet?: WeaponSet
): DualWeaponLoadout {
  const empty = { mainHand: null, offHand: null };
  if (targetSet === 'Set1') {
    return { ...loadout, set1: empty };
  }
  if (targetSet === 'Set2') {
    return { ...loadout, set2: empty };
  }
  return {
    ...loadout,
    set1: empty,
    set2: empty
  };
}
