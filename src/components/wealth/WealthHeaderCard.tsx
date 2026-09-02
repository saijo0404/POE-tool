import React from 'react';
import { TrendingUp, RefreshCw, Clock, Coins, Trash2, Download, Share2, Boxes } from 'lucide-react';
import type { WealthSnapshot, StashProgress } from '../../types/poe';
import { getImageUrl } from '../../utils/image';

interface WealthHeaderCardProps {
  latestSnapshot: WealthSnapshot | null;
  displayTotalChaos: number;
  displayTotalDivine: number;
  snapshotting: boolean;
  progress: StashProgress | null;
  snapshotsCount: number;
  bulkMultiplier?: number;
  onChangeBulkMultiplier?: (mult: number) => void;
  onCreateSnapshot: () => void;
  onClearHistory: () => void;
  onExportCSV: () => void;
  onCopyDiscordSummary: () => void;
}

export const WealthHeaderCard: React.FC<WealthHeaderCardProps> = ({
  latestSnapshot,
  displayTotalChaos,
  displayTotalDivine,
  snapshotting,
  progress,
  snapshotsCount,
  bulkMultiplier = 1.0,
  onChangeBulkMultiplier,
  onCreateSnapshot,
  onClearHistory,
  onExportCSV,
  onCopyDiscordSummary
}) => {
  const divIconUrl = getImageUrl('https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png');
  const chaosIconUrl = getImageUrl('https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png');

  return (
    <div className="poe-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 className="poe-font" style={{ fontSize: '1.4rem', color: 'var(--text-gold)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} /> Hourly Wealth Tracker (即時資產與時薪追蹤)
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            最後更新：{latestSnapshot ? new Date(latestSnapshot.timestamp).toLocaleTimeString() : '尚未建立快照'}
            {latestSnapshot && <span style={{ marginLeft: '12px', color: 'var(--text-bright)' }}>聯盟：<strong>{latestSnapshot.league}</strong></span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onCopyDiscordSummary}
            disabled={snapshotsCount === 0}
            className="poe-button-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="複製 Discord Markdown 格式"
          >
            <Share2 size={15} /> 分享 Discord
          </button>
          <button
            onClick={onExportCSV}
            disabled={snapshotsCount === 0}
            className="poe-button-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="下載完整歷程 CSV 報表"
          >
            <Download size={15} /> 匯出 CSV
          </button>
          <button
            onClick={onClearHistory}
            disabled={snapshotsCount === 0 || snapshotting}
            className="poe-button-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}
            title="重置快照紀錄"
          >
            <Trash2 size={15} /> 清除紀錄
          </button>
          <button
            onClick={onCreateSnapshot}
            disabled={snapshotting}
            className="poe-button"
            style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={snapshotting ? 'spin' : ''} />
            {snapshotting ? '正在掃描倉庫與角色...' : '立即計算目前資產快照'}
          </button>
        </div>
      </div>

      {snapshotting && progress && (
        <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(200, 170, 110, 0.08)', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-gold)', marginBottom: '6px' }}>
            <span>正在載入：{progress.currentTabName}</span>
            <span>{progress.currentTab} / {progress.totalTabs} 頁</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(5, (progress.currentTab / Math.max(1, progress.totalTabs)) * 100)}%`, height: '100%', background: 'var(--text-gold)', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {snapshotsCount === 0 && !snapshotting && (
        <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', border: '1px dashed rgba(200,170,110,0.3)', marginBottom: '16px' }}>
          <div style={{ fontSize: '1rem', color: 'var(--text-gold)', marginBottom: '6px', fontWeight: 600 }}>
            尚未讀取到真實資產數據
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            請點擊右上角「立即計算目前資產快照」以掃描倉庫。若無法取得資料，請至設定確認 POESESSID 與帳號名稱設定。
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
            <img src={divIconUrl} alt="Divine" style={{ width: '20px', height: '20px' }} />
            <span>總淨資產 (神聖石)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-gold)', fontFamily: 'Cinzel, serif' }}>
            {displayTotalDivine.toLocaleString()} <span style={{ fontSize: '1rem' }}>div</span>
          </div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
            <img src={chaosIconUrl} alt="Chaos" style={{ width: '20px', height: '20px' }} />
            <span>總淨資產 (混沌石)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-bright)', fontFamily: 'Cinzel, serif' }}>
            {displayTotalChaos.toLocaleString()} <span style={{ fontSize: '1rem' }}>c</span>
          </div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
            <Clock size={18} color="var(--accent-blue)" />
            <span>時薪增長率 (Divine / hr)</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: (latestSnapshot?.hourlyChangeDivine || 0) >= 0 ? '#4ade80' : '#ef4444', fontFamily: 'Cinzel, serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {(latestSnapshot?.hourlyChangeDivine || 0) >= 0 ? '+' : ''}{latestSnapshot?.hourlyChangeDivine ?? 0} <span style={{ fontSize: '1rem' }}>div/hr</span>
          </div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
            <Coins size={18} color="var(--text-gold)" />
            <span>Divine / Chaos 匯率</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-bright)', fontFamily: 'Cinzel, serif' }}>
            1 : {latestSnapshot?.chaosRate ?? 150}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Boxes size={16} /> 大宗出售溢價 (Bulk Multiplier):
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { value: 1.0, label: '1.0x 零售 (Retail)' },
              { value: 1.2, label: '1.2x 批發 (+20%)' },
              { value: 1.4, label: '1.4x 頂配大宗 (+40%)' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => onChangeBulkMultiplier?.(opt.value)}
                className={bulkMultiplier === opt.value ? 'poe-button' : 'poe-button-secondary'}
                style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '4px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {bulkMultiplier > 1.0 && (
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📦 大宗估值模式生效中：通貨、甲蟲、精髓、命運卡、地圖等大宗商品以 <strong>{bulkMultiplier}x</strong> 溢價計價</span>
          </div>
        )}
      </div>
    </div>
  );
};
