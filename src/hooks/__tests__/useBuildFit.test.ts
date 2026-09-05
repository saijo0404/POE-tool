import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBuildFit } from '../useBuildFit';
import type { ParsedItem } from '../../types/poe';

describe('useBuildFit', () => {
  const testItem: ParsedItem = {
    name: '精魂之盔',
    baseType: '皇家輕盔',
    rarity: 'Rare',
    language: 'en',
    rawText: '',
    implicits: [],
    explicits: [
      { id: '1', text: '+95 to maximum Life', englishText: '+95 to maximum Life', type: 'explicit', enabled: true },
      { id: '2', text: '+42% to Fire Resistance', englishText: '+42% to Fire Resistance', type: 'explicit', enabled: true }
    ]
  };

  it('evaluates item against initial default preset', () => {
    const { result } = renderHook(() => useBuildFit(testItem));

    expect(result.current.presets.length).toBeGreaterThan(0);
    expect(result.current.selectedPresetId).toBeDefined();
    expect(result.current.evaluation).not.toBeNull();
    expect(result.current.evaluation?.totalScore).toBeGreaterThan(0);
  });

  it('switches active preset and recalculates score', () => {
    const { result } = renderHook(() => useBuildFit(testItem));

    act(() => {
      result.current.handleSelectPreset('ele_bow_crit');
    });

    expect(result.current.selectedPresetId).toBe('ele_bow_crit');
    expect(result.current.activePreset.id).toBe('ele_bow_crit');
  });

  it('returns null evaluation when parsedItem is null', () => {
    const { result } = renderHook(() => useBuildFit(null));
    expect(result.current.evaluation).toBeNull();
  });
});
