import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AtlasCanvasControlsProps {
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onManualReset: () => void;
}

export const AtlasCanvasControls: React.FC<AtlasCanvasControlsProps> = ({
  zoom,
  onZoomChange,
  onManualReset
}) => {
  return (
    <>
      {/* Floating Shortcut Hint Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '12px',
          background: 'rgba(10, 15, 26, 0.75)',
          border: '1px solid rgba(200, 170, 110, 0.2)',
          borderRadius: '6px',
          padding: '3px 8px',
          fontSize: '0.68rem',
          color: 'var(--text-dim)',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none'
        }}
      >
        💡 空白鍵：重設視角 | Ctrl+Z：復原 | 雙擊節點：聚焦 | 滾輪：縮放
      </div>

      {/* Floating Canvas Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          background: 'rgba(10, 15, 26, 0.75)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          padding: '6px',
          borderRadius: '6px',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
        }}
      >
        <button
          type="button"
          className="poe-button-secondary"
          onClick={() => onZoomChange(Math.min(zoom + 0.08, 2.5))}
          style={{
            padding: '4px',
            height: '26px',
            width: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="放大 (+)"
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          className="poe-button-secondary"
          onClick={() => onZoomChange(Math.max(zoom - 0.08, 0.15))}
          style={{
            padding: '4px',
            height: '26px',
            width: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="縮小 (-)"
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          className="poe-button-secondary"
          onClick={onManualReset}
          style={{
            padding: '4px',
            height: '26px',
            width: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="視角重設至置中 (空白鍵 / R)"
        >
          <RotateCcw size={13} />
        </button>
        <div
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-dim)',
            textAlign: 'center',
            marginTop: '2px',
            fontWeight: 'bold'
          }}
        >
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </>
  );
};
