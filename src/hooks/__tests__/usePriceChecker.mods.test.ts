import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePriceChecker, formatModText } from '../usePriceChecker';
import { poeApi } from '../../services/api';
import type { ParsedItem } from '../../types/poe';
import { mockParsedItem, mockTradeResult } from './priceCheckerMocks';

describe('usePriceChecker - Mod Manipulations & Formatter Suite', () => {
  const onShowToast = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('formatModText formats various mod representations', () => {
    expect(formatModText(null)).toBe('');
    expect(formatModText(undefined)).toBe('');
    expect(formatModText('+50 to Life')).toBe('+50 to Life');
    expect(formatModText({ text: '+10 to Str' })).toBe('+10 to Str');
    expect(formatModText({ name: '+20 to Dex' })).toBe('+20 to Dex');
    expect(formatModText({ description: '+30 to Int' })).toBe('+30 to Int');
    expect(formatModText({ mods: [{ text: 'Mod1' }, { text: 'Mod2' }] })).toBe('Mod1, Mod2');
    expect(formatModText({ id: 'mod.id' })).toBe('mod.id');
    expect(formatModText(123)).toBe('123');
  });

  it('handles mod toggles and adjusts min/max calculation values', async () => {
    vi.spyOn(poeApi, 'parseItem').mockResolvedValue(mockParsedItem);
    vi.spyOn(poeApi, 'searchTrade').mockResolvedValue(mockTradeResult);

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      result.current.setRawText('Rarity: Unique\nHeadhunter\nLeather Belt');
    });

    await waitFor(() => {
      expect(result.current.mods.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.handleToggleMod(0);
    });
    expect(result.current.mods[0].enabled).toBe(true);

    act(() => {
      result.current.handleChangeMinValue(0, 35);
    });
    expect(result.current.mods[0].minValue).toBe(35);

    act(() => {
      result.current.handleChangeMaxValue(0, 60);
    });
    expect(result.current.mods[0].maxValue).toBe(60);
  });

  it('supports adding and removing custom mods', async () => {
    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    act(() => {
      result.current.handleAddCustomMod({
        text: '+100 to Maximum Life',
        value: 100,
        minValue: 85,
      });
    });

    expect(result.current.mods.length).toBe(1);
    expect(result.current.mods[0].text).toBe('+100 to Maximum Life');
    expect(result.current.mods[0].minValue).toBe(85);

    act(() => {
      result.current.handleRemoveMod(0);
    });
    expect(result.current.mods.length).toBe(0);
  });

  it('generates pseudo stats and adjusts min values when rollPercentage is changed', async () => {
    const mockRareItem: ParsedItem = {
      name: '暴怒 避難所',
      baseType: '罪魔邪冠',
      rarity: 'Rare',
      language: 'zh',
      rawText: 'Rarity: Rare\n罪魔邪冠',
      implicits: [],
      explicits: [
        { id: 'explicit.fire', text: '+30% 火焰抗性', englishText: '+30% to Fire Resistance', value: 30, type: 'explicit', tier: 4, enabled: false },
        { id: 'explicit.cold', text: '+30% 冰冷抗性', englishText: '+30% to Cold Resistance', value: 30, type: 'explicit', tier: 4, enabled: false },
        { id: 'explicit.ms', text: '增加 30% 移動速度', englishText: '30% increased Movement Speed', value: 30, type: 'explicit', tier: 1, enabled: true },
      ]
    };

    vi.spyOn(poeApi, 'parseItem').mockResolvedValue(mockRareItem);
    vi.spyOn(poeApi, 'searchTrade').mockResolvedValue(mockTradeResult);

    const { result } = renderHook(() =>
      usePriceChecker({ league: 'Settlers', onShowToast })
    );

    await act(async () => {
      result.current.setRawText('Rarity: Rare\n罪魔邪冠');
    });

    await waitFor(() => {
      expect(result.current.parsedItem).toEqual(mockRareItem);
    });

    const pseudoEle = result.current.mods.find(m => m.id === 'pseudo.pseudo_total_elemental_resistance');
    expect(pseudoEle).toBeDefined();
    expect(pseudoEle?.enabled).toBe(true);
    expect(pseudoEle?.value).toBe(60);
    expect(pseudoEle?.minValue).toBe(48);

    act(() => {
      result.current.setRollPercentage(90);
    });

    expect(result.current.rollPercentage).toBe(90);
    const updatedPseudo = result.current.mods.find(m => m.id === 'pseudo.pseudo_total_elemental_resistance');
    expect(updatedPseudo?.minValue).toBe(54);
  });
});
