import React from 'react';
import { AlertOctagon } from 'lucide-react';
import type { MapDangerEvaluation } from '../../domain/mapMod/types';

interface MapDangerBannerProps {
  evaluation: MapDangerEvaluation | null;
}

export const MapDangerBanner: React.FC<MapDangerBannerProps> = ({ evaluation }) => {
  if (!evaluation || !evaluation.hasDanger) return null;

  const totalDanger = evaluation.matchedDangerMods.length + evaluation.matchedCustomKeywords.length;

  return (
    <div
      style={{
        background: 'rgba(229, 80, 57, 0.18)',
        border: '1px solid rgba(229, 80, 57, 0.6)',
        borderRadius: '6px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 0 16px rgba(229, 80, 57, 0.2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff7675', fontWeight: 'bold' }}>
        <AlertOctagon size={18} color="#ff7675" />
        <span>⚠️ 致命地圖警報：此地圖包含 {totalDanger} 個流派危險詞綴！</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
        {evaluation.matchedDangerMods.map((m, idx) => (
          <span
            key={idx}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.78rem',
              color: '#ff7675',
              border: '1px solid rgba(229, 80, 57, 0.4)'
            }}
          >
            ❌ {m.def.nameZh} ({m.def.nameEn}): <code>{m.matchedLine}</code>
          </span>
        ))}
      </div>
    </div>
  );
};
