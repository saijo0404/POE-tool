import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  DualWeaponLoadout,
  WeaponSet,
  WeaponSlot,
  EquippedWeapon,
  BoundSkill,
  SkillBindingPreference,
  WeaponSetDeltaReport
} from '../domain/dualSpec';
import {
  createEmptyLoadout,
  switchActiveWeaponSet,
  equipWeaponToSet,
  resolveAllSkills,
  calculateWeaponSetDelta
} from '../domain/dualSpec';
import { DualWeaponStorage } from '../infrastructure/storage/dualWeaponStorage';

export interface UseWeaponSwapOptions {
  initialSkills?: BoundSkill[];
  hotkey?: string;
  enableHotkey?: boolean;
}

export function useWeaponSwap(options: UseWeaponSwapOptions = {}) {
  const { initialSkills = [], hotkey = 'x', enableHotkey = true } = options;

  const [loadout, setLoadout] = useState<DualWeaponLoadout>(() => {
    return DualWeaponStorage.getLoadout() || createEmptyLoadout();
  });
  const [activeSkills, setActiveSkills] = useState<BoundSkill[]>(initialSkills);
  const [isCompact, setIsCompact] = useState(false);
  const [isDeltaExpanded, setIsDeltaExpanded] = useState(false);

  const swapWeaponSet = useCallback((targetSet?: WeaponSet) => {
    setLoadout(prev => {
      const next = switchActiveWeaponSet(prev, targetSet);
      DualWeaponStorage.saveLoadout(next);
      return next;
    });
  }, []);

  const equipWeapon = useCallback((
    set: WeaponSet,
    slot: WeaponSlot,
    weapon: EquippedWeapon | null
  ) => {
    setLoadout(prev => {
      const next = equipWeaponToSet(prev, set, slot, weapon);
      DualWeaponStorage.saveLoadout(next);
      return next;
    });
  }, []);

  const bindSkill = useCallback((skillId: string, preference: SkillBindingPreference) => {
    setActiveSkills(prev =>
      prev.map(s => (s.id === skillId ? { ...s, preference } : s))
    );
  }, []);

  const toggleCompact = useCallback(() => setIsCompact(prev => !prev), []);
  const toggleDeltaExpanded = useCallback(() => setIsDeltaExpanded(prev => !prev), []);

  const deltaReport: WeaponSetDeltaReport = useMemo(() => {
    return calculateWeaponSetDelta(loadout);
  }, [loadout]);

  const resolvedSkills: BoundSkill[] = useMemo(() => {
    return resolveAllSkills(activeSkills, loadout);
  }, [activeSkills, loadout]);

  const incompatibleSkills = useMemo(() => {
    return resolvedSkills.filter(
      s => s.resolvedSet === loadout.activeSet && !s.isCompatible
    );
  }, [resolvedSkills, loadout.activeSet]);

  useEffect(() => {
    if (!enableHotkey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key.toLowerCase() === hotkey.toLowerCase() && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        swapWeaponSet();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableHotkey, hotkey, swapWeaponSet]);

  return {
    loadout,
    activeSet: loadout.activeSet,
    activeWeapon: loadout.activeSet === 'Set1' ? loadout.set1.mainHand : loadout.set2.mainHand,
    activeOffHand: loadout.activeSet === 'Set1' ? loadout.set1.offHand : loadout.set2.offHand,
    resolvedSkills,
    incompatibleSkills,
    deltaReport,
    isCompact,
    isDeltaExpanded,
    swapWeaponSet,
    equipWeapon,
    bindSkill,
    setActiveSkills,
    toggleCompact,
    toggleDeltaExpanded
  };
}
