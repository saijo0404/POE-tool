import React from 'react';
import { ShoppingBag, ExternalLink, RefreshCw, Zap, Search } from 'lucide-react';
import type { TradeSearchResult } from '../../types/poe';

interface TradeSummaryCardProps {
  tradeResults: TradeSearchResult | null;
  searching: boolean;
  onRefreshSearch: () => void;
}

export const TradeSummaryCard: React.FC<TradeSummaryCardProps> = ({
  tradeResults,
  searching,
  onRefreshSearch
}) => {
  // If actively searching and results haven't arrived yet
  if (searching && !tradeResults) {
    return (
      <div className="poe-card" style={{
        marginBottom: '20px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'rgba(200, 170, 110, 0.05)',
        border: '1px solid rgba(200, 170, 110, 0.3)',
        borderRadius: '8px'
      }}>
        <RefreshCw className="animate-spin" size={18} color="var(--text-gold)" />
        <span style={{ fontSize: '0.95rem', color: 'var(--text-gold)', fontWeight: 600 }}>
          正在向 GGG 官方市集查詢即時刊登與行情估價中...
        </span>
      </div>
    );
  }

  // If parsed but trade search hasn't been executed yet
  if (!tradeResults) {
    return (
      <div className="poe-card" style={{
        marginBottom: '20px',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'rgba(200, 170, 110, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gold)' }}>
          <ShoppingBag size={18} />
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>裝備屬性解析完成，點擊右側按鈕開始向市集比價：</span>
        </div>
        <button
          onClick={onRefreshSearch}
          disabled={searching}
          className="poe-btn poe-btn-primary"
          style={{ fontSize: '0.85rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Search size={15} />
          {searching ? '查詢中...' : '🔍 立即市集查價'}
        </button>
      </div>
    );
  }

  return (
    <div className="poe-card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(20, 24, 33, 0.95), rgba(13, 17, 23, 0.95))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--text-gold)" />
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-gold)' }}>
              市場行情估價 (共 {tradeResults.total} 筆)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {tradeResults.estimatedMinPriceDivine > 0 && (
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--accent-blue)' }}>
                最低價: <strong>{tradeResults.estimatedMinPriceDivine} Divine</strong> ({tradeResults.estimatedMinPriceChaos} Chaos)
              </span>
            )}
            {tradeResults.estimatedMedianPriceDivine > 0 && (
              <span style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', color: '#facc15' }}>
                中位數價: <strong>{tradeResults.estimatedMedianPriceDivine} Divine</strong> ({tradeResults.estimatedMedianPriceChaos} Chaos)
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onRefreshSearch}
            disabled={searching}
            className="poe-btn poe-btn-primary"
            style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {searching ? <RefreshCw className="animate-spin" size={15} /> : <Zap size={15} />}
            {searching ? '查詢中...' : '重新查詢'}
          </button>

          {tradeResults.tradeUrl && (
            <a
              href={tradeResults.tradeUrl}
              target="_blank"
              rel="noreferrer"
              className="poe-btn"
              style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <ExternalLink size={15} /> 開啟官方拍賣場
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeSummaryCard;
