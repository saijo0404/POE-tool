import { vi } from 'vitest';
import type { ParsedItemMod } from '../../../types/poe';

export const mockMods: ParsedItemMod[] = [
  {
    id: 'explicit.stat_1',
    text: '+80 to maximum Life',
    englishText: '+80 to maximum Life',
    type: 'explicit',
    value: 80,
    minValue: 70,
    maxValue: 85,
    enabled: true,
  },
  {
    id: 'explicit.stat_2',
    text: '+40% to Fire Resistance',
    englishText: '+40% to Fire Resistance',
    type: 'explicit',
    value: 40,
    minValue: 35,
    enabled: false,
  },
  {
    id: 'custom_123',
    text: '+30 to Strength',
    englishText: '+30 to Strength',
    type: 'explicit',
    value: 30,
    minValue: 25,
    enabled: true,
  }
];

export const pseudoMods: ParsedItemMod[] = [
  {
    id: 'pseudo.pseudo_total_elemental_resistance',
    text: '+#% 總元素抗性 (Pseudo)',
    englishText: '+#% total Elemental Resistance',
    type: 'pseudo',
    value: 90,
    minValue: 72,
    enabled: true,
  },
  {
    id: 'explicit.stat_1',
    text: '30% increased Movement Speed',
    englishText: '30% increased Movement Speed',
    type: 'explicit',
    tier: 1,
    value: 30,
    minValue: 24,
    enabled: true,
  }
];

export function createDefaultAffixFilterProps() {
  return {
    mods: mockMods,
    tradeStatus: 'instant' as const,
    setTradeStatus: vi.fn(),
    linksMin: undefined as number | undefined,
    setLinksMin: vi.fn(),
    corruptedFilter: undefined as boolean | undefined,
    setCorruptedFilter: vi.fn(),
    itemLevelMin: undefined as number | undefined,
    setItemLevelMin: vi.fn(),
    onToggleMod: vi.fn(),
    onChangeMinValue: vi.fn(),
    onChangeMaxValue: vi.fn(),
    formatModText: (m: ParsedItemMod) => m.text,
    onAddCustomMod: vi.fn(),
    onRemoveMod: vi.fn(),
    onSearchTrade: vi.fn(),
    searching: false,
  };
}
