import React, { useState, useEffect } from 'react';
import {
  Coins, Settings, Layers, Filter, PanelLeft,
  LayoutDashboard, Search, TrendingUp, Swords,
  Calculator, Map, Compass, ShieldAlert, Hammer
} from 'lucide-react';
import { getImageUrl } from '../utils/image';
import { toggleAlwaysOnTop } from '../utils/tauri';
import { useSettings } from '../hooks/useSettings';
import { useGameEngine } from '../hooks/useGameEngine';
import { isFeatureSupported } from '../domain/engine/capabilities';
import { ConnectionStatusBadge } from './common/ConnectionStatusBadge';
import { EngineSwitcher } from './common/EngineSwitcher';
import { FeatureCapabilityMatrixModal } from './settings/FeatureCapabilityMatrixModal';

export type AppTabType =
  | 'dashboard'
  | 'price'
  | 'exchange'
  | 'wealth'
  | 'mapping'
  | 'build'
  | 'acts'
  | 'atlas'
  | 'mapmod'
  | 'craft';

export interface NavbarProps {
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  onOpenSettings: () => void;
  onOpenTradeWhisper?: () => void;
  league?: string;
  divineRate?: number;
  accountName?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const TAB_META: Record<AppTabType, { label: string; icon: React.ReactNode }> = {
  dashboard: { label: '首頁儀表板', icon: <LayoutDashboard size={15} /> },
  price: { label: '裝備查價', icon: <Search size={15} /> },
  exchange: { label: '大宗交易所', icon: <Coins size={15} /> },
  wealth: { label: '每小時資產估算', icon: <TrendingUp size={15} /> },
  mapping: { label: '刷圖收益追蹤', icon: <Swords size={15} /> },
  build: { label: 'Build 成本計算', icon: <Calculator size={15} /> },
  acts: { label: '拓荒攻略指南', icon: <Map size={15} /> },
  atlas: { label: '輿圖天賦策略', icon: <Compass size={15} /> },
  mapmod: { label: '地圖過濾 / Regex', icon: <ShieldAlert size={15} /> },
  craft: { label: '工藝期望精算', icon: <Hammer size={15} /> },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  league: propLeague,
  divineRate: propDivineRate,
  accountName: propAccountName,
  isSidebarCollapsed = false,
  onToggleSidebar
}) => {
  const { settings, updateSettings, activeLeague, divineRate: ctxDivineRate, isRateRefreshing, refreshDivineRate } = useSettings();
  const { currentEngine } = useGameEngine();
  const [alwaysOnTop, setAlwaysOnTop] = useState<boolean>(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const divIcon = getImageUrl('https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png');

  const displayLeague = propLeague || activeLeague || settings.league || 'Settlers';
  const divineRate = propDivineRate !== undefined ? propDivineRate : (ctxDivineRate || 150);
  const accountName = propAccountName !== undefined ? propAccountName : settings.accountName;

  useEffect(() => {
    if (settings.focusModeEnabled && !isFeatureSupported(activeTab, currentEngine)) {
      setActiveTab('price');
    }
  }, [settings.focusModeEnabled, currentEngine, activeTab, setActiveTab]);

  const handleManualRefreshRate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await refreshDivineRate(displayLeague, true);
  };

  const handleTogglePin = async () => {
    const next = !alwaysOnTop;
    await toggleAlwaysOnTop(next);
    setAlwaysOnTop(next);
  };

  const handleToggleFocusMode = async () => {
    await updateSettings({ focusModeEnabled: !settings.focusModeEnabled });
  };

  const currentTabInfo = TAB_META[activeTab];

  return (
    <header
      data-testid="app-header"
      style={{
        backgroundColor: '#0a0d14',
        borderBottom: '1px solid rgba(200, 170, 110, 0.25)',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        minHeight: '56px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="poe-button-secondary"
            style={{ padding: '6px 8px', borderRadius: '5px', display: 'flex', alignItems: 'center' }}
            title={isSidebarCollapsed ? '展開側邊欄' : '收合側邊欄'}
          >
            <PanelLeft size={16} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'radial-gradient(circle, #f3d179 0%, #8c7849 70%, #2a2216 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(243, 209, 121, 0.35)'
          }}>
            <Coins size={18} color="#0d121c" />
          </div>
          <div>
            <h1 className="poe-font" style={{ fontSize: '1.15rem', color: 'var(--text-gold)', letterSpacing: '1px', margin: 0 }}>
              POE Tool
            </h1>
          </div>
        </div>

        {currentTabInfo && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px',
            fontSize: '0.8rem', color: 'var(--text-bright)'
          }}>
            <span style={{ color: 'var(--text-gold)', display: 'flex' }}>{currentTabInfo.icon}</span>
            <span>{currentTabInfo.label}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

        <EngineSwitcher />

        <button
          type="button"
          onClick={handleToggleFocusMode}
          className={settings.focusModeEnabled ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 9px', borderRadius: '5px', fontSize: '0.78rem' }}
          title={settings.focusModeEnabled ? '專注模式開啟中：已自動隱藏非當前世代分頁' : '點擊啟用世代專注模式（自動隱藏不支援的專屬分頁）'}
        >
          <Filter size={12} /> {settings.focusModeEnabled ? '專注模式' : '全功能'}
        </button>

        <button
          type="button"
          onClick={() => setIsMatrixOpen(true)}
          className="poe-button-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '5px', fontSize: '0.78rem', color: 'var(--text-gold)', borderColor: 'rgba(200, 170, 110, 0.4)' }}
          title="開啟 PoE 1 vs PoE 2 功能與能力支援對照表"
        >
          <Layers size={12} /> 對照表
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="poe-button-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}
          title="系統設定"
        >
          <Settings size={14} /> 設定
        </button>
      </div>

      <FeatureCapabilityMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
      />
    </header>
  );
};
