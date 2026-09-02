import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { CATEGORY_TABS, PRICE_THRESHOLDS } from '../../domain/wealth/constants';

interface TabCategoryFilterProps {
  selectedCategory: string;
  onChangeCategory?: (cat: string) => void;
  minValueChaos: number;
  onChangeMinValueChaos?: (val: number) => void;
  bulkMultiplier?: number;
  onChangeBulkMultiplier?: (mult: number) => void;
  isFilterActive: boolean;
  onResetFilters?: () => void;
}

export const TabCategoryFilter: React.FC<TabCategoryFilterProps> = ({
  selectedCategory,
  onChangeCategory,
  minValueChaos,
  onChangeMinValueChaos,
  bulkMultiplier = 1.0,
  onChangeBulkMultiplier,
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
        {onChangeBulkMultiplier && (
          <select
            className="poe-input"
            value={bulkMultiplier}
            onChange={e => onChangeBulkMultiplier(Number(e.target.value))}
            style={{
              padding: '3px 8px',
              fontSize: '0.78rem',
              background: bulkMultiplier > 1.0 ? 'rgba(56, 189, 248, 0.15)' : '#121214',
              color: bulkMultiplier > 1.0 ? '#38bdf8' : 'var(--text-bright)',
              borderColor: bulkMultiplier > 1.0 ? 'rgba(56, 189, 248, 0.4)' : undefined
            }}
            title="大宗出售溢價乘數 (Bulk Multiplier)"
          >
            <option value={1.0}>1.0x 零售 (Retail)</option>
            <option value={1.2}>1.2x 批發 (+20%)</option>
            <option value={1.4}>1.4x 頂配 (+40%)</option>
          </select>
        )}

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
