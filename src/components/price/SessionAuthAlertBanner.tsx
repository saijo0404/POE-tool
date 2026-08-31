import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface SessionAuthAlertBannerProps {
  errorMessage?: string | null;
  onDismiss?: () => void;
  onReauthorized?: () => void;
}

export const SessionAuthAlertBanner: React.FC<SessionAuthAlertBannerProps> = ({
  errorMessage,
  onDismiss,
  onReauthorized
}) => {
  const { login } = useSettings();
  const [authorizing, setAuthorizing] = useState<boolean>(false);

  const isCloudflare = errorMessage?.includes('Cloudflare')
    || errorMessage?.includes('CLOUDFLARE_CHALLENGE')
    || errorMessage?.includes('Turnstile');

  const title = isCloudflare
    ? '遭遇 Cloudflare WAF / Turnstile 安全驗證 (403)'
    : '官方 POESESSID 憑證已過期或失效 (403)';

  const description = isCloudflare
    ? '官方市集啟用了安全人機驗證。請點擊下方按鈕開啟官方登入視窗完成驗證，系統將自動擷取最新憑證。'
    : '官方市集查詢需要有效的登入憑證。請點擊下方按鈕一鍵重新授權，無需手動複製 Cookie。';

  const handleReauth = async () => {
    setAuthorizing(true);
    try {
      const res = await login();
      if (res.success) {
        onReauthorized?.();
      }
    } catch {
      // Handled inside settings context
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <div
      className="poe-card"
      style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(200, 170, 110, 0.12) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: isCloudflare ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${isCloudflare ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isCloudflare ? (
              <AlertTriangle size={20} color="#f59e0b" />
            ) : (
              <ShieldAlert size={20} color="#ef4444" />
            )}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: isCloudflare ? '#fcd34d' : '#fca5a5', fontWeight: 600 }}>
              {title}
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {description}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="關閉提示"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
        <button
          type="button"
          className="poe-button"
          disabled={authorizing}
          onClick={handleReauth}
          style={{
            padding: '8px 18px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
            borderColor: '#f59e0b',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.4)'
          }}
        >
          {authorizing ? <RefreshCw size={15} className="spin" /> : <ShieldCheck size={15} />}
          {authorizing ? '喚起官方登入中...' : '一鍵重新授權登入'}
        </button>

        {errorMessage && (
          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
            原始錯誤：{errorMessage.length > 80 ? `${errorMessage.slice(0, 80)}...` : errorMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default SessionAuthAlertBanner;
