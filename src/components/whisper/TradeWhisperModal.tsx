import React from 'react';
import { X, MessageSquare, History } from 'lucide-react';
import { useTradeWhisper } from '../../hooks/useTradeWhisper';
import { TradeWhisperCard } from './TradeWhisperCard';
import { TradeWhisperTester } from './TradeWhisperTester';

interface TradeWhisperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const TradeWhisperModal: React.FC<TradeWhisperModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const {
    whispers,
    history,
    config,
    handleNewWhisper,
    handleAction,
    dismissWhisper,
    updateConfig
  } = useTradeWhisper();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="poe-card"
        style={{
          width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
          background: '#16161a', border: '1px solid var(--border-gold)', borderRadius: '8px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.9)', padding: '20px', position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px', marginBottom: '14px' }}>
          <h2 className="poe-font" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} /> 交易密語懸浮助理與快捷操作 (Trade Whisper Assistant)
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Active Incoming Whispers Section */}
        {whispers.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.82rem', color: '#2ecc71', fontWeight: 'bold', marginBottom: '8px' }}>
              ⚡ 目前待處理密語 ({whispers.length})：
            </div>
            {whispers.map(w => (
              <TradeWhisperCard
                key={w.id}
                whisper={w}
                onAction={(wh, act) => {
                  handleAction(wh, act);
                  onShowToast?.(`已執行：${act}`);
                }}
                onDismiss={dismissWhisper}
              />
            ))}
          </div>
        )}

        {/* Tester & Configuration Card */}
        <TradeWhisperTester
          onSimulate={(text) => {
            handleNewWhisper(text);
            onShowToast?.('🎮 已觸發買家密語模擬！');
          }}
          config={config}
          onUpdateConfig={updateConfig}
        />

        {/* Recent Whisper History */}
        {history.length > 0 && (
          <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#8c94a4', marginBottom: '8px' }}>
              <History size={14} />
              <span>近期密語紀錄 (最新 {history.length} 筆)：</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
              {history.slice(0, 5).map(h => (
                <div key={h.id} style={{ fontSize: '0.75rem', background: '#0d121c', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#c8aa6e' }}>{h.sender} ({h.itemName})</span>
                  <span style={{ color: '#2ecc71' }}>{h.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
