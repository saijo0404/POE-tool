import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Camera, Loader2, Compass } from 'lucide-react';
import type { MappingTimerState } from '../../domain/mapping/types';
import type { WealthSnapshot } from '../../types/poe';
import { formatDuration } from '../../domain/mapping/mappingExport';

interface MappingTimerCardProps {
  timerState: MappingTimerState;
  snapshotting: boolean;
  snapshotA: WealthSnapshot | null;
  strategyName?: string;
  onStartMap: () => void;
  onPauseMap: () => void;
  onResumeMap: () => void;
  onResetTimer: () => void;
  onTakeSnapshotA: () => void;
  onFinishAndSettle: () => void;
}

export const MappingTimerCard: React.FC<MappingTimerCardProps> = ({
  timerState,
  snapshotting,
  snapshotA,
  strategyName,
  onStartMap,
  onPauseMap,
  onResumeMap,
  onResetTimer,
  onTakeSnapshotA,
  onFinishAndSettle
}) => {
  const isRunning = timerState.status === 'running';
  const isPaused = timerState.status === 'paused';

  const getStatusBadge = () => {
    switch (timerState.status) {
      case 'running':
        return <span style={{ color: '#98c379', display: 'flex', alignItems: 'center', gap: '6px' }}>🟢 正在圖中 (In Map)</span>;
      case 'paused':
        return <span style={{ color: '#e5c07b', display: 'flex', alignItems: 'center', gap: '6px' }}>🟡 暫停中 (Paused)</span>;
      case 'completed':
        return <span style={{ color: '#61afef', display: 'flex', alignItems: 'center', gap: '6px' }}>🔵 剛完成結算 (Settled)</span>;
      default:
        return <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>⚪ 準備就緒 / 藏身處 (Idle)</span>;
    }
  };

  return (
    <div
      className="poe-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        backgroundColor: '#121620',
        border: isRunning ? '1px solid rgba(243, 209, 121, 0.6)' : '1px solid rgba(200, 170, 110, 0.25)',
        boxShadow: isRunning ? '0 0 16px rgba(243, 209, 121, 0.15)' : 'none',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--text-gold)" />
          <span style={{ fontWeight: 'bold', color: 'var(--text-gold)', fontSize: '0.95rem' }}>
            {strategyName ? `策略：${strategyName}` : '自訂刷圖計時器'}
          </span>
        </div>
        <div style={{ fontSize: '0.85rem' }}>{getStatusBadge()}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          第 {timerState.currentRunNumber} 場 · 當前單場耗時
        </span>
        <div
          className="poe-font"
          style={{
            fontSize: '3.4rem',
            fontWeight: 'bold',
            letterSpacing: '3px',
            color: isRunning ? '#fff' : isPaused ? '#e5c07b' : 'var(--text-gold)',
            textShadow: isRunning ? '0 0 12px rgba(255, 255, 255, 0.4)' : 'none'
          }}
        >
          {formatDuration(timerState.elapsedSeconds)}
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {!isRunning && !isPaused && (
          <button
            type="button"
            onClick={onStartMap}
            disabled={snapshotting}
            className="poe-button"
            style={{ padding: '10px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px' }}
          >
            {snapshotting ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
            開始進圖 (Start Map)
          </button>
        )}

        {isRunning && (
          <>
            <button
              type="button"
              onClick={onFinishAndSettle}
              disabled={snapshotting}
              className="poe-button"
              style={{
                padding: '10px 24px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '6px',
                background: 'linear-gradient(180deg, #98c379 0%, #5c873f 100%)',
                color: '#0d121c',
                fontWeight: 'bold'
              }}
            >
              {snapshotting ? <Loader2 size={18} className="spin" /> : <CheckCircle2 size={18} />}
              出圖放貨並結算 (Settle Run)
            </button>

            <button
              type="button"
              onClick={onPauseMap}
              className="poe-button-secondary"
              style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
            >
              <Pause size={16} /> 暫停
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              type="button"
              onClick={onResumeMap}
              className="poe-button"
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
            >
              <Play size={16} /> 繼續計時
            </button>

            <button
              type="button"
              onClick={onFinishAndSettle}
              disabled={snapshotting}
              className="poe-button-secondary"
              style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', color: '#98c379' }}
            >
              <CheckCircle2 size={16} /> 出圖結算
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onTakeSnapshotA}
          disabled={snapshotting}
          className="poe-button-secondary"
          style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
          title="手動抓取進圖前 Dump Tab 快照 A"
        >
          {snapshotting ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
          {snapshotA ? '重新記錄快照 A' : '記錄進圖快照 A'}
        </button>

        {(isRunning || isPaused || timerState.elapsedSeconds > 0) && (
          <button
            type="button"
            onClick={onResetTimer}
            className="poe-button-secondary"
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
            title="重設單場碼錶"
          >
            <RotateCcw size={16} /> 重設碼錶
          </button>
        )}
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {snapshotA ? (
          <span style={{ color: '#98c379' }}>
            ✓ 快照 A 就緒（{new Date(snapshotA.timestamp).toLocaleTimeString()}）· 出圖放貨至 Dump Tab 後點擊結算即會自動比對物品增量
          </span>
        ) : (
          <span>💡 提示：點擊「開始進圖」時將自動記錄進圖前快照，出圖後點擊「出圖放貨並結算」即可全自動結算單場獲利！</span>
        )}
      </div>
    </div>
  );
};
