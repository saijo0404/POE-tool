import React, { useRef } from 'react';
import type { AtlasStrategy, AtlasMechanicCategory } from '../../domain/atlas/types';
import { Search, Plus, Download, Upload, RotateCcw, Sparkles } from 'lucide-react';

interface AtlasStrategySelectorProps {
  strategies: AtlasStrategy[];
  selectedStrategyId: string;
  onSelectStrategy: (id: string) => void;
  filterCategory: AtlasMechanicCategory;
  onFilterCategory: (cat: AtlasMechanicCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewStrategy: () => void;
  onExportJson: () => void;
  onImportJson: (json: string) => void;
  onResetDefaults: () => void;
}

const CATEGORIES: Array<{ id: AtlasMechanicCategory; label: string; icon: string }> = [
  { id: 'all', label: '全部機制', icon: '🌐' },
  { id: 'essence', label: '精髓 (Essence)', icon: '💎' },
  { id: 'ambush', label: '伏擊開箱 (Ambush)', icon: '📦' },
  { id: 'harvest', label: '莊園收割 (Harvest)', icon: '🌾' },
  { id: 'expedition', label: '探險炸墳 (Expedition)', icon: '💣' },
  { id: 'legion', label: '戰亂軍團 (Legion)', icon: '⚔️' },
  { id: 'delirium', label: '瞻妄之霧 (Delirium)', icon: '🌫️' },
  { id: 'boss', label: '輿圖王速刷 (Boss Rush)', icon: '👑' },
  { id: 'breach', label: '破滅裂痕 (Breach)', icon: '🌀' },
  { id: 'torment', label: '苦痛流亡者 (Torment)', icon: '👻' },
  { id: 'ritual', label: '儀式祭壇 (Ritual)', icon: '🩸' },
  { id: 'bestiary', label: '野獸獵魔 (Bestiary)', icon: '🦁' },
  { id: 'custom', label: '我的自訂策略', icon: '⭐' }
];

export const AtlasStrategySelector: React.FC<AtlasStrategySelectorProps> = ({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  filterCategory,
  onFilterCategory,
  searchQuery,
  onSearchChange,
  onNewStrategy,
  onExportJson,
  onImportJson,
  onResetDefaults
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

          <button
            type="button"
            className="poe-button-secondary"
            onClick={onResetDefaults}
            title="重置為系統預設策略"
            style={{ height: '36px', padding: '0 10px', fontSize: '0.82rem', color: '#fca5a5' }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => {
          const isActive = filterCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onFilterCategory(cat.id)}
              className={isActive ? 'poe-button' : 'poe-button-secondary'}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.8rem',
                padding: '6px 12px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
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
              : '🌟 策略庫目前為空，請點擊上方「+ 新增自訂策略」或「重置預設」開始規劃！'}
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
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? 'var(--text-gold)' : '#e2e8f0', lineHeight: 1.3 }}>
                    {strat.isCustom && <Sparkles size={12} color="#f59e0b" style={{ display: 'inline', marginRight: '4px' }} />}
                    {strat.name}
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(200, 170, 110, 0.15)',
                    color: 'var(--text-gold)',
                    whiteSpace: 'nowrap'
                  }}>
                    {strat.tiers.length} 個分級
                  </span>
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
