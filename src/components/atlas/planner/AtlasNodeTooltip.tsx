import React from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';
import { Sparkles } from 'lucide-react';

interface AtlasNodeTooltipProps {
  node: AtlasNode | null;
  autoPathMode: boolean;
}

export const AtlasNodeTooltip: React.FC<AtlasNodeTooltipProps> = ({ node, autoPathMode }) => {
  if (!node) return null;

  const isKeystone = node.type === 'keystone';
  const isStart = node.type === 'start';
  const isNotable = node.type === 'notable';

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      maxWidth: '360px',
      background: '#101522',
      border: '1.5px solid var(--border-gold)',
      borderRadius: '6px',
      padding: '12px 14px',
      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.95)',
      pointerEvents: 'none',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-gold)' }}>
          {node.name}
        </span>
        <span style={{
          fontSize: '0.72rem',
          padding: '2px 6px',
          borderRadius: '4px',
          background: isKeystone ? 'rgba(245, 158, 11, 0.2)' : isStart ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.15)',
          color: isKeystone ? '#fde047' : isStart ? '#38bdf8' : '#cbd5e1'
        }}>
          {isKeystone ? '核心基石天賦' : isStart ? '起點' : isNotable ? '重要輿圖天賦' : '小型輿圖天賦'}
        </span>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
        {node.nameEn}
      </div>

      {node.description && (
        <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
          {node.description}
        </div>
      )}

      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {node.stats.map((st, idx) => (
          <div key={idx} style={{ fontSize: '0.76rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>{st}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--accent-blue)', fontStyle: 'italic' }}>
        💡 點擊節點配置/取消 {autoPathMode ? '(已啟用智能最短路徑)' : '(自由點選)'}
      </div>
    </div>
  );
};
