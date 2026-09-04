import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePriceTrends } from '../usePriceTrends';
import * as audioModule from '../../application/audio/priceAlertSound';

vi.mock('../../application/audio/priceAlertSound', () => ({
  playPriceAlertSound: vi.fn()
}));

describe('usePriceTrends', () => {
  const onShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('initializes with default assets, selected asset and default alert rules', () => {
    const { result } = renderHook(() => usePriceTrends({ divineRate: 150, onShowToast }));

    expect(result.current.assets.length).toBeGreaterThan(0);
    expect(result.current.selectedAsset).toBeDefined();
    expect(result.current.selectedAsset.id).toBe('mageblood');
    expect(result.current.currencyMode).toBe('divine');
    expect(result.current.alertRules.length).toBeGreaterThan(0);
  });

  it('filters assets by category correctly', () => {
    const { result } = renderHook(() => usePriceTrends({ divineRate: 150, onShowToast }));

    act(() => {
      result.current.setCategoryFilter('currency');
    });

    expect(result.current.filteredAssets.every(a => a.category === 'currency')).toBe(true);

    act(() => {
      result.current.setCategoryFilter('all');
    });
    expect(result.current.filteredAssets.length).toBe(result.current.assets.length);
  });

  it('allows adding, toggling, and deleting alert rules', () => {
    const { result } = renderHook(() => usePriceTrends({ divineRate: 150, onShowToast }));

    act(() => {
      result.current.handleAddAlertRule('Headhunter', 'below', 'divine', 30);
    });

    expect(result.current.alertRules[0].assetName).toBe('Headhunter');
    expect(result.current.alertRules[0].threshold).toBe(30);

    const ruleId = result.current.alertRules[0].id;

    act(() => {
      result.current.handleToggleAlertRule(ruleId);
    });
    expect(result.current.alertRules[0].enabled).toBe(false);

    act(() => {
      result.current.handleDeleteAlertRule(ruleId);
    });
    expect(result.current.alertRules.find(r => r.id === ruleId)).toBeUndefined();
  });

  it('evaluates alert rules and triggers toast and audio alert', () => {
    const { result } = renderHook(() => usePriceTrends({ divineRate: 150, onShowToast, soundAlertEnabled: true }));

    act(() => {
      result.current.handleAddAlertRule('Mageblood (魔血)', 'above', 'divine', 100);
    });

    let triggers: unknown[] = [];
    act(() => {
      triggers = result.current.evaluateAlerts();
    });

    expect(triggers.length).toBeGreaterThan(0);
    expect(onShowToast).toHaveBeenCalled();
    expect(audioModule.playPriceAlertSound).toHaveBeenCalled();
  });
});
