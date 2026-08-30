import {
  Compass,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Save,
  Trash2,
  UploadCloud,
  Route,
  RefreshCw,
  Undo2,
  Redo2
} from 'lucide-react';
import { MAX_ATLAS_POINTS } from '../../../domain/atlas/constants';

interface AtlasPlannerToolbarProps {
  pointsSpent: number;
  autoPathMode: boolean;
  isFullscreen: boolean;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onToggleAutoPath: () => void;
  onResetToPreset: () => void;
  onClearAll: () => void;
  onSaveTree: () => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
  onOpenImportExport: () => void;
  onSyncTree?: () => void;
}

export const AtlasPlannerToolbar: React.FC<AtlasPlannerToolbarProps> = ({
  pointsSpent,
  autoPathMode,
  isFullscreen,
  isSyncing = false,
  lastSyncTime,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onToggleAutoPath,
  onResetToPreset,
  onClearAll,
  onSaveTree,
  onResetView,
  onToggleFullscreen,
  onOpenImportExport,
  onSyncTree
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
      {/* Title, Points Counter & League Version */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.92rem' }}>
          <Compass size={18} />
          <span>內建 PoE 1 輿圖天賦規劃器 (Native Atlas Planner)</span>
        </div>

        <span style={{
          fontSize: '0.8rem',
          padding: '3px 10px',
          borderRadius: '12px',
          background: pointsSpent >= MAX_ATLAS_POINTS ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          border: pointsSpent >= MAX_ATLAS_POINTS ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(34, 197, 94, 0.35)',
          color: pointsSpent >= MAX_ATLAS_POINTS ? '#fca5a5' : '#86efac',
          fontWeight: 'bold'
        }}>
          {pointsSpent >= MAX_ATLAS_POINTS ? '🔴' : '🟢'} 已配置：{pointsSpent} / {MAX_ATLAS_POINTS} 點 (剩餘 {Math.max(0, MAX_ATLAS_POINTS - pointsSpent)} 點)
        </span>

        <span style={{
          fontSize: '0.74rem',
          padding: '2px 8px',
          borderRadius: '10px',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#7dd3fc',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }} title={lastSyncTime ? `上次同步時間：${new Date(lastSyncTime).toLocaleString('zh-TW')}` : '官方 1:1 基準資料庫'}>
          <span>✨ 官方 1:1 拓撲</span>
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* League Auto-Sync Button */}
        {onSyncTree && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={onSyncTree}
            disabled={isSyncing}
            style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px', display: 'flex', alignItems: 'center', gap: '4px', color: '#7dd3fc' }}
            title="自 GGG 官方即時同步最新聯盟天賦資料"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? '同步中...' : '同步最新聯盟'}</span>
          </button>
        )}

        {/* Undo and Redo Buttons */}
        {onUndo && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              fontSize: '0.78rem',
              padding: '4px 8px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: canUndo ? 1 : 0.45,
              cursor: canUndo ? 'pointer' : 'not-allowed'
            }}
            title="復原上一步 (Ctrl+Z)"
          >
            <Undo2 size={13} />
            <span>復原</span>
          </button>
        )}

        {onRedo && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              fontSize: '0.78rem',
              padding: '4px 8px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: canRedo ? 1 : 0.45,
              cursor: canRedo ? 'pointer' : 'not-allowed'
            }}
            title="重做下一步 (Ctrl+Y)"
          >
            <Redo2 size={13} />
            <span>重做</span>
          </button>
        )}

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
          title="還原為當前分級已儲存的天賦配置"
        >
          <RotateCw size={13} /> 還原已儲存
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
