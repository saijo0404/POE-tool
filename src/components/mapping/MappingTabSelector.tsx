import React from 'react';
import { Database, Check } from 'lucide-react';
import type { StashTabMeta } from '../../types/poe';

interface MappingTabSelectorProps {
  availableTabs: StashTabMeta[];
  selectedTabs: string[];
  onUpdateSelectedTabs: (tabs: string[]) => void;
}

export const MappingTabSelector: React.FC<MappingTabSelectorProps> = ({
  availableTabs,
  selectedTabs,
  onUpdateSelectedTabs
}) => {
  const isAllSelected = selectedTabs.length === 0;

  const handleToggleTab = (tabName: string) => {
    if (selectedTabs.includes(tabName)) {
      const next = selectedTabs.filter(t => t !== tabName);
      onUpdateSelectedTabs(next);
    } else {
      onUpdateSelectedTabs([...selectedTabs, tabName]);
    }
  };

  const handleSelectAll = () => {
    onUpdateSelectedTabs([]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '14px 18px',
        backgroundColor: '#121620',
        borderRadius: '8px',
        border: '1px solid rgba(200, 170, 110, 0.2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gold)' }}>
          <Database size={16} />
          <span style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>
            指定追蹤的 Dump / 戰利品倉庫頁 (Dump Tabs Scanner)：
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {isAllSelected ? (
            <span style={{ color: '#98c379' }}>掃描全部倉庫頁</span>
          ) : (
            <span>已指定 {selectedTabs.length} 個倉庫頁</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '4px 0' }}>
        <button
          type="button"
          onClick={handleSelectAll}
          className={isAllSelected ? 'poe-button' : 'poe-button-secondary'}
          style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {isAllSelected && <Check size={12} />} 全部倉庫 (All Tabs)
        </button>

        {availableTabs.map(tab => {
          const isSelected = selectedTabs.includes(tab.n);
          const colorBg = tab.color ? `rgba(${tab.color.r}, ${tab.color.g}, ${tab.color.b}, 0.25)` : 'rgba(255,255,255,0.05)';
          const colorBorder = tab.color ? `rgb(${tab.color.r}, ${tab.color.g}, ${tab.color.b})` : 'rgba(200,170,110,0.3)';

          return (
            <button
              type="button"
              key={tab.id || tab.i}
              onClick={() => handleToggleTab(tab.n)}
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '4px',
                border: `1px solid ${isSelected ? 'var(--text-gold)' : colorBorder}`,
                backgroundColor: isSelected ? 'rgba(243, 209, 121, 0.2)' : colorBg,
                color: isSelected ? 'var(--text-gold)' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isSelected && <Check size={12} />}
              {tab.n}
            </button>
          );
        })}
      </div>
    </div>
  );
};
