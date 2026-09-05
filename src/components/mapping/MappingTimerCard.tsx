import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Camera, Loader2, Compass } from 'lucide-react';
import type { MappingTimerState } from '../../domain/mapping/types';
import type { WealthSnapshot } from '../../types/poe';
import { formatDuration } from '../../domain/mapping/mappingExport';
import { Card, Button } from '../ui';

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
    <Card
      variant={isRunning ? 'elevated' : 'default'}
      padding="lg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        backgroundColor: '#121620',
        border: isRunning ? '1px solid rgba(243, 209, 121, 0.6)' : '1px solid rgba(200, 170, 110, 0.25)',
        boxShadow: isRunning ? '0 0 16px rgba(243, 209, 121, 0.15)' : 'none',
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
          <Button
            variant="primary"
            size="lg"
            onClick={onStartMap}
            disabled={snapshotting}
            icon={snapshotting ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
          >
            開始進圖 (Start Map)
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={onFinishAndSettle}
              disabled={snapshotting}
              icon={snapshotting ? <Loader2 size={18} className="spin" /> : <CheckCircle2 size={18} />}
              style={{
                background: 'linear-gradient(180deg, #98c379 0%, #5c873f 100%)',
                color: '#0d121c',
                fontWeight: 'bold'
              }}
            >
              出圖放貨並結算 (Settle Run)
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onPauseMap}
              icon={<Pause size={16} />}
            >
              暫停
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={onResumeMap}
              icon={<Play size={16} />}
            >
              繼續計時
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onFinishAndSettle}
              disabled={snapshotting}
              icon={<CheckCircle2 size={16} />}
              style={{ color: '#98c379' }}
            >
              出圖結算
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          size="lg"
          onClick={onTakeSnapshotA}
          disabled={snapshotting}
          icon={snapshotting ? <Loader2 size={16} className="spin" /> : <Camera size={16} />}
          title="手動抓取進圖前 Dump Tab 快照 A"
        >
          {snapshotA ? '重新記錄快照 A' : '記錄進圖快照 A'}
        </Button>

        {(isRunning || isPaused || timerState.elapsedSeconds > 0) && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onResetTimer}
            icon={<RotateCcw size={16} />}
            title="重設單場碼錶"
          >
            重設碼錶
          </Button>
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
    </Card>
  );
};
