import React from 'react';
import type { StashTabSummary } from '../../types/poe';
import { Layers, EyeOff, Eye } from 'lucide-react';

interface TabSidebarListProps {
  tabSummaries: StashTabSummary[];
  selectedTab: string;
  onSelectTab: (tabName: string) => void;
  ignoredTabs: string[];
  onToggleIgnoreTab?: (tabName: string) => void;
}

export const TabSidebarList: React.FC<TabSidebarListProps> = ({
  tabSummaries,
  selectedTab,
  onSelectTab,
  ignoredTabs,
  onToggleIgnoreTab
}) => {
  return (
    <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Layers size={15} /> 倉庫頁面清單 ({tabSummaries.length})
      </div>

      <button
        onClick={() => onSelectTab('ALL')}
        className={selectedTab === 'ALL' ? 'poe-button' : 'poe-button-secondary'}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '0.84rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '6px'
        }}
      >
        <span>全部頁面 (All Tabs)</span>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
        {tabSummaries.map((tab, idx) => {
          const tName = tab.tabName;
          const isIgnored = ignoredTabs.includes(tName);
          const isSelected = selectedTab === tName;
          const chaosVal = tab.totalValueChaos || 0;
          const count = tab.itemCount || 0;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: isSelected ? 'rgba(200, 170, 110, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                border: isSelected ? '1px solid rgba(200, 170, 110, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '4px',
                opacity: isIgnored ? 0.45 : 1,
                cursor: 'pointer'
              }}
              onClick={() => onSelectTab(tName)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.82rem', color: isSelected ? 'var(--text-gold)' : 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tName}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {count} 件物品 · {chaosVal.toLocaleString()} c
                </span>
              </div>

              {onToggleIgnoreTab && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleIgnoreTab(tName);
                  }}
                  className="poe-button-secondary"
                  style={{ padding: '3px 5px', fontSize: '0.7rem', borderRadius: '3px' }}
                  title={isIgnored ? '取消忽略此分頁' : '忽略此分頁（不計入總資產）'}
                >
                  {isIgnored ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
