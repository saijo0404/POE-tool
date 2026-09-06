import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BiomeOptimizerCard } from '../BiomeOptimizerCard';
import { optimizeBiomeStrategy } from '../../../domain/waystone/biomeStrategyOptimizer';

describe('BiomeOptimizerCard', () => {
  const mockRec = optimizeBiomeStrategy('desert', 'gold', 2);

  it('renders biome options, goals, and strategic advice', () => {
    const onSelectBiome = vi.fn();
    const onSelectGoal = vi.fn();
    const onApply = vi.fn();

    render(
      <BiomeOptimizerCard
        selectedBiome="desert"
        selectedGoal="gold"
        recommendation={mockRec}
        onSelectBiome={onSelectBiome}
        onSelectGoal={onSelectGoal}
        onApplyTablets={onApply}
      />
    );

    expect(screen.getByText('生物群落 (Biome) 策略優化器')).toBeInTheDocument();
    expect(screen.getByText(/契合評分：/)).toBeInTheDocument();
    expect(screen.getByText('黃金收益')).toBeInTheDocument();
    expect(screen.getByText('高階通貨')).toBeInTheDocument();
    expect(screen.getByText('荒漠乾燥生態')).toBeInTheDocument();
    expect(screen.getByText(/黃金賞金碑牌/)).toBeInTheDocument();
  });

  it('triggers onSelectBiome when clicking another biome', () => {
    const onSelectBiome = vi.fn();
    const onSelectGoal = vi.fn();

    render(
      <BiomeOptimizerCard
        selectedBiome="desert"
        selectedGoal="gold"
        recommendation={mockRec}
        onSelectBiome={onSelectBiome}
        onSelectGoal={onSelectGoal}
      />
    );

    const jungleBtn = screen.getByText('繁茂密林生態');
    fireEvent.click(jungleBtn);

    expect(onSelectBiome).toHaveBeenCalledWith('jungle');
  });

  it('triggers onSelectGoal when clicking a different goal button', () => {
    const onSelectBiome = vi.fn();
    const onSelectGoal = vi.fn();

    render(
      <BiomeOptimizerCard
        selectedBiome="desert"
        selectedGoal="gold"
        recommendation={mockRec}
        onSelectBiome={onSelectBiome}
        onSelectGoal={onSelectGoal}
      />
    );

    const waystoneGoal = screen.getByText('銘刻升階');
    fireEvent.click(waystoneGoal);

    expect(onSelectGoal).toHaveBeenCalledWith('waystones');
  });

  it('triggers onApplyTablets with recommended tablet IDs', () => {
    const onSelectBiome = vi.fn();
    const onSelectGoal = vi.fn();
    const onApply = vi.fn();

    render(
      <BiomeOptimizerCard
        selectedBiome="desert"
        selectedGoal="gold"
        recommendation={mockRec}
        onSelectBiome={onSelectBiome}
        onSelectGoal={onSelectGoal}
        onApplyTablets={onApply}
      />
    );

    const applyBtn = screen.getByText('一鍵配置至石塔');
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalledWith(mockRec.recommendedTabletIds);
  });
});
