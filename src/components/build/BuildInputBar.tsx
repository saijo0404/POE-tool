import React from 'react';
import { Calculator, RefreshCw, History, Trash2, X } from 'lucide-react';
import type { BuildHistoryEntry } from '../../domain/build/types';

interface BuildInputBarProps {
  buildInput: string;
  setBuildInput: (val: string) => void;
  loading: boolean;
  onLoadBuild: () => void;
  history: BuildHistoryEntry[];
  onSelectHistory: (url: string) => void;
  onDeleteHistory: (idx: number) => void;
  onClearHistory: () => void;
}

export const BuildInputBar: React.FC<BuildInputBarProps> = ({
  buildInput,
  setBuildInput,
  loading,
  onLoadBuild,
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
}) => {
  const [showHistory, setShowHistory] = React.useState(false);

  return (
    <div className="poe-card" style={{ marginBottom: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <input
            type="text"
            className="poe-input"
            value={buildInput}
            onChange={e => setBuildInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && onLoadBuild()}
            placeholder="請輸入 pobb.in 連結、PoB 代碼或 poe.ninja / GGG 角色網址..."
            style={{ width: '100%', padding: '10px 36px 10px 14px', fontSize: '0.9rem' }}
          />
          {buildInput && (
            <X
              size={16}
              onClick={() => setBuildInput('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
            />
          )}
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={() => setShowHistory(prev => !prev)}
            style={{ padding: '9px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={16} /> 歷史 ({history.length})
          </button>
        )}

        <button
          type="button"
          className="poe-button"
          disabled={loading || !buildInput.trim()}
          onClick={onLoadBuild}
          style={{ padding: '9px 22px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {loading ? <RefreshCw size={16} className="spin" /> : <Calculator size={16} />}
          {loading ? '正在計算造價...' : '計算成本'}
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div
          style={{
            position: 'absolute', top: '100%', right: '16px', zIndex: 100, width: '380px',
            background: '#121214', border: '1px solid var(--border-gold)', borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)', padding: '10px', marginTop: '6px', maxHeight: '360px', overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>最近計算過的流派</span>
            <button onClick={onClearHistory} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={12} /> 清空
            </button>
          </div>
          {history.map((h, i) => (
            <div
              key={i}
              onClick={() => { onSelectHistory(h.url); setShowHistory(false); }}
              style={{ padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', background: 'rgba(255,255,255,0.03)' }}
            >
              <div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-bright)', fontWeight: 500 }}>{h.character || '未命名角色'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.league} · {h.totalDivine} div ({h.totalChaos} c)</div>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onDeleteHistory(i); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
