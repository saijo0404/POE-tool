import React, { useState } from 'react';
import type { AtlasTierExtraItem } from '../../domain/atlas/types';
import { POPULAR_EXTRA_ITEMS } from '../../domain/atlas/scarabDatabase';
import { resolveExtraItemPrice, isCraftItem } from '../../domain/atlas/atlasHelpers';
import { AtlasExtraItemPresets } from './AtlasExtraItemPresets';
import { AtlasExtraItemCustomForm } from './AtlasExtraItemCustomForm';
import { AtlasExtraItemRow } from './AtlasExtraItemRow';
import { Plus, Package } from 'lucide-react';

interface AtlasExtraItemsConfigProps {
  extraItems: AtlasTierExtraItem[];
  onAddExtraItem: (item: AtlasTierExtraItem) => void;
  onRemoveExtraItem: (id: string) => void;
  onUpdateExtraItem: (id: string, updates: Partial<AtlasTierExtraItem>) => void;
  ninjaRates: Record<string, number>;
  divineRate: number;
}

export const AtlasExtraItemsConfig: React.FC<AtlasExtraItemsConfigProps> = ({
  extraItems,
  onAddExtraItem,
  onRemoveExtraItem,
  onUpdateExtraItem,
  ninjaRates,
  divineRate
}) => {
  const [isCustomFormOpen, setIsCustomFormOpen] = useState<boolean>(false);

  const activeCraft = extraItems.find(i => isCraftItem(i));

  const totalExtraCost = extraItems.reduce(
    (acc, item) => acc + (item.count || 0) * resolveExtraItemPrice(item, ninjaRates, divineRate),
    0
  );

  const handleAddPreset = (preset: typeof POPULAR_EXTRA_ITEMS[0]) => {
    const livePrice = (preset.nameEn && ninjaRates[preset.nameEn]) || preset.defaultPriceChaos;
    const newItem: AtlasTierExtraItem = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: preset.name,
      nameEn: preset.nameEn,
      category: preset.category,
      count: 1,
      unitPriceChaos: livePrice
    };
    onAddExtraItem(newItem);
  };

  const handleToggleRemoveCraft = () => {
    if (activeCraft) {
      onRemoveExtraItem(activeCraft.id);
    }
  };

  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
            額外自訂物品與工藝支出 (Extra Items & Map Device)
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            額外單場成本：
            <span style={{ color: 'var(--text-gold)', fontWeight: 700, marginLeft: '4px' }}>
              {Math.round(totalExtraCost * 10) / 10} C
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginLeft: '4px' }}>
              (~{Math.round((totalExtraCost / (divineRate || 150)) * 100) / 100} Div)
            </span>
          </div>

          <button
            type="button"
            className="poe-button"
            onClick={() => setIsCustomFormOpen(!isCustomFormOpen)}
            style={{ fontSize: '0.8rem', padding: '5px 12px', height: '32px' }}
          >
            <Plus size={14} /> 自訂新增項目
          </button>
        </div>
      </div>

      {/* Quick Add Presets Pills with Craft Highlight & Toggle */}
      <AtlasExtraItemPresets
        activeCraftName={activeCraft?.name}
        onSelectPreset={handleAddPreset}
        onToggleRemoveCraft={handleToggleRemoveCraft}
      />

      {/* Custom Item Form */}
      <AtlasExtraItemCustomForm
        isOpen={isCustomFormOpen}
        onClose={() => setIsCustomFormOpen(false)}
        onSubmit={onAddExtraItem}
        activeCraftName={activeCraft?.name}
      />

      {/* Extra Items List */}
      {extraItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {extraItems.map(item => (
            <AtlasExtraItemRow
              key={item.id}
              item={item}
              ninjaRates={ninjaRates}
              divineRate={divineRate}
              onUpdate={onUpdateExtraItem}
              onRemove={onRemoveExtraItem}
            />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          border: '1px dashed rgba(200, 170, 110, 0.2)',
          color: 'var(--text-dim)',
          fontSize: '0.84rem'
        }}>
          尚無額外物品或地圖工藝支出，可點擊上方快捷新增（如伏擊工藝 7c、T16 地圖等）或自訂新增！
        </div>
      )}
    </div>
  );
};
