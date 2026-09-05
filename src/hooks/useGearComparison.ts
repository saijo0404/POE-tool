import { useState, useMemo, useCallback } from 'react';
import type { ParsedItem } from '../types/poe';
import {
  detectSlotFromItem,
  compareGearStats,
  type GearDeltaReport
} from '../domain/gear/gearDeltaEngine';
import {
  getEquippedGearForSlot,
  saveEquippedGear,
  removeEquippedGear
} from '../domain/gear/gearStorage';

export function useGearComparison(newItem: ParsedItem | null) {
  const slot = useMemo(() => {
    return newItem ? detectSlotFromItem(newItem) : '';
  }, [newItem]);

  const [equippedItem, setEquippedItem] = useState<ParsedItem | null>(() => {
    return slot ? getEquippedGearForSlot(slot) : null;
  });

  const deltaReport = useMemo<GearDeltaReport | null>(() => {
    if (!newItem || !equippedItem) return null;
    return compareGearStats(equippedItem, newItem);
  }, [newItem, equippedItem]);

  const handleSetCurrentAsEquipped = useCallback(() => {
    if (!newItem || !slot) return;
    saveEquippedGear(slot, newItem);
    setEquippedItem(newItem);
  }, [newItem, slot]);

  const handleClearEquipped = useCallback(() => {
    if (!slot) return;
    removeEquippedGear(slot);
    setEquippedItem(null);
  }, [slot]);

  return {
    slot,
    equippedItem,
    deltaReport,
    handleSetCurrentAsEquipped,
    handleClearEquipped
  };
}
