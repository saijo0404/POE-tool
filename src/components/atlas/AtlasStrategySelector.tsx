import React, { useRef, useMemo } from 'react';
import type { AtlasStrategy, AtlasMechanicCategory } from '../../domain/atlas/types';
import { Search, Plus, Download, Upload, Sparkles, Trash2, X } from 'lucide-react';

interface AtlasStrategySelectorProps {
  strategies: AtlasStrategy[];
  selectedStrategyId: string;
  onSelectStrategy: (id: string) => void;
  filterCategory: AtlasMechanicCategory;
  onFilterCategory: (cat: AtlasMechanicCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewStrategy: () => void;
  onDeleteStrategy?: (id: string) => void;
  onDeleteCategory?: (cat: AtlasMechanicCategory) => void;
  onClearAllStrategies?: () => void;
  onExportJson: () => void;
  onImportJson: (json: string) => void;
}

const CATEGORIES_METADATA: Record<string, { label: string; icon: string }> = {
  all: { label: '全部機制', icon: '🌐' },
  essence: { label: '精髓', icon: '💎' },
  ambush: { label: '伏擊開箱', icon: '📦' },
  harvest: { label: '莊園收割', icon: '🌾' },
  expedition: { label: '探險炸墳', icon: '💣' },
  legion: { label: '戰亂軍團', icon: '⚔️' },
  delirium: { label: '瞻妄之霧', icon: '🌫️' },
  boss: { label: '輿圖王速刷', icon: '👑' },
  breach: { label: '破滅裂痕', icon: '🌀' },
  torment: { label: '苦痛流亡者', icon: '👻' },
  ritual: { label: '儀式祭壇', icon: '🩸' },
  bestiary: { label: '野獸獵魔', icon: '🦁' },
  custom: { label: '我的自訂策略', icon: '⭐' }
};

export const AtlasStrategySelector: React.FC<AtlasStrategySelectorProps> = ({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  filterCategory,
  onFilterCategory,
  searchQuery,
  onSearchChange,
  onNewStrategy,
  onDeleteStrategy,
  onDeleteCategory,
  onClearAllStrategies,
  onExportJson,
  onImportJson
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) onImportJson(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Count strategies per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: strategies.length };
    strategies.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [strategies]);

  // Dynamically compute active categories that actually exist in the current strategy database
  const activeCategories = useMemo(() => {
    const list: Array<{ id: AtlasMechanicCategory; label: string; icon: string; count: number }> = [
      { id: 'all', label: '全部機制', icon: '🌐', count: strategies.length }
    ];

    // Find all distinct categories present in current strategies
    const distinctCategories = Array.from(new Set(strategies.map(s => s.category)));

    distinctCategories.forEach(catId => {
      if (catId === 'all') return;
      const meta = CATEGORIES_METADATA[catId] || { label: catId, icon: '🏷️' };
      list.push({
        id: catId as AtlasMechanicCategory,
        label: meta.label,
        icon: meta.icon,
        count: categoryCounts[catId] || 0
      });
    });

    return list;
  }, [strategies, categoryCounts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="poe-input"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="搜尋策略名稱、推薦地圖、基石天賦或關鍵字..."
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="poe-button"
            onClick={onNewStrategy}
            style={{ height: '36px', padding: '0 14px', fontSize: '0.84rem' }}
          >
            <Plus size={15} /> 新增自訂策略
          </button>

          <button
            type="button"
            className="poe-button-secondary"
            onClick={onExportJson}
            title="匯出所有策略為 JSON 檔案"
            style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem' }}
          >
            <Download size={14} /> 匯出備份
          </button>

          <button
            type="button"
            className="poe-button-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="匯入策略 JSON 檔案"
            style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem' }}
          >
            <Upload size={14} /> 匯入策略
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          {strategies.length > 0 && onClearAllStrategies && (
            <button
              type="button"
              className="poe-button-secondary"
              onClick={onClearAllStrategies}
              title="清空所有策略"
              style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem', color: '#f87171' }}
            >
              <Trash2 size={14} /> 清空所有策略
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Mechanic Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
        {activeCategories.map(cat => {
          const isActive = filterCategory === cat.id;
          return (
            <div
              key={cat.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: isActive ? 'linear-gradient(135deg, #c8aa6e 0%, #8c7849 100%)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1px solid #f3d179' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '2px 4px 2px 8px',
                color: isActive ? '#0d121c' : '#cbd5e1',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onClick={() => onFilterCategory(cat.id)}
            >
              <span style={{ marginRight: '5px' }}>{cat.icon}</span>
              <span>{cat.label}</span>
              <span style={{
                marginLeft: '5px',
                fontSize: '0.7rem',
                padding: '1px 5px',
                borderRadius: '10px',
                background: isActive ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                color: isActive ? '#fff' : '#94a3b8'
              }}>
                {cat.count}
              </span>

              {cat.id !== 'all' && onDeleteCategory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(cat.id);
                  }}
                  title={`刪除【${cat.label}】分類及其下所有策略`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isActive ? '#450a0a' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    marginLeft: '4px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? '#450a0a' : '#94a3b8')}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Horizontal Strategy Cards Carousel/Selector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '10px',
        maxHeight: '175px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {strategies.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '6px',
            border: '1px dashed rgba(200, 170, 110, 0.25)'
          }}>
            {searchQuery || filterCategory !== 'all'
              ? '🔍 找不到符合條件的輿圖策略，請嘗試清除搜尋關鍵字或分類篩選。'
              : '🌟 策略庫目前為空，請點擊上方「+ 新增自訂策略」或「載入預設範本」開始規劃！'}
          </div>
        ) : (
          strategies.map(strat => {
            const isSelected = strat.id === selectedStrategyId;
            return (
              <div
                key={strat.id}
                onClick={() => onSelectStrategy(strat.id)}
                style={{
                  background: isSelected ? 'linear-gradient(145deg, #1b2434 0%, #101622 100%)' : 'var(--bg-card)',
                  border: isSelected ? '1.5px solid var(--border-gold-bright)' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(243, 209, 121, 0.25)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? 'var(--text-gold)' : '#e2e8f0', lineHeight: 1.3, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {strat.isCustom && <Sparkles size={12} color="#f59e0b" style={{ display: 'inline', marginRight: '4px' }} />}
                    {strat.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(200, 170, 110, 0.15)',
                      color: 'var(--text-gold)',
                      whiteSpace: 'nowrap'
                    }}>
                      {strat.tiers.length} 分級
                    </span>
                    {onDeleteStrategy && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`確定要刪除策略「${strat.name}」嗎？`)) {
                            onDeleteStrategy(strat.id);
                          }
                        }}
                        title={`刪除策略「${strat.name}」`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '3px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.35
                }}>
                  {strat.description}
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {strat.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-dim)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1px 5px',
                        borderRadius: '3px'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
