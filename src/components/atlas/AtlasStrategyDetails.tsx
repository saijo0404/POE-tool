import React, { useState } from 'react';
import type { AtlasStrategy, AtlasStrategyTier } from '../../domain/atlas/types';
import { ExternalLink, Copy, MapPin, Shield, BookOpen, Edit, CopyPlus, Trash2, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { sanitizeAtlasTreeUrl } from '../../domain/atlas/atlasHelpers';
import { poeApi } from '../../services/api';
import { AtlasNativePlanner } from './AtlasNativePlanner';

interface AtlasStrategyDetailsProps {
  strategy: AtlasStrategy;
  currentTier: AtlasStrategyTier;
  onEditStrategy: () => void;
  onDuplicateStrategy: () => void;
  onDeleteStrategy: () => void;
  onSaveAllocatedNodes?: (nodes: string[]) => void;
  onShowToast: (msg: string) => void;
}

export const AtlasStrategyDetails: React.FC<AtlasStrategyDetailsProps> = ({
  strategy,
  currentTier,
  onEditStrategy,
  onDuplicateStrategy,
  onDeleteStrategy,
  onSaveAllocatedNodes,
  onShowToast
}) => {
  const [isPlannerExpanded, setIsPlannerExpanded] = useState<boolean>(true);
  const treeUrl = sanitizeAtlasTreeUrl(currentTier.atlasTreeUrl);

  const handleOpenAtlasTree = async () => {
    try {
      await poeApi.openExternalUrl(treeUrl).catch(() => {
        window.open(treeUrl, '_blank');
      });
      onShowToast(`🌐 已在瀏覽器為您開啟【${currentTier.name}】輿圖天賦樹！`);
    } catch {
      window.open(treeUrl, '_blank');
    }
  };

  const handleCopyAtlasTree = async () => {
    try {
      await navigator.clipboard.writeText(treeUrl);
      onShowToast('📋 已複製輿圖天賦樹網址至剪貼簿！');
    } catch {
      onShowToast('複製失敗');
    }
  };

  return (
    <div className="poe-card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className="poe-font" style={{ fontSize: '1.25rem', color: 'var(--text-gold)', margin: 0 }}>
              {strategy.name}
            </h2>
            <span style={{
              fontSize: '0.78rem',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--accent-blue)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              當前分級：{currentTier.name}
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            {currentTier.description || strategy.description}
          </p>
        </div>

        {/* Strategy Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="poe-button-secondary"
            onClick={onEditStrategy}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Edit size={14} /> 編輯策略資料
          </button>
          <button
            type="button"
            className="poe-button-secondary"
            onClick={onDuplicateStrategy}
            title="複製此策略"
            style={{ padding: '6px 10px' }}
          >
            <CopyPlus size={14} />
          </button>
          {strategy.isCustom && (
            <button
              type="button"
              className="poe-button-secondary"
              onClick={() => {
                if (window.confirm(`確定要刪除自訂策略「${strategy.name}」嗎？`)) {
                  onDeleteStrategy();
                }
              }}
              title="刪除此策略"
              style={{ color: '#f87171', padding: '6px 10px' }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid for Maps and Keystones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        {/* Recommended Maps */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, marginBottom: '6px' }}>
            <MapPin size={14} /> 推薦地圖 (Recommended Maps)
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {currentTier.recommendedMaps && currentTier.recommendedMaps.length > 0 ? (
              currentTier.recommendedMaps.map((mapName, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    background: 'rgba(200, 170, 110, 0.12)',
                    border: '1px solid rgba(200, 170, 110, 0.25)',
                    color: '#e2e8f0',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  📍 {mapName}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>無指定地圖，各類 T16 均可</span>
            )}
          </div>
        </div>

        {/* Core Keystones */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, marginBottom: '6px' }}>
            <Shield size={14} /> 核心輿圖基石天賦 (Atlas Keystones)
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {currentTier.coreKeystones && currentTier.coreKeystones.length > 0 ? (
              currentTier.coreKeystones.map((stone, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    background: 'rgba(168, 85, 247, 0.12)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#d8b4fe',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  ⭐ {stone}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>常規天賦點配置</span>
            )}
          </div>
        </div>
      </div>

      {/* Atlas Tree Action Bar & Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: 'linear-gradient(90deg, rgba(200, 170, 110, 0.1) 0%, rgba(14, 143, 127, 0.1) 100%)',
        border: '1px solid rgba(200, 170, 110, 0.25)',
        padding: '10px 14px',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.88rem' }}>
            <Compass size={17} />
            <span>內建輿圖天賦規劃器：</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Toggle Planner Button */}
            <button
              type="button"
              className={isPlannerExpanded ? 'poe-button' : 'poe-button-secondary'}
              onClick={() => setIsPlannerExpanded(!isPlannerExpanded)}
              style={{ fontSize: '0.82rem', padding: '5px 12px', height: '30px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{isPlannerExpanded ? '收合天賦規劃畫布' : '展開天賦規劃畫布'}</span>
              {isPlannerExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* External Browser Button */}
            <button
              type="button"
              className="poe-button-secondary"
              onClick={handleOpenAtlasTree}
              style={{ fontSize: '0.8rem', padding: '5px 10px', height: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="在系統預設瀏覽器中開啟"
            >
              <ExternalLink size={13} /> 外部瀏覽器開啟
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              className="poe-button-secondary"
              onClick={handleCopyAtlasTree}
              style={{ fontSize: '0.8rem', padding: '5px 10px', height: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="複製天賦樹網址"
            >
              <Copy size={13} /> 複製網址
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {treeUrl}
        </div>
      </div>

      {/* Embedded Native Interactive Atlas Tree Planner */}
      {isPlannerExpanded && (
        <AtlasNativePlanner
          strategyId={strategy.id}
          tierId={currentTier.id}
          strategyName={strategy.name}
          tierName={currentTier.name}
          initialAllocatedNodes={currentTier.allocatedNodes}
          onSaveAllocatedNodes={onSaveAllocatedNodes}
          onShowToast={onShowToast}
        />
      )}

      {/* Mechanic Notes / Tips */}
      {currentTier.mechanicNotes && (
        <div style={{
          background: 'rgba(243, 209, 121, 0.05)',
          borderLeft: '3px solid var(--border-gold)',
          padding: '8px 12px',
          borderRadius: '0 4px 4px 0',
          fontSize: '0.82rem',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <BookOpen size={16} color="var(--text-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--text-gold)', marginRight: '6px' }}>刷圖技巧與機制要點：</strong>
            <span>{currentTier.mechanicNotes}</span>
          </div>
        </div>
      )}
    </div>
  );
};
