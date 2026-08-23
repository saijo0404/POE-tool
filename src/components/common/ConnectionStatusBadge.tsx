import React from 'react';
import { RefreshCw, Pin, PinOff } from 'lucide-react';
import { isTauri } from '../../utils/tauri';

interface ConnectionStatusBadgeProps {
  displayLeague: string;
  accountName?: string;
  divineRate: number;
  divIcon: string;
  isRateRefreshing: boolean;
  onManualRefreshRate: (e: React.MouseEvent) => void;
  alwaysOnTop: boolean;
  onTogglePin: () => void;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
  displayLeague,
  accountName,
  divineRate,
  divIcon,
  isRateRefreshing,
  onManualRefreshRate,
  alwaysOnTop,
  onTogglePin
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ background: 'rgba(200, 170, 110, 0.12)', border: '1px solid rgba(200, 170, 110, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-gold)' }}>
          聯盟: <strong>{displayLeague}</strong>
        </span>
        {accountName ? (
          <span style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: '#4ade80', fontWeight: 500 }}>
            ● {accountName}
          </span>
        ) : (
          <span style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: '#f87171' }}>
            ○ 尚未綁定帳號
          </span>
        )}
      </div>

      <div
        onClick={onManualRefreshRate}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(243, 209, 121, 0.25)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: '#facc15', cursor: 'pointer' }}
        title="點擊從 poe.ninja 更新即時神聖石匯率"
      >
        <img src={divIcon} alt="Divine Orb" style={{ width: '16px', height: '16px' }} />
        <span>1 div = <strong>{divineRate} Chaos</strong></span>
        <RefreshCw size={12} className={isRateRefreshing ? 'spin' : ''} style={{ color: 'var(--text-gold)', marginLeft: '2px' }} />
      </div>

      {isTauri() && (
        <button
          type="button"
          onClick={onTogglePin}
          className={alwaysOnTop ? 'poe-button' : 'poe-button-secondary'}
          style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
          title={alwaysOnTop ? '取消視窗置頂' : '設定視窗最上層顯示 (置頂)'}
        >
          {alwaysOnTop ? <PinOff size={14} /> : <Pin size={14} />}
          <span>{alwaysOnTop ? '已置頂' : '置頂'}</span>
        </button>
      )}
    </div>
  );
};
