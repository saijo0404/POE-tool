import React, { useState, useMemo } from 'react';
import type { StashTabSummary, StashItem } from '../types/poe';
import { getImageUrl } from '../utils/image';
import { Layers, Package, ArrowUpDown, Search, X, EyeOff, Eye, Filter, RotateCcw } from 'lucide-react';
import { ItemTooltip } from './common/ItemTooltip';

interface TabBreakdownProps {
  tabSummaries: StashTabSummary[];
  topItems: StashItem[];
  totalChaos: number;
  totalDivine?: number;
  allItems?: StashItem[];
  ignoredTabNames?: string[];
  onToggleIgnoreTab?: (tabName: string) => void;
  minValueChaos?: number;
  onChangeMinValueChaos?: (val: number) => void;
  selectedCategory?: string;
  onChangeCategory?: (cat: string) => void;
  onResetFilters?: () => void;
}

const CATEGORY_TABS = [
  { key: 'ALL', label: '全部' },
  { key: 'Currency', label: '通貨 Currency' },
  { key: 'Fragment', label: '碎片 Fragment' },
  { key: 'DivCard', label: '命運卡 Cards' },
  { key: 'Essence', label: '精髓 Essence' },
  { key: 'Scarab', label: '甲蟲 Scarab' },
  { key: 'Map', label: '地圖 Maps' },
  { key: 'Equipment', label: '裝備 Equipment' }
];

const PRICE_THRESHOLDS = [
  { value: 0, label: '全部 (0c+)' },
  { value: 1, label: '≥ 1 c' },
  { value: 5, label: '≥ 5 c' },
  { value: 10, label: '≥ 10 c' },
  { value: 50, label: '≥ 50 c' },
  { value: 150, label: '≥ 1 Div (150c+)' }
];

