import { useState } from 'react';
import {
  TrendingUp, Search, Coins, Swords, Layers, MessageSquare,
  Sparkles, RefreshCw
} from 'lucide-react';
import type { AppTabType } from '../Navbar';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useSettings } from '../../hooks/useSettings';
import { poeApi } from '../../services/api';
import { EngineBadge } from '../common/EngineBadge';

interface HomeDashboardProps {
  league: string;
  divineRate: number;
  onNavigate: (tab: AppTabType) => void;
  onOpenTradeWhisper?: () => void;
  onShowToast: (msg: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  league,
  divineRate,
  onNavigate,
  onOpenTradeWhisper,
  onShowToast
}) => {
  const { currentEngine, metadata } = useGameEngine();
  const { isRateRefreshing, refreshDivineRate } = useSettings();
  const [openingOverlay, setOpeningOverlay] = useState(false);

  const handleRefresh = async () => {
    await refreshDivineRate(league, true);
    onShowToast('神聖石即時匯率已更新');
  };

  const handleOpenOverlay = async () => {
    setOpeningOverlay(true);
    try {
      await poeApi.showOverlayWindow();
      onShowToast('已呼叫遊戲內懸浮查價小卡');
    } catch {
      onShowToast('無法開啟懸浮視窗');
    } finally {
      setOpeningOverlay(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeroBanner
        currentEngine={currentEngine}
        engineName={metadata.name}
        league={league}
      />

      <EconomicTicker
        league={league}
        divineRate={divineRate}
        isRefreshing={isRateRefreshing}
        onRefresh={handleRefresh}
      />

      <div>
        <h3 className="poe-font" style={{ fontSize: '1.1rem', color: 'var(--text-gold)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} /> 核心功能快速導航 (Quick Access Hub)
        </h3>
        <QuickActionGrid
          onNavigate={onNavigate}
          onOpenWhisper={onOpenTradeWhisper}
          onOpenOverlay={handleOpenOverlay}
          openingOverlay={openingOverlay}
        />
      </div>

      <SystemGuideCard currentEngine={currentEngine} />
    </div>
  );
};

interface HeroBannerProps {
  currentEngine: 'poe1' | 'poe2';
  engineName: string;
  league: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ currentEngine, engineName, league }) => (
  <div
    style={{
      padding: '22px 28px',
      background: 'linear-gradient(135deg, rgba(20, 24, 35, 0.95) 0%, rgba(13, 16, 25, 0.95) 100%)',
      border: '1px solid var(--border-gold)',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    }}
  >
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <h2 className="poe-font" style={{ fontSize: '1.4rem', color: 'var(--text-gold)', margin: 0 }}>
          POE Helper Tool 控制總覽儀表板
        </h2>
        <EngineBadge variant={currentEngine} size="sm" showBoth />
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        已就緒於 <strong style={{ color: 'var(--text-bright)' }}>{engineName}</strong>（目標聯盟：{league}）。在遊戲中按下 <code style={{ color: 'var(--text-gold)' }}>Ctrl+C</code> 即可自動解析並查價。
      </div>
    </div>
  </div>
);

interface EconomicTickerProps {
  league: string;
  divineRate: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const EconomicTicker: React.FC<EconomicTickerProps> = ({ league, divineRate, isRefreshing, onRefresh }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
    <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(200,170,110,0.25)', borderRadius: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>神聖石即時匯率 (Divine Rate)</span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="poe-button-secondary"
          style={{ padding: '2px 6px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={11} className={isRefreshing ? 'spin' : ''} /> 刷新
        </button>
      </div>
      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-gold)' }}>
        1 Divine ≈ {divineRate} Chaos
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        聯盟基準：{league}
      </div>
    </div>

    <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>剪貼簿自動辨識 (Clipboard Auto-Sync)</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sparkles size={16} /> 智慧監聽中
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        支援 PoE 1 / PoE 2 中英文裝備格式
      </div>
    </div>

    <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>官方大宗市集通道 (Faustus API)</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Coins size={16} /> 雙世代交易所支援
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        直接查詢金幣手續費與批量掛牌匯率
      </div>
    </div>
  </div>
);

interface QuickActionGridProps {
  onNavigate: (tab: AppTabType) => void;
  onOpenWhisper?: () => void;
  onOpenOverlay: () => void;
  openingOverlay: boolean;
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onNavigate,
  onOpenWhisper,
  onOpenOverlay,
  openingOverlay
}) => {
  const actions = [
    {
      id: 'price',
      title: '裝備查價',
      desc: '中英解析、數值範圍過濾與官方即時價格',
      icon: <Search size={22} color="#f3d179" />,
      onClick: () => onNavigate('price')
    },
    {
      id: 'exchange',
      title: '大宗交易所',
      desc: 'Faustus 大宗通貨即時行情與跨市場套利',
      icon: <Coins size={22} color="#34d399" />,
      onClick: () => onNavigate('exchange')
    },
    {
      id: 'wealth',
      title: '每小時資產估算',
      desc: '全倉庫資產總計與時薪成長趨勢圖',
      icon: <TrendingUp size={22} color="#a78bfa" />,
      onClick: () => onNavigate('wealth')
    },
    {
      id: 'mapping',
      title: '刷圖收益追蹤',
      desc: '單張地圖開圖計時與掉落結算報告',
      icon: <Swords size={22} color="#f87171" />,
      onClick: () => onNavigate('mapping')
    },
    {
      id: 'overlay',
      title: '懸浮查價小卡',
      desc: '遊戲內快速懸浮極簡小卡 (Ctrl+D)',
      icon: <Layers size={22} color="#38bdf8" />,
      onClick: onOpenOverlay,
      loading: openingOverlay
    },
    {
      id: 'whisper',
      title: '交易密語助理',
      desc: '即時收到官方市集買家訊息並一鍵回覆',
      icon: <MessageSquare size={22} color="#4ade80" />,
      onClick: onOpenWhisper
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
      {actions.map(act => (
        <button
          key={act.id}
          type="button"
          onClick={act.onClick}
          className="poe-card"
          style={{
            textAlign: 'left',
            padding: '16px 18px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {act.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-bright)', marginBottom: '3px' }}>
              {act.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {act.desc}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

const SystemGuideCard: React.FC<{ currentEngine: 'poe1' | 'poe2' }> = ({ currentEngine }) => (
  <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      💡 <strong style={{ color: 'var(--text-bright)' }}>小提示：</strong>
      當前正在使用 <span style={{ color: 'var(--text-gold)' }}>{currentEngine === 'poe1' ? 'PoE 1' : 'PoE 2'}</span> 模式。您可透過左側邊欄切換至專屬分頁，或在頂部開啟「專注模式」自動折疊不適用的機制。
    </div>
  </div>
);
