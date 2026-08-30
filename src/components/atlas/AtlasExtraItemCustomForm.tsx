import React, { useState } from 'react';
import type { AtlasTierExtraItem, ExtraItemCategory } from '../../domain/atlas/types';
import { AlertCircle } from 'lucide-react';

interface AtlasExtraItemCustomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: AtlasTierExtraItem) => void;
  activeCraftName?: string;
}

export const AtlasExtraItemCustomForm: React.FC<AtlasExtraItemCustomFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  activeCraftName
}) => {
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ExtraItemCategory>('craft');
  const [customCount, setCustomCount] = useState<number>(1);
  const [customPriceChaos, setCustomPriceChaos] = useState<number>(8);

  if (!isOpen) return null;

  const isCraft = customCategory === 'craft';

  const handleSubmit = () => {
    if (!customName.trim()) return;
    const newItem: AtlasTierExtraItem = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: customName.trim(),
      category: customCategory,
      count: isCraft ? 1 : Math.max(customCount, 1),
      unitPriceChaos: Math.max(customPriceChaos, 0)
    };
    onSubmit(newItem);
    setCustomName('');
    onClose();
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid var(--border-gold)',
      borderRadius: '6px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>新增自訂物品或成本項目</span>
        {isCraft && activeCraftName && (
          <span style={{ fontSize: '0.74rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} />
            將自動替換現有工藝【{activeCraftName.split(' (')[0]}】
          </span>
        )}
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
            onChange={e => {
              const cat = e.target.value as ExtraItemCategory;
              setCustomCategory(cat);
              if (cat === 'craft') {
                setCustomCount(1);
              }
            }}
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
            每場消耗數量：{isCraft && <span style={{ color: '#f59e0b' }}>(工藝固定為 1)</span>}
          </label>
          <input
            type="number"
            min="1"
            disabled={isCraft}
            className="poe-input"
            value={isCraft ? 1 : customCount}
            onChange={e => setCustomCount(parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              height: '32px',
              fontSize: '0.82rem',
              opacity: isCraft ? 0.7 : 1,
              cursor: isCraft ? 'not-allowed' : 'auto'
            }}
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
          onClick={onClose}
          style={{ fontSize: '0.8rem', padding: '4px 12px' }}
        >
          取消
        </button>
        <button
          type="button"
          className="poe-button"
          onClick={handleSubmit}
          style={{ fontSize: '0.8rem', padding: '4px 14px' }}
        >
          確認新增
        </button>
      </div>
    </div>
  );
};