export const TabBreakdown: React.FC<TabBreakdownProps> = ({
  tabSummaries = [],
  topItems = [],
  totalChaos = 0,
  allItems = [],
  ignoredTabNames = [],
  onToggleIgnoreTab,
  minValueChaos = 0,
  onChangeMinValueChaos,
  selectedCategory = 'ALL',
  onChangeCategory,
  onResetFilters
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'stack'>('value');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isFilterActive = minValueChaos > 0 || ignoredTabNames.length > 0 || selectedCategory !== 'ALL';

  // 1. Filter items based on selected tab, minimum price, ignored tabs, and category
  const baseItems = useMemo(() => {
    const rawList = selectedTab === 'ALL'
      ? (allItems.length > 0 ? allItems : topItems)
      : allItems.filter(item => item.tabName === selectedTab);

    return rawList.filter(item => {
      if (minValueChaos > 0 && (item.unitPriceChaos || item.totalPriceChaos) < minValueChaos) {
        return false;
      }
      if (ignoredTabNames.includes(item.tabName)) {
        return false;
      }
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [selectedTab, allItems, topItems, minValueChaos, ignoredTabNames, selectedCategory]);

  // 2. Filter items based on search keyword
  const searchedItems = useMemo(() => {
    if (!searchTerm.trim()) return baseItems;
    const term = searchTerm.toLowerCase().trim();
    return baseItems.filter(item =>
      (item.typeLine && item.typeLine.toLowerCase().includes(term)) ||
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.tabName && item.tabName.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term))
    );
  }, [baseItems, searchTerm]);

  // 3. Sort filtered items
  const sortedItems = useMemo(() => {
    return [...searchedItems].sort((a, b) => {
      if (sortBy === 'value') return b.totalPriceChaos - a.totalPriceChaos;
      if (sortBy === 'stack') return (b.stackSize || 1) - (a.stackSize || 1);
      return (a.typeLine || a.name || '').localeCompare(b.typeLine || b.name || '');
    });
  }, [searchedItems, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Interactive Wealth Customization Filter Toolbar */}
      <div className="poe-card" style={{ background: '#0a0d14', border: '1px solid rgba(200, 170, 110, 0.25)', padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-gold)" />
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-gold)' }}>
              資產自訂過濾面板 (Custom Wealth Filters)
            </span>
            {isFilterActive && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                過濾中 (Filtered)
              </span>
            )}
          </div>

          {isFilterActive && onResetFilters && (
            <button
              className="poe-btn"
              onClick={onResetFilters}
              style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RotateCcw size={12} /> 重設所有篩選
            </button>
          )}
        </div>

        {/* 1. Price Threshold Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '90px' }}>單價門檻:</span>
          {PRICE_THRESHOLDS.map(th => {
            const isSelected = (minValueChaos || 0) === th.value;
            return (
              <button
                key={th.value}
                onClick={() => onChangeMinValueChaos && onChangeMinValueChaos(th.value)}
                style={{
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  borderRadius: '4px',
                  border: isSelected ? '1px solid var(--text-gold)' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(200, 170, 110, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? 'var(--text-gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                {th.label}
              </button>
            );
          })}
        </div>

        {/* 2. Category Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '90px' }}>物品種類:</span>
          {CATEGORY_TABS.map(cat => {
            const isSelected = (selectedCategory || 'ALL') === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onChangeCategory && onChangeCategory(cat.key)}
                style={{
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  borderRadius: '4px',
                  border: isSelected ? '1px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3. Ignored Tabs Notice */}
        {ignoredTabNames.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: '#f87171' }}>已排除倉庫頁:</span>
            {ignoredTabNames.map(tName => (
              <span
                key={tName}
                style={{
                  fontSize: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {tName}
                {onToggleIgnoreTab && (
                  <span
                    onClick={() => onToggleIgnoreTab(tName)}
                    title="恢復包含此倉庫頁"
                    style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Top Section: Stash Tab Summary Overview */}
      <div className="poe-card">
        <h3 className="poe-font" style={{ color: 'var(--text-gold)', fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--border-gold)" />
          倉庫頁面價值與佔比總覽 (點擊頁面可切換詳細明細或排除計算)
        </h3>

        {tabSummaries.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '30px' }}>
            尚無倉庫分類數據
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {tabSummaries.map((tab, idx) => {
              const isIgnored = ignoredTabNames.includes(tab.tabName);
              const percentage = totalChaos > 0 ? Math.min(100, Math.round((tab.totalValueChaos / totalChaos) * 100)) : 0;
              const isSelected = selectedTab === tab.tabName;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedTab(isSelected ? 'ALL' : tab.tabName)}
                  style={{
                    background: isIgnored
                      ? 'rgba(30, 15, 15, 0.6)'
                      : (isSelected ? 'rgba(200, 170, 110, 0.15)' : '#090c10'),
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${isIgnored ? 'rgba(239, 68, 68, 0.3)' : (isSelected ? 'var(--text-gold)' : 'rgba(255,255,255,0.08)')}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isIgnored ? 0.6 : 1,
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isIgnored ? '#fca5a5' : (isSelected ? 'var(--text-gold)' : '#fff'), display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {tab.tabName}
                      {isIgnored && <span style={{ fontSize: '0.7rem', color: '#f87171' }}>(已排除)</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', color: isIgnored ? 'var(--text-muted)' : 'var(--text-gold)', fontWeight: 700 }}>
                        {tab.totalValueDivine} Div
                      </span>
                      {onToggleIgnoreTab && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleIgnoreTab(tab.tabName);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: isIgnored ? '#4ade80' : 'var(--text-muted)',
                            padding: '2px 4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={isIgnored ? '恢復包含至總資產' : '從總資產中排除此頁'}
                        >
                          {isIgnored ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>{tab.category} • {tab.itemCount} 個物品</span>
                    <span>{tab.totalValueChaos} c ({isIgnored ? '0' : percentage}%)</span>
                  </div>

                  <div style={{ width: '100%', height: '5px', background: '#172030', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${isIgnored ? 0 : percentage}%`,
                      height: '100%',
                      background: isIgnored ? '#64748b' : 'linear-gradient(90deg, #8c7849 0%, #f3d179 100%)',
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Section: Specific Stash Tab Detailed Items Grid */}
      <div className="poe-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="poe-font" style={{ color: 'var(--text-gold)', fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="var(--accent-blue)" />
              {selectedTab === 'ALL' ? '全部倉庫物品明細 (All Stash Items)' : `「${selectedTab}」頁面包含的內容明細`}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              顯示 {sortedItems.length} / {baseItems.length} 件物品 {minValueChaos > 0 ? `(已過濾 < ${minValueChaos}c)` : ''}
            </span>
          </div>

          {/* Search Bar & Sorting Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input Bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                className="poe-input"
                placeholder="搜尋物品名稱/種類..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '30px', paddingRight: searchTerm ? '28px' : '10px', fontSize: '0.8rem', width: '180px' }}
              />
              {searchTerm && (
                <X
                  size={14}
                  color="var(--text-muted)"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '8px', cursor: 'pointer' }}
                />
              )}
            </div>

            {selectedTab !== 'ALL' && (
              <button
                className="poe-btn"
                onClick={() => setSelectedTab('ALL')}
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                顯示全部倉庫
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ArrowUpDown size={14} />
              排序:
              <select
                className="poe-input"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
              >
                <option value="value">依總價值 (Highest Value)</option>
                <option value="stack">依堆疊數量 (Stack Size)</option>
                <option value="name">依名稱 (Name)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detailed Items Grid List */}
        {sortedItems.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '30px' }}>
            {searchTerm ? `找不到符合「${searchTerm}」的物品` : '此倉庫頁中無符合目前篩選條件之物品'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px' }}>
            {sortedItems.map((item, idx) => (
              <ItemTooltip
                key={idx}
                item={{
                  name: item.name || item.typeLine,
                  typeLine: item.typeLine,
                  baseType: item.typeLine,
                  rarity: item.category === 'Equipment' ? 'Rare' : (item.category === 'Currency' ? 'Currency' : 'Normal')
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#090c10',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(200, 170, 110, 0.15)',
                  transition: 'border 0.2s ease',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {item.icon && (
                      <div style={{ width: '38px', height: '38px', background: '#040608', borderRadius: '4px', border: '1px solid #1a2334', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={getImageUrl(item.icon)} alt={item.typeLine} style={{ maxWidth: '32px', maxHeight: '32px' }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-gold)' }}>
                        {item.typeLine} {item.stackSize && item.stackSize > 1 ? <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>x{item.stackSize}</span> : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.tabName} • 單價: {item.unitPriceChaos} c
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-gold)' }}>
                      {item.totalPriceDivine} Div
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.totalPriceChaos} c
                    </div>
                  </div>
                </div>
              </ItemTooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabBreakdown;
