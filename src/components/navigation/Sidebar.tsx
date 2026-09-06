import React from 'react';
import {
  LayoutDashboard, Search, Coins, TrendingUp, Swords,
  Compass, ShieldAlert, Calculator, Map, Hammer,
  MessageSquare, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { AppTabType } from '../Navbar';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useSettings } from '../../hooks/useSettings';
import { isFeatureSupported, FEATURE_CAPABILITIES } from '../../domain/engine/capabilities';
import { EngineBadge } from '../common/EngineBadge';
import { poeApi } from '../../services/api';

export interface SidebarProps {
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenTradeWhisper?: () => void;
  onShowToast?: (msg: string) => void;
}

interface NavItemDef {
  id: AppTabType;
  label: string;
  icon: React.ReactNode;
}

interface NavGroupDef {
  title: string;
  items: NavItemDef[];
}

const NAV_GROUPS: NavGroupDef[] = [
  {
    title: '總覽',
    items: [
      { id: 'dashboard', label: '首頁儀表板', icon: <LayoutDashboard size={17} /> }
    ]
  },
  {
    title: '市集與交易',
    items: [
      { id: 'price', label: '裝備查價', icon: <Search size={17} /> },
      { id: 'exchange', label: '大宗交易所', icon: <Coins size={17} /> }
    ]
  },
  {
    title: '資產與刷圖',
    items: [
      { id: 'wealth', label: '每小時資產估算', icon: <TrendingUp size={17} /> },
      { id: 'mapping', label: '刷圖收益追蹤', icon: <Swords size={17} /> }
    ]
  },
  {
    title: '終局與地圖',
    items: [
      { id: 'atlas', label: '輿圖天賦策略', icon: <Compass size={17} /> },
      { id: 'mapmod', label: '地圖過濾 / Regex', icon: <ShieldAlert size={17} /> }
    ]
  },
  {
    title: '流派與工藝',
    items: [
      { id: 'build', label: 'Build 成本計算', icon: <Calculator size={17} /> },
      { id: 'acts', label: '拓荒攻略指南', icon: <Map size={17} /> },
      { id: 'craft', label: '工藝期望精算', icon: <Hammer size={17} /> }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  onOpenTradeWhisper,
  onShowToast
}) => {
  const { currentEngine } = useGameEngine();
  const { settings } = useSettings();

  const handleOpenOverlay = async () => {
    try {
      await poeApi.showOverlayWindow();
      onShowToast?.('已呼叫遊戲內懸浮查價小卡');
    } catch {
      onShowToast?.('無法開啟懸浮視窗');
    }
  };

  return (
    <aside
      data-testid="app-sidebar"
      style={{
        width: isCollapsed ? '64px' : '220px',
        backgroundColor: '#0c0f17',
        borderRight: '1px solid rgba(200, 170, 110, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        zIndex: 90,
        userSelect: 'none'
      }}
    >
      <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
        {!isCollapsed && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            功能導航
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="poe-button-secondary"
          style={{ padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {NAV_GROUPS.map(group => {
          const visibleItems = settings.focusModeEnabled
            ? group.items.filter(item => isFeatureSupported(item.id, currentEngine))
            : group.items;

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              {!isCollapsed && (
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, padding: '0 8px 6px', letterSpacing: '0.5px' }}>
                  {group.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {visibleItems.map(item => (
                  <SidebarNavItem
                    key={item.id}
                    item={item}
                    isActive={activeTab === item.id}
                    isCollapsed={isCollapsed}
                    currentEngine={currentEngine}
                    onClick={() => setActiveTab(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <SidebarBottomActions
        isCollapsed={isCollapsed}
        onOpenWhisper={onOpenTradeWhisper}
        onOpenOverlay={handleOpenOverlay}
      />
    </aside>
  );
};

interface SidebarNavItemProps {
  item: NavItemDef;
  isActive: boolean;
  isCollapsed: boolean;
  currentEngine: 'poe1' | 'poe2';
  onClick: () => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  isActive,
  isCollapsed,
  currentEngine,
  onClick
}) => {
  const isSupported = isFeatureSupported(item.id, currentEngine);
  const cap = FEATURE_CAPABILITIES[item.id];

  return (
    <button
      type="button"
      onClick={onClick}
      className={isActive ? 'poe-button' : 'poe-button-secondary'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '9px',
        padding: isCollapsed ? '9px 0' : '8px 10px',
        borderRadius: '5px',
        fontSize: '0.84rem',
        opacity: isSupported ? 1 : 0.55,
        width: '100%',
        textAlign: 'left',
        borderLeft: isActive ? '3px solid var(--text-gold)' : '3px solid transparent'
      }}
      title={
        !isSupported
          ? `${item.label}（${cap.supportedEngines[0] === 'poe1' ? 'PoE 1' : 'PoE 2'} 專屬）`
          : cap.description
      }
    >
      <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
      {!isCollapsed && (
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.label}
        </span>
      )}
      {!isCollapsed && <EngineBadge supportedEngines={cap.supportedEngines} size="xs" />}
    </button>
  );
};

interface SidebarBottomActionsProps {
  isCollapsed: boolean;
  onOpenWhisper?: () => void;
  onOpenOverlay: () => void;
}

const SidebarBottomActions: React.FC<SidebarBottomActionsProps> = ({
  isCollapsed,
  onOpenWhisper,
  onOpenOverlay
}) => (
  <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <button
      type="button"
      onClick={onOpenWhisper}
      className="poe-button-secondary"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '8px',
        padding: isCollapsed ? '8px 0' : '7px 10px',
        borderRadius: '5px',
        fontSize: '0.8rem',
        color: '#34d399',
        borderColor: 'rgba(52, 211, 153, 0.3)'
      }}
      title="開啟官方市集交易密語助理"
    >
      <MessageSquare size={16} />
      {!isCollapsed && <span>密語助理</span>}
    </button>

    <button
      type="button"
      onClick={onOpenOverlay}
      className="poe-button-secondary"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '8px',
        padding: isCollapsed ? '8px 0' : '7px 10px',
        borderRadius: '5px',
        fontSize: '0.8rem',
        color: 'var(--text-gold)',
        borderColor: 'rgba(200, 170, 110, 0.3)'
      }}
      title="呼叫遊戲內懸浮查價小卡 (Ctrl+D)"
    >
      <Layers size={16} />
      {!isCollapsed && <span>懸浮小卡</span>}
    </button>
  </div>
);
