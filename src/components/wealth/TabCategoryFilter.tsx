import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export const CATEGORY_TABS = [
  { key: 'ALL', label: '全部' },
  { key: 'Currency', label: '通貨 Currency' },
  { key: 'Fragment', label: '碎片 Fragment' },
  { key: 'DivCard', label: '命運卡 Cards' },
  { key: 'Essence', label: '精髓 Essence' },
  { key: 'Scarab', label: '甲蟲 Scarab' },
  { key: 'Map', label: '地圖 Maps' },
  { key: 'Equipment', label: '裝備 Equipment' }
];

export const PRICE_THRESHOLDS = [
  { value: 0, label: '全部 (0c+)' },
  { value: 1, label: '≥ 1 c' },
  { value: 5, label: '≥ 5 c' },
  { value: 10, label: '≥ 10 c' },
  { value: 50, label: '≥ 50 c' },
  { value: 150, label: '≥ 1 Div (150c+)' }
];

interface TabCategoryFilterProps {
  selectedCategory: string;
  onChangeCategory?: (cat: string) => void;
  minValueChaos: number;
  onChangeMinValueChaos?: (val: number) => void;
  isFilterActive: boolean;
  onResetFilters?: () => void;
}

export const TabCategoryFilter: React.FC<TabCategoryFilterProps> = ({
  selectedCategory,
  onChangeCategory,
  minValueChaos,
  onChangeMinValueChaos,
  isFilterActive,
  onResetFilters
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {CATEGORY_TABS.map(cat => (
          <button
            key={cat.key}
            onClick={() => onChangeCategory?.(cat.key)}
            className={selectedCategory === cat.key ? 'poe-button' : 'poe-button-secondary'}
            style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '4px' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onChangeMinValueChaos && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} color="var(--text-gold)" />
            <select
              className="poe-input"
              value={minValueChaos}
              onChange={e => onChangeMinValueChaos(Number(e.target.value))}
              style={{ padding: '3px 8px', fontSize: '0.78rem', background: '#121214', color: 'var(--text-bright)' }}
            >
              {PRICE_THRESHOLDS.map(th => (
                <option key={th.value} value={th.value}>{th.label}</option>
              ))}
            </select>
          </div>
        )}

        {isFilterActive && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="poe-button-secondary"
            style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}
            title="重設所有過濾條件"
          >
            <RotateCcw size={12} /> 重設過濾
          </button>
        )}
      </div>
    </div>
  );
};
