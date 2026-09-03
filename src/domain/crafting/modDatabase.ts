import type { CraftMod } from './types';
import { PREFIX_MODS } from './modDatabasePrefixes';
import { SUFFIX_MODS } from './modDatabaseSuffixes';

export { PREFIX_MODS, SUFFIX_MODS };

export const CRAFT_MODS: CraftMod[] = [...PREFIX_MODS, ...SUFFIX_MODS];

export function getModById(modId: string): CraftMod | undefined {
  return CRAFT_MODS.find(m => m.id === modId);
}
