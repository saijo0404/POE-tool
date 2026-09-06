import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WaystoneTowerPanel } from '../WaystoneTowerPanel';

describe('WaystoneTowerPanel', () => {
  it('renders presets and sub-cards correctly', () => {
    render(<WaystoneTowerPanel />);

    expect(screen.getByText('常用終局收益策略：')).toBeInTheDocument();
    expect(screen.getByText('💰 荒漠黃金印鈔')).toBeInTheDocument();
    expect(screen.getByText('🗺️ 凍原銘刻衝階')).toBeInTheDocument();
    expect(screen.getByText('🪨 火山符文搜集')).toBeInTheDocument();
    expect(screen.getByText('🌀 沼澤狂亂機制')).toBeInTheDocument();

    expect(screen.getByText(/先祖石塔連線與碑牌插槽/)).toBeInTheDocument();
    expect(screen.getByText('生物群落 (Biome) 策略優化器')).toBeInTheDocument();
  });

  it('handles applying a strategy preset', () => {
    const onShowToast = vi.fn();
    render(<WaystoneTowerPanel onShowToast={onShowToast} />);

    const presetBtn = screen.getByText('🗺️ 凍原銘刻衝階');
    fireEvent.click(presetBtn);

    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('已套用「🗺️ 凍原銘刻衝階」'));
    expect(screen.getByText('銘刻升階')).toBeInTheDocument();
  });

  it('allows toggling towers and socketing tablets', () => {
    render(<WaystoneTowerPanel />);

    // Tower 1 is active by default; toggle it off
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    expect(checkboxes[0]).toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  it('applies recommended tablets to towers and shows toast', () => {
    const onShowToast = vi.fn();
    render(<WaystoneTowerPanel onShowToast={onShowToast} />);

    const applyBtn = screen.getByText('一鍵配置至石塔');
    fireEvent.click(applyBtn);

    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('已自動為覆蓋石塔配置最佳化先祖碑牌組合'));
  });
});
