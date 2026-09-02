import React from 'react';
import type { ParsedItemMod, MapDangerEvaluation } from '../../types/poe';
import { calculateRollRating } from '../../domain/overlay/rollRating';

interface OverlayModListProps {
  mods: ParsedItemMod[];
  onToggleMod: (idx: number) => void;
  dangerEvaluation?: MapDangerEvaluation | null;
}

const RATING_COLORS: Record<string, { bg: string; text: string }> = {
  Max: { bg: 'rgba(255, 185, 72, 0.25)', text: '#ffc107' },
  High: { bg: 'rgba(104, 211, 145, 0.25)', text: '#68d391' },
  Mid: { bg: 'rgba(99, 179, 237, 0.25)', text: '#63b3ed' },
  Low: { bg: 'rgba(245, 101, 101, 0.25)', text: '#f56565' },
  None: { bg: 'transparent', text: '#8c94a4' }
};

export const OverlayModList: React.FC<OverlayModListProps> = ({
  mods,
  onToggleMod,
  dangerEvaluation
}) => {
  if (mods.length === 0) {
    return null;
  }

  const matchedDangerMap = new Map<string, { name: string; severity: string }>();
  if (dangerEvaluation?.matchedDangerMods) {
    dangerEvaluation.matchedDangerMods.forEach(m => {
      matchedDangerMap.set(m.matchedLine.trim(), {
        name: m.def.nameZh,
        severity: m.def.severity
      });
    });
  }

  return (
    <div style={{
      maxHeight: '160px',
      overflowY: 'auto',
      padding: '4px 8px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(12, 15, 20, 0.7)'
    }}>
      {mods.map((mod, idx) => {
        const rating = calculateRollRating(mod.value, mod.minValue, mod.maxValue, mod.tier);
        const ratingColor = RATING_COLORS[rating.ratingLabel] || RATING_COLORS.None;

        const dangerInfo = matchedDangerMap.get(mod.text.trim()) ||
          Array.from(matchedDangerMap.entries()).find(([line]) => mod.text.includes(line) || line.includes(mod.text))?.[1];

        const isDangerous = Boolean(dangerInfo);

        return (
          <label
            key={mod.id || idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 4px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: isDangerous ? '#ff7675' : (mod.enabled ? '#e2e8f0' : '#64748b'),
              background: isDangerous
                ? 'rgba(229, 80, 57, 0.22)'
                : (mod.enabled ? 'rgba(200, 170, 110, 0.08)' : 'transparent'),
              border: isDangerous ? '1px solid rgba(229, 80, 57, 0.45)' : undefined,
              marginBottom: '2px',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={mod.enabled}
              onChange={() => onToggleMod(idx)}
              style={{ cursor: 'pointer', accentColor: isDangerous ? '#e55039' : 'var(--text-gold)' }}
            />

            {isDangerous && (
              <span style={{
                fontSize: '0.62rem',
                padding: '1px 4px',
                borderRadius: '2px',
                background: '#e55039',
                color: '#ffffff',
                fontWeight: 'bold'
              }}>
                {dangerInfo?.severity === 'deadly' ? '❌ 致命' : '⚠️ 危險'}
              </span>
            )}

            {rating.tierText && !isDangerous && (
              <span style={{
                fontSize: '0.65rem',
                padding: '1px 3px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.08)',
                color: '#cbd5e1',
                fontWeight: 'bold'
              }}>
                {rating.tierText}
              </span>
            )}

            <span style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: isDangerous ? 'bold' : 'normal'
            }}>
              {mod.text}
            </span>

            {rating.ratingLabel !== 'None' && !isDangerous && (
              <span style={{
                fontSize: '0.65rem',
                padding: '1px 4px',
                borderRadius: '3px',
                background: ratingColor.bg,
                color: ratingColor.text,
                fontWeight: 'bold'
              }}>
                {rating.ratingLabel}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
};
