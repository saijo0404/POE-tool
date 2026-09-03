import React from 'react';
import { Hammer, Sparkles, Flame } from 'lucide-react';
import { CRAFT_PRESETS } from '../../domain/crafting/craftingPresets';
import type { CraftPreset } from '../../domain/crafting/types';

interface CraftingHeaderProps {
  activePresetId: string;
  customPresets: CraftPreset[];
  onApplyPreset: (presetId: string) => void;
  league: string;
  divineRate: number;
}

export const CraftingHeader: React.FC<CraftingHeaderProps> = ({
  activePresetId,
  customPresets,
  onApplyPreset,
  league,
  divineRate,
}) => {
  const allPresets = [...CRAFT_PRESETS, ...customPresets];

  return (
    <div
      style={{
        background: 'radial-gradient(ellipse at top left, rgba(200, 170, 110, 0.15) 0%, rgba(10, 13, 20, 0.8) 70%)',
        border: '1px solid rgba(200, 170, 110, 0.3)',
        borderRadius: '8px',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37 0%, #855b14 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(212, 175, 55, 0.4)',
          }}
        >
          <Hammer size={24} color="#0d121c" />
        </div>
        <div>
          <h2
            className="poe-font"
            style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-gold)', letterSpacing: '0.5px' }}
          >
            裝備工藝模擬與成本期望精算器 (Crafting Actuary)
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            精髓、化石、收割與混沌石期望成本精算 • 95% 信心區間 • 虛擬點裝沙盒 (Craft of Exile 輕量整合)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-gold)' }}>
          <Sparkles size={16} />
          <span>熱門配方：</span>
        </div>
        <select
          value={activePresetId}
          onChange={e => onApplyPreset(e.target.value)}
          className="poe-select"
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#141822',
            color: '#f3d179',
            border: '1px solid rgba(200, 170, 110, 0.4)',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>
            -- 選擇預設配方 --
          </option>
          {allPresets.map(preset => (
            <option key={preset.id} value={preset.id}>
              {preset.nameZh} ({preset.name})
            </option>
          ))}
        </select>

        <div
          style={{
            padding: '4px 10px',
            borderRadius: '16px',
            backgroundColor: 'rgba(200, 170, 110, 0.1)',
            border: '1px solid rgba(200, 170, 110, 0.25)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Flame size={13} color="#f59e0b" />
          <span>{league} 聯盟 (1 Div = {divineRate}c)</span>
        </div>
      </div>
    </div>
  );
};
