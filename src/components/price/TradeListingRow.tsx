import React from 'react';
import { Copy, Check, User } from 'lucide-react';
import type { TradeListing } from '../../types/poe';
import { getImageUrl } from '../../utils/image';
import { ItemTooltip } from '../common/ItemTooltip';
import { DirectTravelAction } from './DirectTravelAction';

interface TradeListingRowProps {
  listing: TradeListing;
  copiedId: string | null;
  onCopyWhisper: (listing: TradeListing) => void;
  league?: string;
  searchId?: string;
  onShowToast?: (msg: string) => void;
}

export const TradeListingRow: React.FC<TradeListingRowProps> = ({
  listing,
  copiedId,
  onCopyWhisper,
  league,
  searchId,
  onShowToast
}) => {
  const isCopied = copiedId === listing.id;
  const isOnline = listing.onlineStatus === 'online' || listing.onlineStatus === 'afk';
  const sellerAccountName = listing.sellerAccount || listing.accountName || listing.characterName;

  return (
    <div
      className="poe-table-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        gap: '14px',
        flexWrap: 'wrap',
        background: isCopied ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
        transition: 'background 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ItemTooltip item={listing.item}>
            <img
              src={getImageUrl(listing.item.icon)}
              alt={listing.item.typeLine || listing.item.name}
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(200, 170, 110, 0.3)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </ItemTooltip>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-gold)', fontSize: '0.9rem' }}>
              {listing.item.name || listing.item.typeLine}
            </span>
            {listing.item.name && listing.item.typeLine && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({listing.item.typeLine})</span>
            )}
            {listing.item.corrupted && (
              <span style={{ fontSize: '0.7rem', padding: '1px 4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '3px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                已汙染
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {listing.item.ilvl && <span>物等: {listing.item.ilvl}</span>}
            {listing.indexedAge && <span>刊登於: {listing.indexedAge}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-gold)', fontFamily: 'Cinzel, serif' }}>
              {listing.priceAmount}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-bright)', textTransform: 'capitalize' }}>
              {listing.priceCurrency}
            </span>
          </div>
          {listing.priceCurrency?.toLowerCase() !== 'chaos' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ≈ {listing.priceInChaos?.toLocaleString()}c
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '110px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#64748b' }} />
            <span style={{ color: isOnline ? 'var(--text-bright)' : 'var(--text-dim)', fontWeight: 500 }}>
              {sellerAccountName || '未知賣家'}
            </span>
          </div>
          {listing.characterName && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <User size={10} /> {listing.characterName}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onCopyWhisper(listing)}
            className="poe-button-secondary"
            style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}
            title="複製官方密語"
          >
            {isCopied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
            {isCopied ? '已複製' : '密語'}
          </button>

          <DirectTravelAction
            listing={listing}
            league={league}
            searchId={searchId}
            onShowToast={onShowToast}
          />
        </div>
      </div>
    </div>
  );
};
