import type { DualWeaponLoadout, DualSpecAllocation } from '../../domain/dualSpec/types';
import { createEmptyLoadout } from '../../domain/dualSpec/loadoutManager';
import { namespacedStorage } from './StorageNamespaceAdapter';

const LOADOUT_STORAGE_KEY = 'dual_weapon_loadout';
const DUAL_SPEC_STORAGE_KEY = 'dual_spec_allocation';

export class DualWeaponStorage {
  static getLoadout(): DualWeaponLoadout {
    try {
      const defaultVal = createEmptyLoadout();
      return namespacedStorage.getItem<DualWeaponLoadout>(LOADOUT_STORAGE_KEY, defaultVal);
    } catch {
      return createEmptyLoadout();
    }
  }

  static saveLoadout(loadout: DualWeaponLoadout): boolean {
    try {
      namespacedStorage.setItem<DualWeaponLoadout>(LOADOUT_STORAGE_KEY, loadout);
      return true;
    } catch {
      return false;
    }
  }

  static getDualSpecAllocation(): DualSpecAllocation | null {
    try {
      return namespacedStorage.getItem<DualSpecAllocation | null>(DUAL_SPEC_STORAGE_KEY, null);
    } catch {
      return null;
    }
  }

  static saveDualSpecAllocation(allocation: DualSpecAllocation): boolean {
    try {
      namespacedStorage.setItem<DualSpecAllocation>(DUAL_SPEC_STORAGE_KEY, allocation);
      return true;
    } catch {
      return false;
    }
  }

  static clear(): void {
    try {
      namespacedStorage.removeItem(LOADOUT_STORAGE_KEY);
      namespacedStorage.removeItem(DUAL_SPEC_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
