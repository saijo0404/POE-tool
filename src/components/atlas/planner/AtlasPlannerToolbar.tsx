import React from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Save,
  Trash2,
  UploadCloud,
  Route
} from 'lucide-react';

interface AtlasPlannerToolbarProps {
  pointsSpent: number;
  autoPathMode: boolean;
  isFullscreen: boolean;
  onToggleAutoPath: () => void;
  onResetToPreset: () => void;
  onClearAll: () => void;
  onSaveTree: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  onOpenImportExport: () => void;
}

export const AtlasPlannerToolbar: React.FC<AtlasPlannerToolbarProps> = ({
  pointsSpent,
  autoPathMode,
  isFullscreen,
  onToggleAutoPath,
  onResetToPreset,
  onClearAll,
  onSaveTree,
  onResetView,
  onToggleFullscreen,
  onOpenImportExport
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '10px 14px',
      background: '#0d121c',
      borderBottom: '1px solid rgba(200, 170, 110, 0.3)'
    }}>
      {/* Title & Points Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.92rem' }}>
          <Compass size={18} />
          <span>內建 PoE 1 輿圖天賦規劃器 (Native Atlas Planner)</span>
        </div>

        <span style={{
          fontSize: '0.8rem',
          padding: '3px 10px',
          borderRadius: '12px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.35)',
          color: '#86efac',
          fontWeight: 'bold'
        }}>
          🟢 已配置：{pointsSpent} / 132 點 (剩餘 {Math.max(0, 132 - pointsSpent)} 點)
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* Smart Pathing Toggle */}
        <button
          type="button"
          className={autoPathMode ? 'poe-button' : 'poe-button-secondary'}
          onClick={onToggleAutoPath}
          style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="切換智能最短路徑自動連線或手動自由點選"
        >
          <Route size={13} />
          <span>{autoPathMode ? '智能尋路：開啟' : '自由點選：開啟'}</span>
        </button>

        {/* Import/Export Modal Button */}
        <button
          type="button"
          className="poe-button-secondary"
          onClick={onOpenImportExport}
          style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="匯入或匯出天賦樹網址與 Base64 代碼"
        >
          <UploadCloud size={13} /> 匯入 / 匯出
        </button>

        <button
          type="button"
          className="poe-button-secondary"
          onClick={onResetToPreset}
          style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px' }}
          title="重設為當前策略預設天賦"
        >
          <RotateCw size={13} /> 預設配置
        </button>

        <button
          type="button"
          className="poe-button-secondary"
          onClick={onClearAll}
          style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px', color: '#fca5a5' }}
          title="全部清空"
        >
          <Trash2 size={13} /> 清空
        </button>

        <button
          type="button"
          className="poe-button"
          onClick={onSaveTree}
          style={{ fontSize: '0.78rem', padding: '4px 12px', height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Save size={13} /> 儲存天賦
        </button>

        <button
          type="button"
          className="poe-button-secondary"
          onClick={onResetView}
          style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px' }}
          title="重設視角"
        >
          <RotateCcw size={13} /> 重設視角
        </button>

        <button
          type="button"
          className="poe-button-secondary"
          onClick={onToggleFullscreen}
          style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px' }}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span>{isFullscreen ? '縮小' : '全螢幕'}</span>
        </button>
      </div>
    </div>
  );
};
