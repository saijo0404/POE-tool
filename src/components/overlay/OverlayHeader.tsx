import React from 'react';
import { ExternalLink, X, Pin, PinOff } from 'lucide-react';
import type { ParsedItem } from '../../types/poe';

interface OverlayHeaderProps {
  parsedItem: ParsedItem;
  itemIconUrl?: string;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onClose: () => void;
  onOpenOfficialTrade: () => void;
}

const RARITY_MAP: Record<string, { label: string; color: string }> = {
  Unique: { label: '傳奇', color: '#af6025' },
  Rare: { label: '稀有', color: '#f7d070' },
  Magic: { label: '魔法', color: '#8888ff' },
  Normal: { label: '普通', color: '#c8c8c8' },
  Gem: { label: '寶石', color: '#1ba29b' },
  Currency: { label: '通貨', color: '#aa9e82' }
};

export const OverlayHeader: React.FC<OverlayHeaderProps> = ({
  parsedItem,
  itemIconUrl,
  isPinned,
  onTogglePin,
  onClose,
  onOpenOfficialTrade
}) => {
  const rarityInfo = RARITY_MAP[parsedItem.rarity] || { label: parsedItem.rarity, color: '#c8c8c8' };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      borderBottom: '1px solid rgba(200, 170, 110, 0.25)',
      background: 'rgba(15, 18, 24, 0.85)',
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        {itemIconUrl && (
          <img
            src={itemIconUrl}
            alt=""
            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 4px',
              borderRadius: '3px',
              background: 'rgba(0,0,0,0.5)',
              color: rarityInfo.color,
              border: `1px solid ${rarityInfo.color}44`
            }}>
              {rarityInfo.label}
            </span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: rarityInfo.color,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {parsedItem.name || parsedItem.baseType}
            </span>
          </div>
          {parsedItem.name && parsedItem.baseType && parsedItem.name !== parsedItem.baseType && (
            <div style={{ fontSize: '0.75rem', color: '#88909d', marginTop: '1px' }}>
              {parsedItem.baseType} {parsedItem.itemLevel ? `(ilvl: ${parsedItem.itemLevel})` : ''}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {onTogglePin && (
          <button
            type="button"
            onClick={onTogglePin}
            title={isPinned ? '取消置頂' : '固定視窗 (失焦不關閉)'}
            style={{
              background: 'transparent',
              border: 'none',
              color: isPinned ? 'var(--text-gold)' : '#7a8290',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            {isPinned ? <Pin size={15} /> : <PinOff size={15} />}
          </button>
        )}
        <button
          type="button"
          onClick={onOpenOfficialTrade}
          title="開啟官方市集搜尋"
          aria-label="官方市集"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-gold)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex'
          }}
        >
          <ExternalLink size={15} />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="關閉懸浮卡片 (Esc)"
          aria-label="關閉"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a0a8b4',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
