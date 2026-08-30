import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActLevelingGuide } from '../../ActLevelingGuide';
import type { IStoragePort } from '../../../application/ports/IStoragePort';

describe('ActLevelingGuide with IStoragePort', () => {
  it('loads class and completed steps from injected storage', () => {
    const mockStorage: IStoragePort = {
      getItem: vi.fn(<T,>(key: string, defaultVal: T): T => {
        if (key === 'poe_act_guide_selected_class') return 'shadow' as unknown as T;
        if (key === 'poe_act_guide_completed_steps') return ['act1_strand'] as unknown as T;
        return defaultVal;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const onShowToast = vi.fn();
    render(<ActLevelingGuide onShowToast={onShowToast} storage={mockStorage} />);

    expect(screen.getByText('拓荒章節快速攻略助手 (Act Leveling Guide)')).toBeDefined();
    expect(mockStorage.getItem).toHaveBeenCalledWith('poe_act_guide_selected_class', 'witch');
    expect(mockStorage.getItem).toHaveBeenCalledWith('poe_act_guide_completed_steps', null);
  });

  it('updates class and writes to injected storage on class selection', () => {
    const mockStorage: IStoragePort = {
      getItem: vi.fn(<T,>(_key: string, defaultVal: T): T => defaultVal),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const onShowToast = vi.fn();
    render(<ActLevelingGuide onShowToast={onShowToast} storage={mockStorage} />);

    const rangerBtn = screen.getByText('遊俠 (Ranger)');
    fireEvent.click(rangerBtn);

    expect(mockStorage.setItem).toHaveBeenCalledWith('poe_act_guide_selected_class', 'ranger');
    expect(onShowToast).toHaveBeenCalledWith('🧙‍♂️ 已切換起手職業為：RANGER');
  });
});
