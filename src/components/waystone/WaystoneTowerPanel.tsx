import React, { useState, useMemo, useCallback } from 'react';
import { PrecursorTowerCard } from './PrecursorTowerCard';
import { BiomeOptimizerCard } from './BiomeOptimizerCard';
import type {
  TowerSlotConfig,
  PoE2BiomeType,
  PoE2FarmingGoal
} from '../../domain/waystone/towerBiomeTypes';
import {
  createDefaultTowerSlots,
  calculateTowerSynergy
} from '../../domain/waystone/precursorTowerSynergy';
import { optimizeBiomeStrategy } from '../../domain/waystone/biomeStrategyOptimizer';

interface WaystoneTowerPanelProps {
  onShowToast?: (msg: string) => void;
}

interface StrategyPreset {
  label: string;
  biome: PoE2BiomeType;
  goal: PoE2FarmingGoal;
  tablets: [string, string, string];
}

const PRESET_STRATEGIES: StrategyPreset[] = [
  { label: '💰 荒漠黃金印鈔', biome: 'desert', goal: 'gold', tablets: ['gold_bounty', 'monster_pack', 'ritual_tablet'] },
  { label: '🗺️ 凍原銘刻衝階', biome: 'tundra', goal: 'waystones', tablets: ['waystone_surveyor', 'monster_pack', 'boss_empower'] },
  { label: '🪨 火山符文搜集', biome: 'volcanic', goal: 'runes', tablets: ['runic_essence', 'expedition_tablet', 'monster_pack'] },
  { label: '🌀 沼澤狂亂機制', biome: 'swamp', goal: 'mechanics', tablets: ['breach_tablet', 'delirium_tablet', 'expedition_tablet'] }
];

export const WaystoneTowerPanel: React.FC<WaystoneTowerPanelProps> = ({ onShowToast }) => {
  const [towers, setTowers] = useState<TowerSlotConfig[]>(createDefaultTowerSlots);
  const [selectedBiome, setSelectedBiome] = useState<PoE2BiomeType>('desert');
  const [selectedGoal, setSelectedGoal] = useState<PoE2FarmingGoal>('gold');

  const synergy = useMemo(() => calculateTowerSynergy(towers), [towers]);
  const recommendation = useMemo(() => {
    return optimizeBiomeStrategy(selectedBiome, selectedGoal, synergy.activeTowerCount);
  }, [selectedBiome, selectedGoal, synergy.activeTowerCount]);

  const handleToggleTower = useCallback((towerId: string) => {
    setTowers(prev => prev.map(t => (t.id === towerId ? { ...t, active: !t.active } : t)));
  }, []);

  const handleUpdateTablet = useCallback((towerId: string, tabletId: string) => {
    setTowers(prev =>
      prev.map(t => (t.id === towerId ? { ...t, socketedTabletIds: tabletId ? [tabletId] : [] } : t))
    );
  }, []);

  const handleApplyTablets = useCallback((tabletIds: string[]) => {
    setTowers(prev =>
      prev.map((t, index) => {
        const tid = tabletIds[index] || tabletIds[0] || '';
        return { ...t, active: true, socketedTabletIds: tid ? [tid] : [] };
      })
    );
    onShowToast?.('✅ 已自動為覆蓋石塔配置最佳化先祖碑牌組合！');
  }, [onShowToast]);

  const handleApplyPreset = (preset: StrategyPreset) => {
    setSelectedBiome(preset.biome);
    setSelectedGoal(preset.goal);
    handleApplyTablets(preset.tablets);
    onShowToast?.(`🚀 已套用「${preset.label}」專屬刷圖策略！`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Strategy Presets Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>常用終局收益策略：</span>
        {PRESET_STRATEGIES.map(p => (
          <button
            key={p.label}
            type="button"
            className="poe-button-secondary"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            onClick={() => handleApplyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 2-Column Responsive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: '20px', alignItems: 'start' }}>
        <PrecursorTowerCard
          towers={towers}
          synergy={synergy}
          onToggleTower={handleToggleTower}
          onUpdateTablet={handleUpdateTablet}
        />
        <BiomeOptimizerCard
          selectedBiome={selectedBiome}
          selectedGoal={selectedGoal}
          recommendation={recommendation}
          onSelectBiome={setSelectedBiome}
          onSelectGoal={setSelectedGoal}
          onApplyTablets={handleApplyTablets}
        />
      </div>
    </div>
  );
};

export default WaystoneTowerPanel;
