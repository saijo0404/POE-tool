import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PrecursorTowerCard } from '../PrecursorTowerCard';
import type { TowerSlotConfig, TowerSynergyResult } from '../../../domain/waystone/towerBiomeTypes';

describe('PrecursorTowerCard', () => {
  const mockTowers: TowerSlotConfig[] = [
    { id: 't1', name: '先祖石塔 · 北部哨塔', active: true, socketedTabletIds: ['gold_bounty'] },
    { id: 't2', name: '先祖石塔 · 東側方尖柱', active: false, socketedTabletIds: [] }
  ];

  const mockSynergy: TowerSynergyResult = {
    activeTowerCount: 1,
    resonanceMultiplier: 1.0,
    totalPackSizeBonus: 0,
    totalQuantityBonus: 15,
    totalRarityBonus: 0,
    totalGoldMultiplier: 1.8,
    totalWaystoneChanceBonus: 0,
    totalRuneChanceBonus: 0,
    totalBossLootMultiplier: 1.0,
    activeMechanics: []
  };

  it('renders active tower with socketed tablet and synergy metrics', () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();

    render(
      <PrecursorTowerCard
        towers={mockTowers}
        synergy={mockSynergy}
        onToggleTower={onToggle}
        onUpdateTablet={onUpdate}
      />
    );

    expect(screen.getByText('先祖石塔連線與碑牌插槽 (Precursor Towers)')).toBeInTheDocument();
    expect(screen.getByText('1 座石塔覆蓋 (0% 共振加乘)')).toBeInTheDocument();
    expect(screen.getByText('先祖石塔 · 北部哨塔')).toBeInTheDocument();
    expect(screen.getByText('1.8x')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('triggers onToggleTower when clicking tower checkbox', () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();

    render(
      <PrecursorTowerCard
        towers={mockTowers}
        synergy={mockSynergy}
        onToggleTower={onToggle}
        onUpdateTablet={onUpdate}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('t1');
  });

  it('triggers onUpdateTablet when selecting a new tablet from dropdown', () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();

    render(
      <PrecursorTowerCard
        towers={mockTowers}
        synergy={mockSynergy}
        onToggleTower={onToggle}
        onUpdateTablet={onUpdate}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'monster_pack' } });

    expect(onUpdate).toHaveBeenCalledWith('t1', 'monster_pack');
  });
});
