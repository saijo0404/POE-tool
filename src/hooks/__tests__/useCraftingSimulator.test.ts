import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCraftingSimulator } from '../useCraftingSimulator';
import { CRAFT_PRESETS } from '../../domain/crafting/craftingPresets';

// Mock ninja rates hook
vi.mock('../atlas/useAtlasNinjaRates', () => ({
  useAtlasNinjaRates: () => ({
    ninjaRates: {
      'Deafening Essence of Greed': 5,
      'Pristine Fossil': 3,
    },
    isRatesLoading: false,
  }),
}));

describe('useCraftingSimulator Hook Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default body armour and first preset targets', () => {
    const { result } = renderHook(() => useCraftingSimulator({ league: 'Settlers', divineRate: 150 }));

    expect(result.current.selectedClass).toBe('body_armour');
    expect(result.current.selectedBase).toBeDefined();
    expect(result.current.ilvl).toBe(86);
    expect(result.current.targetMods.length).toBeGreaterThan(0);
    expect(result.current.actuaryResult).toBeDefined();
    expect(result.current.actuaryResult?.evaluations.length).toBe(4);
  });

  it('should change item class and reset base/targets appropriately', () => {
    const { result } = renderHook(() => useCraftingSimulator());

    act(() => {
      result.current.handleClassChange('boots');
    });

    expect(result.current.selectedClass).toBe('boots');
    expect(result.current.selectedBase.itemClass).toBe('boots');
    expect(result.current.targetMods).toEqual([]);
  });

  it('should toggle target mods and apply presets', () => {
    const onShowToast = vi.fn();
    const { result } = renderHook(() => useCraftingSimulator({ onShowToast }));

    // Apply preset 2 (Boots)
    act(() => {
      result.current.handleApplyPreset(CRAFT_PRESETS[1].id);
    });

    expect(result.current.selectedClass).toBe('boots');
    expect(result.current.targetMods.length).toBe(CRAFT_PRESETS[1].targetMods.length);
    expect(onShowToast).toHaveBeenCalled();

    // Toggle a mod off
    const modToToggle = result.current.targetMods[0].modId;
    act(() => {
      result.current.handleToggleTargetMod(modToToggle, 1);
    });

    expect(result.current.targetMods.some(t => t.modId === modToToggle)).toBe(false);
  });

  it('should simulate craft roll and track attempts & spent chaos', () => {
    const { result } = renderHook(() => useCraftingSimulator());

    expect(result.current.simulatedItem).toBeNull();

    act(() => {
      result.current.handleRollOnce();
    });

    expect(result.current.simulatedItem).toBeDefined();
    expect(result.current.simulatedItem?.attemptCount).toBe(1);
    expect(result.current.simulatedItem?.totalSpentChaos).toBeGreaterThan(0);

    act(() => {
      result.current.handleResetSimulation();
    });

    expect(result.current.simulatedItem).toBeNull();
  });
});
