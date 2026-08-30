import React from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';
import { Sparkles, Route, Info } from 'lucide-react';
import { translateStatToZh } from '../../../domain/atlas/atlasTreeStats';

interface AtlasNodeTooltipProps {
  node: AtlasNode | null;
  autoPathMode: boolean;
  isAllocated?: boolean;
  previewCount?: number;
  remainingPoints?: number;
}

const CATEGORY_NAMES: Record<string, string> = {
  essence: '💎 精髓 (Essence)',
  ambush: '📦 伏擊 (Ambush)',
  harvest: '🌾 莊園 (Harvest)',
  expedition: '💣 探險 (Expedition)',
  legion: '⚔️ 軍團 (Legion)',
  delirium: '🌫️ 譫妄 (Delirium)',
  ritual: '🩸 祭祀 (Ritual)',
  breach: '🌀 裂痕 (Breach)',
  beyond: '🌌 超越 (Beyond)',
  blight: '🍄 枯萎 (Blight)',
  scarab: '🐞 聖甲蟲 (Scarab)',
  boss: '👑 輿圖首領 (Boss / Eldritch)',
  map: '🗺️ 地圖掉落 (Map Sustain)',
  bestiary: '🦁 獵魔 (Bestiary)',
  torment: '👻 苦痛 (Torment)',
  general: '🧭 通用機制 (General)',
  custom: '✨ 自訂 (Custom)'
};

export const AtlasNodeTooltip: React.FC<AtlasNodeTooltipProps> = ({
  node,
  autoPathMode,
  isAllocated = false,
  previewCount = 1,
  remainingPoints = 138
}) => {
  if (!node) return null;

  const isKeystone = node.type === 'keystone';
  const isStart = node.type === 'start';
  const isNotable = node.type === 'notable';
  const categoryLabel = CATEGORY_NAMES[node.category] || node.category;
  const isOverflow = !isAllocated && previewCount > remainingPoints;

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      maxWidth: '380px',
      background: 'rgba(13, 19, 33, 0.95)',
      border: isAllocated ? '1.5px solid #fde047' : isOverflow ? '1.5px solid #ef4444' : isKeystone ? '1.5px solid #f59e0b' : '1.5px solid var(--border-gold)',
      borderRadius: '8px',
      padding: '12px 14px',
      boxShadow: '0 10px 32px rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(8px)',
      pointerEvents: 'none',
      zIndex: 100
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.98rem', color: isAllocated ? '#fde047' : 'var(--text-gold)' }}>
          {node.name}
        </span>
        <span style={{
          fontSize: '0.72rem',
          padding: '2px 8px',
          borderRadius: '4px',
          fontWeight: 600,
          background: isKeystone ? 'rgba(245, 158, 11, 0.25)' : isStart ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.15)',
          color: isKeystone ? '#fde047' : isStart ? '#38bdf8' : '#cbd5e1',
          border: isKeystone ? '1px solid rgba(245, 158, 11, 0.5)' : isStart ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {isKeystone ? '⭐ 核心基石天賦' : isStart ? '🏛️ 輿圖起點' : isNotable ? '🔸 重要輿圖天賦' : '🔹 小型天賦'}
        </span>
      </div>

      {/* Subtitles (English Name & Mechanic Category) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
        <span>{node.nameEn}</span>
        <span style={{ color: '#94a3b8' }}>{categoryLabel}</span>
      </div>

      {/* Description if present */}
      {node.description && (
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px', background: 'rgba(255,255,255,0.03)', padding: '5px 8px', borderRadius: '4px' }}>
          {node.description}
        </div>
      )}

      {/* Stats List */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {node.stats.map((st, idx) => {
          const zh = translateStatToZh(st);
          return (
            <div key={idx} style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', alignItems: 'flex-start', gap: '5px', lineHeight: 1.35 }}>
              <Sparkles size={12} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div>{zh}</div>
                {zh !== st && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>{st}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Hint / Cost Preview */}
      <div style={{
        marginTop: '10px',
        paddingTop: '6px',
        borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
        fontSize: '0.74rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: isAllocated ? '#fca5a5' : isOverflow ? '#f87171' : '#38bdf8',
        fontWeight: 500
      }}>
        {isAllocated ? (
          <>
            <Info size={12} color="#f87171" />
            <span>點擊以取消配置此節點 {autoPathMode ? '(將自動修剪斷開之分支)' : ''}</span>
          </>
        ) : isOverflow ? (
          <>
            <Info size={12} color="#f87171" />
            <span>⚠️ 點數不足！配置需 {previewCount} 點，但目前僅剩餘 {remainingPoints} 點</span>
          </>
        ) : (
          <>
            <Route size={12} color="#38bdf8" />
            <span>
              {autoPathMode
                ? `點擊以自動連線配置 (${previewCount} 個天賦點數)`
                : '點擊以直接配置此節點'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
