import type { ParsedItem } from '../item/types';

const STORAGE_KEY = 'poe_equipped_gear_v1';

export function loadAllEquippedGear(): Record<string, ParsedItem> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveEquippedGear(slot: string, item: ParsedItem): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const current = loadAllEquippedGear();
  current[slot] = item;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function removeEquippedGear(slot: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const current = loadAllEquippedGear();
  delete current[slot];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function getEquippedGearForSlot(slot: string): ParsedItem | null {
  const all = loadAllEquippedGear();
  return all[slot] || null;
}
