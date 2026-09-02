import React from 'react';
import type { StashPosition } from '../../domain/tradeWhisper/types';
import { calculateStashCellPercentage, isQuadTabByCoordinates } from '../../domain/tradeWhisper/stashGrid';
import { MapPin } from 'lucide-react';

interface TradeWhisperStashGridProps {
  position?: StashPosition;
  stashTab?: string;
  itemName?: string;
}

export const TradeWhisperStashGrid: React.FC<TradeWhisperStashGridProps> = ({
  position,
  stashTab,
  itemName
}) => {
  if (!position) return null;

  const isQuad = isQuadTabByCoordinates(position);
  const gridSize = isQuad ? 24 : 12;
  const cell = calculateStashCellPercentage(position, gridSize);

  return (
    <div style={{
      marginTop: '8px',
      padding: '8px',
      borderRadius: '6px',
      background: 'rgba(10, 14, 20, 0.85)',
      border: '1px solid rgba(200, 170, 110, 0.3)',
      boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.7)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: '#c8aa6e',
        marginBottom: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="#f1c40f" />
          <span>分頁：<strong>{stashTab || '預設'}</strong></span>
        </div>
        <div>
          <span>座標：左 {position.left}，上 {position.top} {isQuad ? '(四倍分頁)' : '(一般分頁)'}</span>
        </div>
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        maxHeight: '140px',
        margin: '0 auto',
        background: '#0d121c',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '4px',
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`
      }}>
        {/* Highlight target cell */}
        <div style={{
          position: 'absolute',
          left: `${cell.leftPercent}%`,
          top: `${cell.topPercent}%`,
          width: `${cell.widthPercent}%`,
          height: `${cell.heightPercent}%`,
          backgroundColor: 'rgba(241, 196, 15, 0.45)',
          border: '2px solid #f1c40f',
          borderRadius: '2px',
          boxShadow: '0 0 8px rgba(241, 196, 15, 0.8)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          animation: 'pulse 1.5s infinite'
        }} />
      </div>

      {itemName && (
        <div style={{
          marginTop: '4px',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#8c94a4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          目標物：{itemName}
        </div>
      )}
    </div>
  );
};
