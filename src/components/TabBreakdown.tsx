import React, { useState, useMemo } from 'react';
import type { StashTabSummary, StashItem } from '../types/poe';
import { Package, ArrowUpDown, Search, X } from 'lucide-react';
import { TabCategoryFilter } from './wealth/TabCategoryFilter';
import { TabSidebarList } from './wealth/TabSidebarList';
import { TabItemCard } from './wealth/TabItemCard';

interface TabBreakdownProps {
  tabSummaries: StashTabSummary[];
  topItems: StashItem[];
  divineRate?: number;
  totalChaos?: number;
  totalDivine?: number;
  allItems?: StashItem[];
  ignoredTabs?: string[];
  ignoredTabNames?: string[];
  onToggleIgnoreTab?: (tabName: string) => void;
  minValueChaos?: number;
  onChangeMinValueChaos?: (val: number) => void;
  selectedCategory?: string;
  onChangeCategory?: (cat: string) => void;
  bulkMultiplier?: number;
  onChangeBulkMultiplier?: (mult: number) => void;
  onResetFilters?: () => void;
}

export const TabBreakdown: React.FC<TabBreakdownProps> = ({
  tabSummaries = [],
  topItems = [],
  allItems = [],
  ignoredTabs = [],
  ignoredTabNames = [],
  onToggleIgnoreTab,
  minValueChaos = 0,
  onChangeMinValueChaos,
  selectedCategory = 'ALL',
  onChangeCategory,
  bulkMultiplier = 1.0,
  onChangeBulkMultiplier,
  onResetFilters
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'stack'>('value');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const activeIgnored = ignoredTabs.length > 0 ? ignoredTabs : ignoredTabNames;
  const isFilterActive =
    minValueChaos > 0 ||
    activeIgnored.length > 0 ||
    selectedCategory !== 'ALL' ||
    bulkMultiplier !== 1.0;

  const baseItems = useMemo(() => {
    const rawList = selectedTab === 'ALL' ? (allItems.length > 0 ? allItems : topItems) : allItems.filter(i => i.tabName === selectedTab);
    return rawList.filter(item => {
      const uPrice = item.unitPriceChaos || 0;
      const tPrice = item.totalPriceChaos || 0;
      if (minValueChaos > 0 && (uPrice < minValueChaos && tPrice < minValueChaos)) return false;
      if (activeIgnored.includes(item.tabName)) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedTab, allItems, topItems, minValueChaos, activeIgnored, selectedCategory]);

  const searchedItems = useMemo(() => {
    if (!searchTerm.trim()) return baseItems;
    const term = searchTerm.toLowerCase().trim();
    return baseItems.filter(item => {
      const typeLine = (item.typeLine || '').toLowerCase();
      const name = (item.name || '').toLowerCase();
      const tabName = (item.tabName || '').toLowerCase();
      return typeLine.includes(term) || name.includes(term) || tabName.includes(term);
    });
  }, [baseItems, searchTerm]);

  const sortedItems = useMemo(() => {
    return [...searchedItems].sort((a, b) => {
      const aTotal = a.totalPriceChaos || 0;
      const bTotal = b.totalPriceChaos || 0;
      if (sortBy === 'value') return bTotal - aTotal;
      const aStack = a.stackSize || 1;
      const bStack = b.stackSize || 1;
      if (sortBy === 'stack') return bStack - aStack;
      return (a.name || a.typeLine).localeCompare(b.name || b.typeLine);
    });
  }, [searchedItems, sortBy]);

  return (
    <div className="poe-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 className="poe-font" style={{ fontSize: '1.1rem', color: 'var(--text-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} /> 倉庫明細與價值分佈 (Stash Breakdown)
        </h3>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="poe-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜尋物品名稱/種類..."
              style={{ width: '100%', padding: '4px 26px 4px 26px', fontSize: '0.8rem' }}
            />
            {searchTerm && (
              <X size={13} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }} />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={14} color="var(--text-gold)" />
            <select
              className="poe-input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'value' | 'stack' | 'name')}
              style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#121214', color: 'var(--text-bright)' }}
            >
              <option value="value">總價高至低</option>
              <option value="stack">數量多至少</option>
              <option value="name">名稱排序</option>
            </select>
          </div>
        </div>
      </div>

      <TabCategoryFilter
        selectedCategory={selectedCategory}
        onChangeCategory={onChangeCategory}
        minValueChaos={minValueChaos}
        onChangeMinValueChaos={onChangeMinValueChaos}
        bulkMultiplier={bulkMultiplier}
        onChangeBulkMultiplier={onChangeBulkMultiplier}
        isFilterActive={isFilterActive}
        onResetFilters={onResetFilters}
      />

      <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
        <TabSidebarList
          tabSummaries={tabSummaries}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          ignoredTabs={activeIgnored}
          onToggleIgnoreTab={onToggleIgnoreTab}
        />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '8px 14px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>物品列表 (顯示 {sortedItems.length} 項)</span>
            <span>排序：{sortBy === 'value' ? '總價由高至低' : sortBy === 'stack' ? '數量由多至少' : '名稱'}</span>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {sortedItems.length > 0 ? (
              sortedItems.map((item, idx) => <TabItemCard key={item.id || idx} item={item} />)
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                沒有符合當前過濾或搜尋條件的物品
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabBreakdown;
