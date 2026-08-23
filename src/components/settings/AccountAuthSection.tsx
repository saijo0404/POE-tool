import React from 'react';
import { User, ShieldCheck, LogOut, RefreshCw, AlertCircle, Check } from 'lucide-react';
import type { AppSettings, CharacterInfo } from '../../domain/settings/types';

interface AccountAuthSectionProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  characters: CharacterInfo[];
  loggingIn: boolean;
  loginError: string | null;
  testingConn: boolean;
  testResult: { success: boolean; message: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  onTestConnection: () => void;
}

export const AccountAuthSection: React.FC<AccountAuthSectionProps> = ({
  settings,
  setSettings,
  characters,
  loggingIn,
  loginError,
  testingConn,
  testResult,
  onLogin,
  onLogout,
  onTestConnection
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <User size={16} /> 帳號認證與官方連線 (Account Authentication)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            官方 POESESSID Cookie
          </label>
          <input
            type="password"
            className="poe-input"
            value={settings.poesessid}
            onChange={e => setSettings(prev => ({ ...prev, poesessid: e.target.value }))}
            placeholder="請貼上 POESESSID..."
            style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            官方帳號名稱 (Account Name)
          </label>
          <input
            type="text"
            className="poe-input"
            value={settings.accountName}
            onChange={e => setSettings(prev => ({ ...prev, accountName: e.target.value }))}
            placeholder="例如: Exile#1234"
            style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
        <button
          type="button"
          className="poe-button"
          disabled={loggingIn}
          onClick={onLogin}
          style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {loggingIn ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={14} />}
          {loggingIn ? '登入中...' : '一鍵登入官方帳號'}
        </button>

        <button
          type="button"
          className="poe-button-secondary"
          disabled={testingConn}
          onClick={onTestConnection}
          style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {testingConn ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
          測試官方連線
        </button>

        {settings.accountName && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={onLogout}
            style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}
          >
            <LogOut size={14} /> 登出
          </button>
        )}
      </div>

      {loginError && (
        <div style={{ padding: '8px 12px', borderRadius: '4px', fontSize: '0.82rem', marginBottom: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
          <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
          {loginError}
        </div>
      )}

      {testResult && (
        <div style={{ padding: '8px 12px', borderRadius: '4px', fontSize: '0.82rem', marginBottom: '10px', background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${testResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, color: testResult.success ? '#4ade80' : '#fca5a5' }}>
          {testResult.success ? <Check size={14} style={{ display: 'inline', marginRight: '6px' }} /> : <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />}
          {testResult.message}
        </div>
      )}

      {characters.length > 0 && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          已偵測到角色：{characters.map(c => `${c.name} (Lv.${c.level} ${c.league})`).join('、')}
        </div>
      )}
    </div>
  );
};
