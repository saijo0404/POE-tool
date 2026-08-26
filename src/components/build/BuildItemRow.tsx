import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import type { PricedItem } from '../../domain/build/types';
import { RARITY_COLORS, CONFIDENCE_LABELS, SLOT_LABELS } from '../../domain/build/constants';
import { getImageUrl } from '../../utils/image';
import { ItemTooltip } from '../common/ItemTooltip';

interface BuildItemRowProps {
  item: PricedItem;
  index: number;
  isSyncing?: boolean;
  onSyncLivePrice?: (item: PricedItem) => void;
  onOpenTrade: (item: PricedItem) => void;
}

export const BuildItemRow: React.FC<BuildItemRowProps> = ({
  item,
  index: _index,
  isSyncing,
  onSyncLivePrice,
  onOpenTrade,
}) => {
  const rarityColor = RARITY_COLORS[item.rarity] || '#c8c8c8';
  const conf = CONFIDENCE_LABELS[item.confidence] || CONFIDENCE_LABELS.medium;
  const slotText = item.slot ? (SLOT_LABELS[item.slot] || item.slot) : null;

  const tooltipItem = {
    name: item.name,
    typeLine: item.typeLine,
    rarity: item.rarity,
    itemClass: item.category === 'equipment' ? (SLOT_LABELS[item.slot || ''] || item.slot) : undefined,
    ilvl: item.ilvl,
    quality: item.quality || item.gemQuality,
    corrupted: item.corrupted,
    sockets: item.sockets,
    implicitMods: item.implicitMods,
    explicitMods: item.explicitMods,
    craftedMods: item.craftedMods,
    fracturedMods: item.fracturedMods,
    enchantMods: item.enchantMods,
    properties: item.properties || (
      [
        item.gemLevel ? { name: '等級', values: [[String(item.gemLevel), 0]] as [string, number][] } : null,
        item.gemQuality ? { name: '品質', values: [[`+${item.gemQuality}%`, 0]] as [string, number][] } : null,
        item.propertyEnergyShield ? { name: '能量護盾', values: [[String(item.propertyEnergyShield), 0]] as [string, number][] } : null,
        item.propertyArmour ? { name: '護甲', values: [[String(item.propertyArmour), 0]] as [string, number][] } : null,
        item.propertyEvasion ? { name: '閃避值', values: [[String(item.propertyEvasion), 0]] as [string, number][] } : null,
      ].filter(Boolean) as { name: string; values: [string, number][] }[]
    )
  };

  return (
    <div
      className="poe-table-row"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <ItemTooltip item={tooltipItem}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <img
              src={getImageUrl(item.icon)}
              alt={item.name || item.typeLine}
              style={{ width: '36px', height: '36px', objectFit: 'contain', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', border: '1px solid rgba(200,170,110,0.2)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: rarityColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name || item.typeLine}
                </span>
                {slotText && (
                  <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                    {slotText}
                  </span>
                )}
                {item.isLivePrice && (
                  <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    官方現貨
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                {item.details || item.typeLine}
              </span>
            </div>
          </div>
        </ItemTooltip>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', border: `1px solid ${conf.color}`, color: conf.color }}>
          {conf.text}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '85px' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-gold)', fontFamily: 'Cinzel, serif' }}>
            {item.priceDivine > 0 ? `${item.priceDivine} div` : `${item.priceChaos} c`}
          </span>
          {item.priceDivine > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              ({item.priceChaos.toLocaleString()} c)
            </span>
          )}
        </div>

        {item.tradeQueryJson && onSyncLivePrice && (
          <button
            type="button"
            className="poe-button-secondary"
            disabled={isSyncing}
            onClick={() => onSyncLivePrice(item)}
            style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-gold)' }}
            title="向官方市集查詢即時現貨底價"
          >
            {isSyncing ? <RefreshCw size={12} className="spin" /> : <RefreshCw size={12} />} 同步現貨
          </button>
        )}

        {(item.tradeSearchUrl || item.tradeQueryJson) && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={() => onOpenTrade(item)}
            style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="在官方市集開啟搜尋此物品"
          >
            <ExternalLink size={12} /> Trade
          </button>
        )}
      </div>
    </div>
  );
};
