import React from 'react';
import type { TradeSearchResult, TradeListing } from '../../types/poe';
import { ExternalLink, Loader2, ArrowUpDown, ChevronDown } from 'lucide-react';
import { poeApi } from '../../services/api';
import { TradeEmptyState } from './TradeEmptyState';
import { TradeListingRow } from './TradeListingRow';

interface TradeListingViewProps {
  tradeResults: TradeSearchResult | null;
  copiedId: string | null;
  onCopyWhisper: (listing: TradeListing) => void;
  sortBy?: 'price_asc' | 'price_desc' | 'indexed_desc';
  onChangeSortBy?: (val: 'price_asc' | 'price_desc' | 'indexed_desc') => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  league?: string;
  onShowToast?: (msg: string) => void;
}

export const TradeListingView: React.FC<TradeListingViewProps> = ({
  tradeResults,
  copiedId,
  onCopyWhisper,
  sortBy = 'price_asc',
  onChangeSortBy,
  onLoadMore,
  loadingMore = false,
  league,
  onShowToast
}) => {
  if (!tradeResults) return null;
  if (!tradeResults.listings || tradeResults.listings.length === 0) {
    return <TradeEmptyState />;
  }

  const tradeUrl = tradeResults.tradeUrl || tradeResults.searchUrl;
  const canLoadMore = Boolean(onLoadMore && tradeResults.listings.length < tradeResults.total);

  return (
    <div className="poe-card" style={{ marginBottom: '20px', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'rgba(0, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 className="poe-font" style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0 }}>
            市集搜尋結果 / 刊登清單明細（顯示 {tradeResults.listings.length} / 共 {tradeResults.total} 筆）
          </h3>
          {tradeUrl && (
            <button
              onClick={() => poeApi.openExternalUrl(tradeUrl)}
              className="poe-button-secondary"
              style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}
            >
              <ExternalLink size={12} /> 開啟官方市集
            </button>
          )}
        </div>

        {onChangeSortBy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} color="var(--text-gold)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>排序:</span>
            <select
              className="poe-input"
              value={sortBy}
              onChange={e => onChangeSortBy(e.target.value as 'price_asc' | 'price_desc' | 'indexed_desc')}
              style={{ padding: '3px 8px', fontSize: '0.8rem', background: '#121214', color: 'var(--text-bright)' }}
            >
              <option value="price_asc">價格：由低至高</option>
              <option value="price_desc">價格：由高至低</option>
              <option value="indexed_desc">刊登時間：最新優先</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {tradeResults.listings.map(listing => (
          <TradeListingRow
            key={listing.id}
            listing={listing}
            copiedId={copiedId}
            onCopyWhisper={onCopyWhisper}
            league={league}
            searchId={tradeResults.searchId || tradeResults.id}
            onShowToast={onShowToast}
          />
        ))}
      </div>

      {canLoadMore && (
        <div style={{ padding: '14px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="poe-button-secondary"
            style={{ padding: '8px 24px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
          >
            {loadingMore ? <Loader2 size={15} className="spin" /> : <ChevronDown size={15} />}
            {loadingMore ? '載入中...' : `載入更多刊登物件 (${tradeResults.listings.length}/${tradeResults.total})`}
          </button>
        </div>
      )}
    </div>
  );
};
