import React from 'react';
import type { ParsedItemMod } from '../../types/poe';
import { calculateRollRating } from '../../domain/overlay/rollRating';

interface OverlayModListProps {
  mods: ParsedItemMod[];
  onToggleMod: (idx: number) => void;
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
  onToggleMod
}) => {
  if (mods.length === 0) {
    return null;
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
              color: mod.enabled ? '#e2e8f0' : '#64748b',
              background: mod.enabled ? 'rgba(200, 170, 110, 0.08)' : 'transparent',
              marginBottom: '2px',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={mod.enabled}
              onChange={() => onToggleMod(idx)}
              style={{ cursor: 'pointer', accentColor: 'var(--text-gold)' }}
            />

            {rating.tierText && (
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

            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {mod.text}
            </span>

            {rating.ratingLabel !== 'None' && (
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
