import React, { useState } from 'react';
import type { AtlasTierExtraItem, ExtraItemCategory } from '../../domain/atlas/types';
import { POPULAR_EXTRA_ITEMS } from '../../domain/atlas/scarabDatabase';
import { resolveExtraItemPrice } from '../../domain/atlas/atlasHelpers';
import { Plus, Trash2, Package, Sparkles } from 'lucide-react';

interface AtlasExtraItemsConfigProps {
  extraItems: AtlasTierExtraItem[];
  onAddExtraItem: (item: AtlasTierExtraItem) => void;
  onRemoveExtraItem: (id: string) => void;
  onUpdateExtraItem: (id: string, updates: Partial<AtlasTierExtraItem>) => void;
  ninjaRates: Record<string, number>;
  divineRate: number;
}

const CATEGORY_LABELS: Record<ExtraItemCategory, { label: string; color: string }> = {
  craft: { label: '地圖工藝', color: '#f59e0b' },
  map: { label: '地圖基底', color: '#38bdf8' },
  delirium: { label: '瞻妄玉', color: '#a855f7' },
  currency: { label: '通貨耗材', color: '#aa9e82' },
  fragment: { label: '額外碎片', color: '#22c55e' },
  other: { label: '其他自訂', color: '#94a3b8' }
};

export const AtlasExtraItemsConfig: React.FC<AtlasExtraItemsConfigProps> = ({
  extraItems,
  onAddExtraItem,
  onRemoveExtraItem,
  onUpdateExtraItem,
  ninjaRates,
  divineRate
}) => {
  const [isCustomFormOpen, setIsCustomFormOpen] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ExtraItemCategory>('craft');
  const [customCount, setCustomCount] = useState<number>(1);
  const [customPriceChaos, setCustomPriceChaos] = useState<number>(8);

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

  const handleCreateCustomItem = () => {
    if (!customName.trim()) return;
    const newItem: AtlasTierExtraItem = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: customName.trim(),
      category: customCategory,
      count: Math.max(customCount, 1),
      unitPriceChaos: Math.max(customPriceChaos, 0)
    };
    onAddExtraItem(newItem);
    setCustomName('');
    setIsCustomFormOpen(false);
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

      {/* Quick Add Presets Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Sparkles size={12} color="#f59e0b" /> 快捷新增：
        </span>
        {POPULAR_EXTRA_ITEMS.slice(0, 8).map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAddPreset(preset)}
            className="poe-button-secondary"
            style={{
              fontSize: '0.74rem',
              padding: '3px 8px',
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              height: '24px'
            }}
          >
            + {preset.name.split(' (')[0]} ({preset.defaultPriceChaos}c)
          </button>
        ))}
      </div>

      {/* Custom Item Form */}
      {isCustomFormOpen && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-gold)',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-gold)' }}>
            新增自訂物品或成本項目
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>
                物品/項目名稱：
              </label>
              <input
                type="text"
                className="poe-input"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="例如: T16 劇毒林地, 瞻妄玉, 地圖代洗費"
                style={{ width: '100%', height: '32px', fontSize: '0.82rem' }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>
                類型分類：
              </label>
              <select
                className="poe-input"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value as ExtraItemCategory)}
                style={{ width: '100%', height: '32px', fontSize: '0.82rem', padding: '0 8px' }}
              >
                <option value="craft">地圖工藝 (Map Craft)</option>
                <option value="map">地圖基底 (Map Base)</option>
                <option value="delirium">瞻妄玉 (Delirium Orb)</option>
                <option value="currency">通貨耗材 (Currency)</option>
                <option value="fragment">額外碎片 (Fragment)</option>
                <option value="other">其他自訂 (Other)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>
                每場消耗數量：
              </label>
              <input
                type="number"
                min="1"
                className="poe-input"
                value={customCount}
                onChange={e => setCustomCount(parseInt(e.target.value) || 1)}
                style={{ width: '100%', height: '32px', fontSize: '0.82rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>
                單價 (Chaos)：
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="poe-input"
                value={customPriceChaos}
                onChange={e => setCustomPriceChaos(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', height: '32px', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              className="poe-button-secondary"
              onClick={() => setIsCustomFormOpen(false)}
              style={{ fontSize: '0.8rem', padding: '4px 12px' }}
            >
              取消
            </button>
            <button
              type="button"
              className="poe-button"
              onClick={handleCreateCustomItem}
              style={{ fontSize: '0.8rem', padding: '4px 14px' }}
            >
              確認新增
            </button>
          </div>
        </div>
      )}

      {/* Extra Items List */}
      {extraItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {extraItems.map(item => {
            const unitPrice = resolveExtraItemPrice(item, ninjaRates, divineRate);
            const totalItemCost = Math.round((item.count || 0) * unitPrice * 10) / 10;
            const catInfo = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(200, 170, 110, 0.18)',
                  borderRadius: '6px'
                }}
              >
                {/* Left: Item Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${catInfo.color}22`,
                    color: catInfo.color,
                    border: `1px solid ${catInfo.color}55`,
                    whiteSpace: 'nowrap'
                  }}>
                    {catInfo.label}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' }}>
                      {item.name}
                    </div>
                    {item.nameEn && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        {item.nameEn}
                      </div>
                    )}
                  </div>
                </div>

                {/* Center: Count Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>單場用量：</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(200, 170, 110, 0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateExtraItem(item.id, { count: Math.max((item.count || 1) - 1, 1) })}
                      style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-gold)' }}>
                      {item.count || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateExtraItem(item.id, { count: (item.count || 1) + 1 })}
                      style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Right: Unit Price & Subtotal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>單價</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="poe-input"
                        value={item.unitPriceChaos}
                        onChange={e => onUpdateExtraItem(item.id, { unitPriceChaos: parseFloat(e.target.value) || 0 })}
                        style={{ width: '55px', height: '24px', padding: '0 4px', fontSize: '0.78rem', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>C</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '70px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>小計</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-gold)' }}>
                      {totalItemCost} C
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveExtraItem(item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="移除此項目"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
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
          尚無額外物品或地圖工藝支出，可點擊上方快捷新增（如精髓工藝 8c、T16 地圖等）或自訂新增！
        </div>
      )}
    </div>
  );
};
