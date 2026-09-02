import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMapDanger } from '../useMapDanger';

// Mock SettingsContext and sound
vi.mock('../useSettings', () => ({
  useSettings: () => ({
    settings: {},
    updateSettings: vi.fn()
  })
}));

vi.mock('../../application/audio/alertSound', () => ({
  playDangerAlertSound: vi.fn()
}));

describe('useMapDanger hook', () => {
  it('should initialize with default config and regex options', () => {
    const { result } = renderHook(() => useMapDanger());
    expect(result.current.config.blacklistedModIds.length).toBeGreaterThan(0);
    expect(result.current.regexResult.regexString).toBeDefined();
  });

  it('should allow toggling mod blacklist and updating regex exclusions', () => {
    const { result } = renderHook(() => useMapDanger());

    act(() => {
      result.current.toggleModBlacklist('ele_reflect');
    });

    const isIncluded = result.current.config.blacklistedModIds.includes('ele_reflect');
    expect(result.current.regexOptions.excludeModIds.includes('ele_reflect')).toBe(isIncluded);
  });

  it('should apply build archetype presets', () => {
    const { result } = renderHook(() => useMapDanger());

    act(() => {
      result.current.applyPreset('rf_recovery_build');
    });

    expect(result.current.config.activePresetId).toBe('rf_recovery_build');
    expect(result.current.config.blacklistedModIds).toContain('no_regen');
    expect(result.current.config.blacklistedModIds).toContain('reduced_recovery');
  });

  it('should evaluate item danger and trigger alert correctly', () => {
    const { result } = renderHook(() => useMapDanger());
    const dangerousMapText = 'Item Class: Maps\nMap Tier: 16\nMonsters reflect 18% of Elemental Damage';

    act(() => {
      result.current.applyPreset('elemental_build');
    });

    const evaluation = result.current.evaluateItem(dangerousMapText, false);
    expect(evaluation.isMap).toBe(true);
    expect(evaluation.hasDanger).toBe(true);
    expect(evaluation.matchedDangerMods.some(m => m.def.id === 'ele_reflect')).toBe(true);
  });
});
