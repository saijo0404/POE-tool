import React, { useState, useMemo } from 'react';
import type { TradeWhisper, TradeWhisperAction } from '../../domain/tradeWhisper/types';
import {
  getDefaultWhisperTemplates,
  interpolateWhisperTemplate,
  type WhisperTemplate
} from '../../domain/tradeWhisper/whisperTemplates';
import { TradeWhisperStashGrid } from './TradeWhisperStashGrid';
import {
  UserPlus,
  Clock,
  ArrowRightLeft,
  UserCheck,
  Home,
  X,
  Copy,
  Check,
  Grid,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TradeWhisperCardProps {
  whisper: TradeWhisper;
  onAction: (whisper: TradeWhisper, action: TradeWhisperAction) => void;
  onDismiss: (id: string) => void;
  templates?: WhisperTemplate[];
  onSendTemplate?: (whisper: TradeWhisper, template: WhisperTemplate) => void;
}

function getStatusBadge(status: TradeWhisper['status']): { label: string; color: string } | null {
  switch (status) {
    case 'invited': return { label: '已邀請組隊', color: '#2ecc71' };
    case 'waited': return { label: '已通知稍候', color: '#3498db' };
    case 'traded': return { label: '已發起交易', color: '#f1c40f' };
    case 'completed': return { label: '已致謝並踢除', color: '#95a5a6' };
    case 'dismissed': return { label: '已忽略/已售出', color: '#e74c3c' };
    default: return null;
  }
}

export const TradeWhisperCard: React.FC<TradeWhisperCardProps> = ({
  whisper,
  onAction,
  onDismiss,
  templates,
  onSendTemplate
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(!!whisper.position);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const statusBadge = getStatusBadge(whisper.status);

  const availableTemplates = useMemo(() => {
    return templates && templates.length > 0 ? templates : getDefaultWhisperTemplates();
  }, [templates]);

  const handleCopySender = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(whisper.sender);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSelectTemplate = (tpl: WhisperTemplate) => {
    if (onSendTemplate) {
      onSendTemplate(whisper, tpl);
    } else {
      onAction(whisper, 'wait');
    }
    setShowTemplates(false);
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(26, 32, 44, 0.95) 0%, rgba(15, 20, 28, 0.95) 100%)',
      border: '1px solid rgba(200, 170, 110, 0.5)',
      borderRadius: '8px',
      padding: '10px 12px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(200, 170, 110, 0.2)',
      color: '#e2e8f0',
      fontSize: '0.82rem',
      marginBottom: '8px',
      boxSizing: 'border-box'
    }}>
      {/* Header bar: Buyer name, status, close button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 'bold', color: 'var(--text-gold)', fontSize: '0.88rem' }}>
            {whisper.guildTag && <span style={{ color: '#8c94a4', fontWeight: 'normal' }}>&lt;{whisper.guildTag}&gt; </span>}
            {whisper.sender}
          </span>
          <button
            type="button"
            onClick={handleCopySender}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#8c94a4' }}
            title="複製買家角色名稱"
          >
            {copied ? <Check size={13} color="#2ecc71" /> : <Copy size={13} />}
          </button>
          {statusBadge && (
            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: `${statusBadge.color}22`, color: statusBadge.color, border: `1px solid ${statusBadge.color}55` }}>
              {statusBadge.label}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(whisper.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#8c94a4' }}
          title="關閉此密語卡片"
        >
          <X size={14} />
        </button>
      </div>

      {/* Item info row */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#f3d179', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '68%' }}>
          {whisper.itemName}
        </span>
        <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '0.84rem' }}>
          {whisper.price}
        </span>
      </div>

      {/* 5 Quick Action Buttons Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '6px' }}>
        <button
          type="button"
          onClick={() => onAction(whisper, 'invite')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', borderRadius: '4px', background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', color: '#2ecc71', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold' }}
          title="發送 /invite 邀請組隊"
        >
          <UserPlus size={14} />
          <span>組隊</span>
        </button>

        <button
          type="button"
          onClick={() => onAction(whisper, 'wait')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', borderRadius: '4px', background: 'rgba(52, 152, 219, 0.15)', border: '1px solid #3498db', color: '#3498db', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold' }}
          title="回覆密語：正在刷圖中，請稍候 1 分鐘！"
        >
          <Clock size={14} />
          <span>稍候</span>
        </button>

        <button
          type="button"
          onClick={() => onAction(whisper, 'trade')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', borderRadius: '4px', background: 'rgba(241, 196, 15, 0.15)', border: '1px solid #f1c40f', color: '#f1c40f', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold' }}
          title="發送 /tradewith 發起交易"
        >
          <ArrowRightLeft size={14} />
          <span>交易</span>
        </button>

        <button
          type="button"
          onClick={() => onAction(whisper, 'thanksAndKick')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', borderRadius: '4px', background: 'rgba(236, 240, 241, 0.15)', border: '1px solid #bdc3c7', color: '#ecf0f1', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold' }}
          title="發送 @ty gl! 並發送 /kick 移出隊伍"
        >
          <UserCheck size={14} />
          <span>謝踢</span>
        </button>

        <button
          type="button"
          onClick={() => onAction(whisper, 'hideout')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', borderRadius: '4px', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 'bold' }}
          title="發送 /hideout 回藏身處"
        >
          <Home size={14} />
          <span>藏身處</span>
        </button>
      </div>

      {/* Template selector toggle & stash grid toggle bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#f3d179', cursor: 'pointer', fontSize: '0.72rem', padding: 0 }}
        >
          <MessageSquareQuote size={12} />
          <span>⚡ 情境回覆範本</span>
          {showTemplates ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {whisper.position && (
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#8c94a4', cursor: 'pointer', fontSize: '0.72rem', padding: 0 }}
          >
            <Grid size={12} />
            <span>{showGrid ? '收合倉庫格位指示' : `查看倉庫格位 (${whisper.stashTab || '分頁'} 左${whisper.position.left}, 上${whisper.position.top})`}</span>
          </button>
        )}
      </div>

      {/* Expandable Whisper Template Quick Selector */}
      {showTemplates && (
        <div style={{
          marginTop: '6px',
          padding: '6px',
          background: 'rgba(10, 14, 20, 0.85)',
          borderRadius: '4px',
          border: '1px solid rgba(200, 170, 110, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          {availableTemplates.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tpl)}
              style={{
                background: 'rgba(200, 170, 110, 0.12)',
                border: '1px solid rgba(200, 170, 110, 0.35)',
                borderRadius: '3px',
                padding: '3px 8px',
                color: '#f5deb3',
                cursor: 'pointer',
                fontSize: '0.72rem',
                textAlign: 'left'
              }}
              title={interpolateWhisperTemplate(tpl.message, {
                buyer: whisper.sender,
                item: whisper.itemName,
                price: whisper.price,
                stashTab: whisper.stashTab
              })}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      )}

      {/* Optional Stash Grid Indicator */}
      {whisper.position && showGrid && (
        <div style={{ marginTop: '6px' }}>
          <TradeWhisperStashGrid
            position={whisper.position}
            stashTab={whisper.stashTab}
            itemName={whisper.itemName}
          />
        </div>
      )}
    </div>
  );
};
