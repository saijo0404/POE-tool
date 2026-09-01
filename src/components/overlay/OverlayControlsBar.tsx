import React, { useState } from 'react';
import { Sliders, MousePointer } from 'lucide-react';

interface OverlayControlsBarProps {
  opacity: number;
  scale: number;
  clickThrough: boolean;
  onChangeOpacity: (val: number) => void;
  onChangeScale: (val: number) => void;
  onToggleClickThrough: () => void;
}

export const OverlayControlsBar: React.FC<OverlayControlsBarProps> = ({
  opacity,
  scale,
  clickThrough,
  onChangeOpacity,
  onChangeScale,
  onToggleClickThrough
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div style={{
      padding: '4px 10px',
      background: 'rgba(10, 13, 18, 0.95)',
      borderTop: '1px solid rgba(200, 170, 110, 0.2)',
      fontSize: '0.7rem',
      color: '#718096',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>提示：按 Esc 或點擊遊戲畫面關閉</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onToggleClickThrough}
            title={clickThrough ? '已啟用滑鼠穿透 (無視滑鼠點擊)' : '啟用滑鼠穿透'}
            style={{
              background: clickThrough ? 'rgba(237, 137, 54, 0.25)' : 'transparent',
              border: `1px solid ${clickThrough ? '#ed8936' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '3px',
              color: clickThrough ? '#fbd38d' : '#a0aec0',
              padding: '2px 4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <MousePointer size={11} />
            <span>穿透</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            title="調整懸浮卡片不透明度與大小"
            style={{
              background: 'transparent',
              border: 'none',
              color: showSettings ? 'var(--text-gold)' : '#a0aec0',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex'
            }}
          >
            <Sliders size={12} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '4px',
          borderTop: '1px dashed rgba(255,255,255,0.1)'
        }}>
          {/* Opacity slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span>透明度</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--text-gold)', height: '4px' }}
            />
            <span>{Math.round(opacity * 100)}%</span>
          </div>

          {/* Scale slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span>縮放</span>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={scale}
              onChange={(e) => onChangeScale(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--text-gold)', height: '4px' }}
            />
            <span>{Math.round(scale * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
