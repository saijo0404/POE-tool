import React, { useState } from 'react';
import { Search, TrendingUp, Settings, Coins, Calculator, Pin, PinOff, RefreshCw } from 'lucide-react';
import { getImageUrl } from '../utils/image';
import { isTauri, toggleAlwaysOnTop } from '../utils/tauri';
import { useSettings } from '../hooks/useSettings';

interface NavbarProps {
  activeTab: 'price' | 'wealth' | 'build';
  setActiveTab: (tab: 'price' | 'wealth' | 'build') => void;
  onOpenSettings: () => void;
  league?: string;
  divineRate?: number;
  accountName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  league: propLeague,
  divineRate: propDivineRate,
  accountName: propAccountName
}) => {
  const { settings, activeLeague, divineRate: ctxDivineRate, isRateRefreshing, refreshDivineRate } = useSettings();
  const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(false);
  const divIcon = getImageUrl('https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png');

  const handleManualRefreshRate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await refreshDivineRate(displayLeague, true);
  };

  const handleTogglePin = async () => {
    const next = !alwaysOnTop;
    await toggleAlwaysOnTop(next);
    setAlwaysOnTop(next);
  };

  const accountName = propAccountName !== undefined ? propAccountName : settings.accountName;
  const displayLeague = propLeague || activeLeague || settings.league || 'Settlers';
  const divineRate = propDivineRate !== undefined ? propDivineRate : (ctxDivineRate || 150);

  return (
    <header style={{
      backgroundColor: '#0a0d14',
      borderBottom: '1px solid rgba(200, 170, 110, 0.25)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #f3d179 0%, #8c7849 70%, #2a2216 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(243, 209, 121, 0.4)'
          }}>
            <Coins size={22} color="#0d121c" />
          </div>
          <div>
            <h1 className="poe-font" style={{ fontSize: '1.25rem', color: 'var(--text-gold)', letterSpacing: '1px', margin: 0 }}>
              POE Helper Tool
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              多國語言裝備查價 & 倉庫時薪估算儀表板
            </span>
          </div>
        </div>

        {/* League & Rate Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px' }}>
          <span style={{
            background: 'rgba(200, 170, 110, 0.12)',
            border: '1px solid rgba(200, 170, 110, 0.3)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            color: 'var(--text-gold)'
          }}>
            聯盟: <strong>{displayLeague}</strong>
          </span>
          {accountName ? (
            <span style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: '#4ade80',
              fontWeight: 500
            }}>
              👤 {accountName}
            </span>
          ) : (
            <span style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: '#f87171'
            }}>
              未登入
            </span>
          )}
          <span style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            color: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <img src={divIcon} alt="Div" referrerPolicy="no-referrer" style={{ width: '16px', height: '16px' }} />
            <span>1 Divine = <strong>{divineRate} Chaos</strong></span>
            <button
              onClick={handleManualRefreshRate}
              disabled={isRateRefreshing}
              title="點擊強制刷新神聖石即時匯率"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: isRateRefreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                color: 'var(--accent-blue)',
                opacity: isRateRefreshing ? 0.6 : 0.9,
                transition: 'transform 0.2s, opacity 0.2s'
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: isRateRefreshing ? 'spin 1s linear infinite' : 'none'
                }}
              />
            </button>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={`poe-btn ${activeTab === 'price' ? 'poe-btn-primary' : ''}`}
          onClick={() => setActiveTab('price')}
          style={{ padding: '8px 16px' }}
        >
          <Search size={16} />
          裝備查價 (Price Checker)
        </button>

        <button
          className={`poe-btn ${activeTab === 'wealth' ? 'poe-btn-primary' : ''}`}
          onClick={() => setActiveTab('wealth')}
          style={{ padding: '8px 16px' }}
        >
          <TrendingUp size={16} />
          每小時資產估算 (Hourly Wealth Tracker)
        </button>

        <button
          className={`poe-btn ${activeTab === 'build' ? 'poe-btn-primary' : ''}`}
          onClick={() => setActiveTab('build')}
          style={{ padding: '8px 16px' }}
        >
          <Calculator size={16} />
          Build 成本估算
        </button>

        {isTauri() && (
          <button
            className={`poe-btn ${alwaysOnTop ? 'poe-btn-primary' : ''}`}
            onClick={handleTogglePin}
            style={{ padding: '8px 12px', marginLeft: '4px' }}
            title={alwaysOnTop ? '取消視窗置頂 (Pinned Always on Top)' : '釘選視窗置頂 (Pin on Top)'}
          >
            {alwaysOnTop ? <PinOff size={18} /> : <Pin size={18} />}
          </button>
        )}

        <button
          className="poe-btn"
          onClick={onOpenSettings}
          style={{ padding: '8px 12px', marginLeft: '8px' }}
          title="系統設定"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
