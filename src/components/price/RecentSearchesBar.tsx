import React from 'react';
import { History, Trash2, Tag } from 'lucide-react';
import type { RecentSearchItem } from '../../hooks/usePriceChecker';

interface RecentSearchesBarProps {
  recentSearches: RecentSearchItem[];
  onSelectSearch: (item: RecentSearchItem) => void;
  onClearSearches: () => void;
}

export const RecentSearchesBar: React.FC<RecentSearchesBarProps> = ({
  recentSearches,
  onSelectSearch,
  onClearSearches
}) => {
  if (recentSearches.length === 0) return null;

  return (
    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        <History size={14} color="var(--text-gold)" />
        <span>最近查價:</span>
      </div>

      <div style={{ display: 'flex', gap: '6px', flex: 1, overflowX: 'auto' }}>
        {recentSearches.map((item) => {
          const priceBadge = item.minPriceDivine
            ? `${item.minPriceDivine} Div`
            : item.minPriceChaos
            ? `${item.minPriceChaos} C`
            : null;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSearch(item)}
              className="poe-btn"
              style={{
                fontSize: '0.78rem',
                padding: '3px 10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                background: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'rgba(200, 170, 110, 0.2)'
              }}
              title={`點擊載入：${item.name} (${item.baseType})`}
            >
              <Tag size={11} color="var(--text-gold)" />
              <span className={`rarity-${item.rarity || 'Rare'}`} style={{ fontWeight: 500 }}>
                {item.name}
              </span>
              {priceBadge && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', padding: '1px 5px', borderRadius: '4px' }}>
                  {priceBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onClearSearches}
        className="poe-btn"
        style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--text-muted)', border: 'none', background: 'transparent' }}
        title="清空歷史記錄"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

export default RecentSearchesBar;
