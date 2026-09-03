import React, { useState, useMemo } from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';
import { filterAvailableMods } from '../../domain/crafting/craftingCalculator';
import { CRAFT_MODS } from '../../domain/crafting/modDatabase';
import type { CraftBaseItem, TargetModSelection } from '../../domain/crafting/types';

interface CraftingModSelectorCardProps {
  baseItem: CraftBaseItem;
  ilvl: number;
  targetMods: TargetModSelection[];
  onToggleTargetMod: (modId: string, maxTier: number) => void;
}

export const CraftingModSelectorCard: React.FC<CraftingModSelectorCardProps> = ({
  baseItem,
  ilvl,
  targetMods,
  onToggleTargetMod,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'prefix' | 'suffix'>('all');

  const availableMods = useMemo(() => {
    return filterAvailableMods(baseItem, ilvl, CRAFT_MODS);
  }, [baseItem, ilvl]);

  const displayedMods = useMemo(() => {
    if (filterType === 'all') return availableMods;
    return availableMods.filter(m => m.type === filterType);
  }, [availableMods, filterType]);

  return (
    <div className="poe-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="var(--text-gold)" />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-gold)' }}>2. 勾選目標前綴與後綴</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#2ecc71', fontWeight: 600 }}>
          已鎖定 {targetMods.length} 條目標詞綴
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {(['all', 'prefix', 'suffix'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterType(tab)}
            className={filterType === tab ? 'poe-button' : 'poe-button-secondary'}
            style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '4px' }}
          >
            {tab === 'all' ? '全部詞綴' : tab === 'prefix' ? '前綴 (Prefix)' : '後綴 (Suffix)'}
          </button>
        ))}
      </div>

      {/* Mod List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
        {displayedMods.map(mod => {
          const selected = targetMods.find(t => t.modId === mod.id);
          const topTier = mod.tiers[0];

          return (
            <div
              key={mod.id}
              onClick={() => onToggleTargetMod(mod.id, selected ? selected.maxTier : 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: selected ? 'rgba(243, 209, 121, 0.12)' : 'rgba(20, 24, 34, 0.6)',
                border: `1px solid ${selected ? '#f3d179' : 'rgba(200, 170, 110, 0.2)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selected ? (
                  <CheckCircle2 size={16} color="#f3d179" />
                ) : (
                  <Circle size={16} color="var(--text-muted)" />
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.86rem', color: selected ? '#f3d179' : '#fff', fontWeight: 600 }}>
                      {mod.nameZh} ({mod.name})
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: mod.type === 'prefix' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                        color: mod.type === 'prefix' ? '#93c5fd' : '#d8b4fe',
                      }}
                    >
                      {mod.type === 'prefix' ? '前綴' : '後綴'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {topTier.statTextZh} (需求 ilvl {topTier.ilvl})
                  </span>
                </div>
              </div>

              {selected && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-gold)' }}>容許階級：</label>
                  <select
                    value={selected.maxTier}
                    onChange={e => onToggleTargetMod(mod.id, Number(e.target.value))}
                    className="poe-select"
                    style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', backgroundColor: '#0e121a' }}
                  >
                    <option value={1}>僅限 T1</option>
                    <option value={2}>T1 或 T2</option>
                    {mod.tiers.length >= 3 && <option value={3}>T1 ~ T3</option>}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
