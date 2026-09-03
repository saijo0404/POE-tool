import React, { useState } from 'react';
import { Search, TrendingUp, Settings, Coins, Calculator, Map, Compass, Layers, Swords, ShieldAlert, MessageSquare, Hammer } from 'lucide-react';
import { getImageUrl } from '../utils/image';
import { toggleAlwaysOnTop } from '../utils/tauri';
import { useSettings } from '../hooks/useSettings';
import { poeApi } from '../services/api';
import { ConnectionStatusBadge } from './common/ConnectionStatusBadge';

export type AppTabType = 'price' | 'wealth' | 'mapping' | 'build' | 'acts' | 'atlas' | 'mapmod' | 'craft';

interface NavbarProps {
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  onOpenSettings: () => void;
  onOpenTradeWhisper?: () => void;
  league?: string;
  divineRate?: number;
  accountName?: string;
}

const NAV_TABS: { id: AppTabType; label: string; icon: React.ReactNode }[] = [
  { id: 'price', label: '裝備即時查價', icon: <Search size={15} /> },
  { id: 'wealth', label: '每小時資產估算', icon: <TrendingUp size={15} /> },
  { id: 'mapping', label: '刷圖收益追蹤', icon: <Swords size={15} /> },
  { id: 'build', label: 'Build 成本計算', icon: <Calculator size={15} /> },
  { id: 'acts', label: '拓荒攻略', icon: <Map size={15} /> },
  { id: 'atlas', label: '輿圖天賦策略', icon: <Compass size={15} /> },
  { id: 'mapmod', label: '地圖過濾 / Regex', icon: <ShieldAlert size={15} /> },
  { id: 'craft', label: '工藝期望精算', icon: <Hammer size={15} /> },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenTradeWhisper,
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

      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'poe-button' : 'poe-button-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '0.86rem' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }} />

        <button
          type="button"
          onClick={onOpenTradeWhisper}
          className="poe-button-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '6px', fontSize: '0.86rem', color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.4)' }}
          title="開啟交易密語助理與快捷回覆模擬器"
        >
          <MessageSquare size={15} /> 密語助理
        </button>

        <button
          type="button"
          onClick={async () => {
            try {
              await poeApi.showOverlayWindow();
            } catch {
              // Ignore
            }
          }}
          className="poe-button-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '6px', fontSize: '0.86rem', color: 'var(--text-gold)', borderColor: 'rgba(200, 170, 110, 0.4)' }}
          title="開啟遊戲內極簡懸浮查價小卡 (Ctrl+D)"
        >
          <Layers size={15} /> 懸浮小卡
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="poe-button-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '6px', fontSize: '0.86rem' }}
          title="系統設定"
        >
          <Settings size={15} /> 設定
        </button>
      </nav>
    </header>
  );
};

