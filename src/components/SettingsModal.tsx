import React from 'react';
import { Settings as SettingsIcon, X, Check, RefreshCw } from 'lucide-react';
import { useSettingsModal } from '../hooks/useSettingsModal';
import { GeneralSettingsSection } from './settings/GeneralSettingsSection';
import { OverlaySettingsSection } from './settings/OverlaySettingsSection';
import { AccountAuthSection } from './settings/AccountAuthSection';
import { StashTabSelector } from './settings/StashTabSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onSettingsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onSettingsUpdated
}) => {
  const {
    settings, setSettings,
    availableTabs, characters, sessionHealth,
    saving, loggingIn, loginError, testingConn, testResult,
    handleLogin, handleLogout, handleTestConnection, handleFetchStashTabs,
    handleSaveSettings, handleSelectAllTabs, handleClearAllTabs, handleSelectCurrencyTabs
  } = useSettingsModal({ isOpen, onClose, onShowToast, onSettingsUpdated });

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
          width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto',
          background: '#16161a', border: '1px solid var(--border-gold)', borderRadius: '8px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.9)', padding: '24px', position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 className="poe-font" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={20} /> 系統設定 (POE Tool Settings)
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <AccountAuthSection
          settings={settings}
          setSettings={setSettings}
          characters={characters}
          sessionHealth={sessionHealth}
          loggingIn={loggingIn}
          loginError={loginError}
          testingConn={testingConn}
          testResult={testResult}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onTestConnection={handleTestConnection}
        />

        <GeneralSettingsSection
          settings={settings}
          setSettings={setSettings}
        />

        <OverlaySettingsSection
          settings={settings}
          onChange={(key, val) => setSettings(prev => ({ ...prev, [key]: val }))}
        />

        <StashTabSelector
          settings={settings}
          setSettings={setSettings}
          availableTabs={availableTabs}
          onFetchStashTabs={handleFetchStashTabs}
          onSelectAllTabs={handleSelectAllTabs}
          onClearAllTabs={handleClearAllTabs}
          onSelectCurrencyTabs={handleSelectCurrencyTabs}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
          <button type="button" className="poe-button-secondary" onClick={onClose} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            取消
          </button>
          <button
            type="button"
            className="poe-button"
            disabled={saving}
            onClick={handleSaveSettings}
            style={{ padding: '8px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {saving ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
