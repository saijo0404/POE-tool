import type { CraftPreset } from '../../domain/crafting/types';

const STORAGE_KEY = 'poe_tool_crafting_custom_presets';
const LAST_SESSION_KEY = 'poe_tool_crafting_last_session';

export interface CraftingSessionState {
  baseItemId: string;
  ilvl: number;
  targetMods: { modId: string; maxTier: number }[];
}

export class CraftingStorage {
  static getCustomPresets(): CraftPreset[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveCustomPreset(preset: CraftPreset): boolean {
    try {
      const list = this.getCustomPresets().filter(p => p.id !== preset.id);
      list.push(preset);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }

  static deleteCustomPreset(presetId: string): boolean {
    try {
      const list = this.getCustomPresets().filter(p => p.id !== presetId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  }

  static saveLastSession(state: CraftingSessionState): void {
    try {
      localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }

  static getLastSession(): CraftingSessionState | null {
    try {
      const raw = localStorage.getItem(LAST_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
