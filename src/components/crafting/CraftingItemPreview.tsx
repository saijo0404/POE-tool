import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { SimulatedItem } from '../../domain/crafting/types';

interface CraftingItemPreviewProps {
  item: SimulatedItem | null;
}

export const CraftingItemPreview: React.FC<CraftingItemPreviewProps> = ({ item }) => {
  if (!item) {
    return (
      <div
        style={{
          border: '1px dashed rgba(200, 170, 110, 0.3)',
          borderRadius: '6px',
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.86rem',
        }}
      >
        點擊右上方「試骰 1 次」或「自動模擬點到出」以檢視模擬裝備詞綴
      </div>
    );
  }

  const { baseItem, ilvl, prefixes, suffixes, hitAllTargets } = item;

  return (
    <div
      style={{
        backgroundColor: '#0a0b0f',
        border: `2px solid ${hitAllTargets ? '#2ecc71' : '#af8b46'}`,
        borderRadius: '4px',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: hitAllTargets ? '0 0 20px rgba(46, 204, 113, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Item Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.4)', paddingBottom: '8px' }}>
        <h4 className="poe-font" style={{ margin: 0, fontSize: '1.05rem', color: '#f3d179' }}>
          精製之 {baseItem.nameZh}
        </h4>
        <span style={{ fontSize: '0.85rem', color: '#af8b46' }}>
          {baseItem.name} (ilvl {ilvl})
        </span>
      </div>

      {/* Hit All Targets Badge */}
      {hitAllTargets && (
        <div
          style={{
            backgroundColor: 'rgba(46, 204, 113, 0.15)',
            border: '1px solid #2ecc71',
            borderRadius: '4px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#2ecc71',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} />
          <span>完美命中所有目標詞綴！</span>
        </div>
      )}

      {/* Implicit */}
      {baseItem.implicit && (
        <div style={{ textAlign: 'center', color: '#68c4ff', fontSize: '0.82rem', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '6px' }}>
          {baseItem.implicit}
        </div>
      )}

      {/* Prefixes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {prefixes.map((mod, idx) => (
          <div
            key={`p-${idx}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: mod.isTargetHit ? '#f3d179' : '#8899ac',
              fontWeight: mod.isTargetHit ? 600 : 400,
            }}
          >
            <span>• {mod.text}</span>
            <span style={{ fontSize: '0.7rem', color: mod.isTargetHit ? '#2ecc71' : 'var(--text-muted)' }}>
              [前綴 T{mod.tier}] {mod.isTargetHit ? '✓ 目標' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Suffixes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed rgba(200, 170, 110, 0.2)', paddingTop: '6px' }}>
        {suffixes.map((mod, idx) => (
          <div
            key={`s-${idx}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: mod.isTargetHit ? '#f3d179' : '#8899ac',
              fontWeight: mod.isTargetHit ? 600 : 400,
            }}
          >
            <span>• {mod.text}</span>
            <span style={{ fontSize: '0.7rem', color: mod.isTargetHit ? '#2ecc71' : 'var(--text-muted)' }}>
              [後綴 T{mod.tier}] {mod.isTargetHit ? '✓ 目標' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
