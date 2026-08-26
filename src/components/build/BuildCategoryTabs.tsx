import React from 'react';
import { Search, ArrowUpDown, X } from 'lucide-react';

interface BuildCategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: any) => void;
  itemCounts: { all: number; equipment: number; gems: number; flasks: number; jewels: number };
}

export const BuildCategoryTabs: React.FC<BuildCategoryTabsProps> = ({
  activeCategory,
  setActiveCategory,
  searchFilter,
  setSearchFilter,
  sortBy,
  setSortBy,
  itemCounts,
}) => {
  const tabs = [
    { key: 'all', label: `全部 (${itemCounts.all})` },
    { key: 'equipment', label: `裝備 (${itemCounts.equipment})` },
    { key: 'jewels', label: `珠寶 (${itemCounts.jewels})` },
    { key: 'flasks', label: `藥劑 (${itemCounts.flasks})` },
    { key: 'gems', label: `寶石 (${itemCounts.gems})` },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={activeCategory === t.key ? 'poe-button' : 'poe-button-secondary'}
            onClick={() => setActiveCategory(t.key)}
            style={{ padding: '5px 12px', fontSize: '0.82rem', borderRadius: '4px' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="poe-input"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="搜尋物品..."
            style={{ width: '100%', padding: '4px 26px 4px 26px', fontSize: '0.8rem' }}
          />
          {searchFilter && (
            <X size={13} onClick={() => setSearchFilter('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowUpDown size={14} color="var(--text-gold)" />
          <select
            className="poe-input"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#121214', color: 'var(--text-bright)' }}
          >
            <option value="price_desc">造價由高至低</option>
            <option value="price_asc">造價由低至高</option>
            <option value="slot">依部位排序</option>
          </select>
        </div>
      </div>
    </div>
  );
};
