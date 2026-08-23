import React, { useState } from 'react';
import { Search, TrendingUp, Settings, Coins, Calculator } from 'lucide-react';
import { getImageUrl } from '../utils/image';
import { toggleAlwaysOnTop } from '../utils/tauri';
import { useSettings } from '../hooks/useSettings';
import { ConnectionStatusBadge } from './common/ConnectionStatusBadge';

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

  const displayLeague = propLeague || activeLeague || settings.league || 'Settlers';
  const divineRate = propDivineRate !== undefined ? propDivineRate : (ctxDivineRate || 150);
  const accountName = propAccountName !== undefined ? propAccountName : settings.accountName;

  const handleManualRefreshRate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await refreshDivineRate(displayLeague, true);
  };

  const handleTogglePin = async () => {
    const next = !alwaysOnTop;
    await toggleAlwaysOnTop(next);
    setAlwaysOnTop(next);
  };

  return (
    <header style={{
      backgroundColor: '#0a0d14', borderBottom: '1px solid rgba(200, 170, 110, 0.25)',
      padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'radial-gradient(circle, #f3d179 0%, #8c7849 70%, #2a2216 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(243, 209, 121, 0.4)'
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

        <ConnectionStatusBadge
          displayLeague={displayLeague}
          accountName={accountName}
          divineRate={divineRate}
          divIcon={divIcon}
          isRateRefreshing={isRateRefreshing}
          onManualRefreshRate={handleManualRefreshRate}
          alwaysOnTop={alwaysOnTop}
          onTogglePin={handleTogglePin}
        />
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('price')}
          className={activeTab === 'price' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
        >
          <Search size={16} /> 裝備即時查價
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wealth')}
          className={activeTab === 'wealth' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
        >
          <TrendingUp size={16} /> 每小時資產估算
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('build')}
          className={activeTab === 'build' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
        >
          <Calculator size={16} /> Build 成本計算
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

        <button
          type="button"
          onClick={onOpenSettings}
          className="poe-button-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem' }}
          title="系統設定"
        >
          <Settings size={16} /> 設定
        </button>
      </nav>
    </header>
  );
};
