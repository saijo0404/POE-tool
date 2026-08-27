import React from 'react';
import { Search, X } from 'lucide-react';

interface AtlasCategoryFilterProps {
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (q: string) => void;
  onSelectCategory: (cat: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'essence', label: '💎 精髓' },
  { id: 'ambush', label: '📦 伏擊' },
  { id: 'harvest', label: '🌾 莊園' },
  { id: 'expedition', label: '💣 探險' },
  { id: 'legion', label: '⚔️ 戰亂' },
  { id: 'delirium', label: '🌫️ 譫妄' },
  { id: 'ritual', label: '🩸 祭祀' },
  { id: 'breach', label: '🌀 裂痕' },
  { id: 'beyond', label: '🌌 超越' },
  { id: 'scarab', label: '🐞 聖甲蟲' },
  { id: 'boss', label: '👑 首領' },
  { id: 'map', label: '🗺️ 地圖' }
];

export const AtlasCategoryFilter: React.FC<AtlasCategoryFilterProps> = ({
  searchQuery,
  selectedCategory,
  onSearchChange,
  onSelectCategory
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '8px 14px',
      background: 'rgba(0, 0, 0, 0.4)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
    }}>
      {/* Search Input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '240px' }}>
        <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px' }} />
        <input
          type="text"
          className="poe-input"
          placeholder="搜尋天賦名稱或屬性關鍵字..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          style={{ paddingLeft: '28px', paddingRight: searchQuery ? '26px' : '8px', fontSize: '0.78rem', height: '28px', width: '100%' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: 0
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflowX: 'auto', maxWidth: '100%' }}>
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                background: isSelected ? 'rgba(200, 170, 110, 0.25)' : 'transparent',
                border: isSelected ? '1px solid var(--border-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isSelected ? 'var(--text-gold)' : 'var(--text-muted)',
                padding: '3px 9px',
                borderRadius: '10px',
                fontSize: '0.74rem',
                fontWeight: isSelected ? 600 : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
