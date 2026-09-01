import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import type { TradeSearchResult } from '../../types/poe';

interface OverlayPriceSummaryProps {
  tradeResults: TradeSearchResult | null;
  searching: boolean;
  onRefreshSearch: () => void;
}

export const OverlayPriceSummary: React.FC<OverlayPriceSummaryProps> = ({
  tradeResults,
  searching,
  onRefreshSearch
}) => {
  const minDiv = tradeResults?.estimatedMinPriceDivine;
  const minChaos = tradeResults?.estimatedMinPriceChaos;
  const medDiv = tradeResults?.estimatedMedianPriceDivine;
  const medChaos = tradeResults?.estimatedMedianPriceChaos;
  const total = tradeResults?.total ?? 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: 'linear-gradient(180deg, rgba(28, 33, 44, 0.9) 0%, rgba(18, 22, 30, 0.9) 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Estimated Min Price */}
        <div>
          <div style={{ fontSize: '0.68rem', color: '#8c94a4', marginBottom: '1px' }}>市場底價 (Min)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#ffb948' }}>
              {minDiv !== undefined && minDiv > 0 ? minDiv.toFixed(2) : minChaos ?? '-'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#e0caa0' }}>
              {minDiv !== undefined && minDiv > 0 ? 'div' : 'chaos'}
            </span>
          </div>
        </div>

        {/* Estimated Median Price */}
        <div>
          <div style={{ fontSize: '0.68rem', color: '#8c94a4', marginBottom: '1px' }}>中位價 (Median)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#68d391' }}>
              {medDiv !== undefined && medDiv > 0 ? medDiv.toFixed(2) : medChaos ?? '-'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#9ae6b4' }}>
              {medDiv !== undefined && medDiv > 0 ? 'div' : 'chaos'}
            </span>
          </div>
        </div>

        {/* Total Listings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#7e8796' }}>
          <TrendingUp size={13} />
          <span>{total} 筆掛單</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefreshSearch}
        disabled={searching}
        aria-label="重新查詢"
        style={{
          background: 'rgba(200, 170, 110, 0.15)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          borderRadius: '4px',
          color: 'var(--text-gold)',
          padding: '4px 8px',
          fontSize: '0.75rem',
          cursor: searching ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <RefreshCw size={12} className={searching ? 'spin' : ''} />
        <span>{searching ? '查詢中...' : '重查'}</span>
      </button>
    </div>
  );
};
