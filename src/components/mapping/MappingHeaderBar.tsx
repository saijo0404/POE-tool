import React, { useState } from 'react';
import { Plus, Share2, Download, Trash2, Layers } from 'lucide-react';
import type { MappingSession } from '../../domain/mapping/types';

interface MappingHeaderBarProps {
  sessions: MappingSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: (name: string, strategyName?: string) => void;
  onExportDiscord: () => void;
  onExportCsv: () => void;
  onClearRuns: () => void;
  onOpenInvestmentModal: () => void;
}

export const MappingHeaderBar: React.FC<MappingHeaderBarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onExportDiscord,
  onExportCsv,
  onClearRuns,
  onOpenInvestmentModal
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStrategy, setNewStrategy] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateSession(newName.trim(), newStrategy.trim() || undefined);
    setNewName('');
    setNewStrategy('');
    setIsCreating(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: '#121620',
        borderRadius: '8px',
        border: '1px solid rgba(200, 170, 110, 0.25)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-gold)', fontWeight: 'bold', fontSize: '0.95rem' }}>
            當前 Session:
          </span>
          <select
            value={activeSessionId}
            onChange={e => onSelectSession(e.target.value)}
            className="poe-input"
            style={{ padding: '6px 12px', minWidth: '220px', borderRadius: '4px' }}
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.runs.length} 場)
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="poe-button-secondary"
          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
        >
          <Plus size={14} /> 新增 Session
        </button>

        <button
          type="button"
          onClick={onOpenInvestmentModal}
          className="poe-button-secondary"
          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
        >
          <Layers size={14} /> 門票成本設定
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onExportDiscord}
          className="poe-button"
          style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          title="複製格式化 Discord 刷圖戰報"
        >
          <Share2 size={14} /> 複製 Discord 戰報
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          className="poe-button-secondary"
          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
          title="匯出 CSV 報表"
        >
          <Download size={14} /> 匯出 CSV
        </button>

        <button
          type="button"
          onClick={onClearRuns}
          className="poe-button-secondary"
          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#e06c75' }}
          title="清除此 Session 紀錄"
        >
          <Trash2 size={14} /> 清除紀錄
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          style={{
            width: '100%',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            paddingTop: '12px',
            marginTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <input
            type="text"
            placeholder="Session 名稱 (如: 8-Mod Dunes 刷圖)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="poe-input"
            style={{ flex: 1, padding: '6px 10px' }}
            autoFocus
          />
          <input
            type="text"
            placeholder="策略名稱 (選填，如: 軍團拓荒)"
            value={newStrategy}
            onChange={e => setNewStrategy(e.target.value)}
            className="poe-input"
            style={{ flex: 1, padding: '6px 10px' }}
          />
          <button type="submit" className="poe-button" style={{ padding: '6px 16px' }}>
            建立
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="poe-button-secondary"
            style={{ padding: '6px 12px' }}
          >
            取消
          </button>
        </form>
      )}
    </div>
  );
};
