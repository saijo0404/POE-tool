import React from 'react';
import { POPULAR_EXTRA_ITEMS } from '../../domain/atlas/scarabDatabase';
import { Sparkles, Check } from 'lucide-react';

interface AtlasExtraItemPresetsProps {
  activeCraftName?: string;
  onSelectPreset: (preset: typeof POPULAR_EXTRA_ITEMS[0]) => void;
  onToggleRemoveCraft?: () => void;
}

export const AtlasExtraItemPresets: React.FC<AtlasExtraItemPresetsProps> = ({
  activeCraftName,
  onSelectPreset,
  onToggleRemoveCraft
}) => {
  const handlePresetClick = (preset: typeof POPULAR_EXTRA_ITEMS[0], isCurrentCraftActive: boolean) => {
    if (preset.category === 'craft' && isCurrentCraftActive && onToggleRemoveCraft) {
      onToggleRemoveCraft();
    } else {
      onSelectPreset(preset);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <Sparkles size={12} color="#f59e0b" /> 快捷新增：
      </span>
      {POPULAR_EXTRA_ITEMS.slice(0, 9).map((preset, idx) => {
        const isCraft = preset.category === 'craft';
        const isCurrentCraftActive = Boolean(
          isCraft &&
          activeCraftName &&
          (preset.name === activeCraftName || activeCraftName.includes(preset.name.split(' (')[0]))
        );

        return (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetClick(preset, isCurrentCraftActive)}
            className={isCurrentCraftActive ? 'poe-button' : 'poe-button-secondary'}
            style={{
              fontSize: '0.74rem',
              padding: '3px 8px',
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              height: '24px',
              border: isCurrentCraftActive ? '1px solid #f59e0b' : undefined,
              boxShadow: isCurrentCraftActive ? '0 0 6px rgba(245, 158, 11, 0.4)' : undefined
            }}
            title={isCurrentCraftActive ? '點擊取消此地圖工藝' : (isCraft && activeCraftName ? '點擊替換既有地圖工藝' : undefined)}
          >
            {isCurrentCraftActive && <Check size={11} style={{ marginRight: '2px', display: 'inline' }} />}
            {isCurrentCraftActive ? '' : '+ '}
            {preset.name.split(' (')[0]} ({preset.defaultPriceChaos}c)
          </button>
        );
      })}
    </div>
  );
};
