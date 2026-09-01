import React from 'react';
import { MessageSquare, Navigation, Check } from 'lucide-react';
import type { TradeListing } from '../../types/poe';

interface OverlayQuickListingsProps {
  listings: TradeListing[];
  copiedId: string | null;
  onCopyWhisper: (listing: TradeListing) => void;
  onTravelToHideout: (listing: TradeListing) => void;
}

export const OverlayQuickListings: React.FC<OverlayQuickListingsProps> = ({
  listings,
  copiedId,
  onCopyWhisper,
  onTravelToHideout
}) => {
  const topListings = listings.slice(0, 5);

  if (topListings.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#718096', fontSize: '0.8rem' }}>
        無符合之市場掛單
      </div>
    );
  }

  return (
    <div style={{
      maxHeight: '180px',
      overflowY: 'auto',
      padding: '6px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      background: 'rgba(10, 12, 16, 0.75)'
    }}>
      {topListings.map((listing) => {
        const isCopied = copiedId === listing.id;

        return (
          <div
            key={listing.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.78rem'
            }}
          >
            {/* Price tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '85px' }}>
              <span style={{ fontWeight: 'bold', color: '#ffb948' }}>
                {listing.priceAmount}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#e0caa0' }}>
                {listing.priceCurrency}
              </span>
            </div>

            {/* Account name */}
            <div style={{ flex: 1, minWidth: 0, padding: '0 6px', color: '#a0aec0', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {listing.accountName || '神秘流亡者'}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => onCopyWhisper(listing)}
                aria-label="複製密語"
                title="複製買家密語"
                style={{
                  background: isCopied ? 'rgba(72, 187, 120, 0.2)' : 'rgba(200, 170, 110, 0.12)',
                  border: `1px solid ${isCopied ? '#48bb78' : 'rgba(200, 170, 110, 0.25)'}`,
                  color: isCopied ? '#68d391' : 'var(--text-gold)',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                {isCopied ? <Check size={11} /> : <MessageSquare size={11} />}
                <span>{isCopied ? '已複製' : '密語'}</span>
              </button>

              <button
                type="button"
                onClick={() => onTravelToHideout(listing)}
                aria-label="直購傳送藏身處"
                title="自動傳送至該賣家藏身處"
                style={{
                  background: 'rgba(66, 153, 225, 0.12)',
                  border: '1px solid rgba(66, 153, 225, 0.25)',
                  color: '#63b3ed',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Navigation size={11} />
                <span>藏身處</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
