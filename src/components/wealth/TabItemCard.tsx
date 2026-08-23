import React from 'react';
import type { StashItem } from '../../types/poe';
import { getImageUrl } from '../../utils/image';
import { ItemTooltip } from '../common/ItemTooltip';

interface TabItemCardProps {
  item: StashItem;
}

export const TabItemCard: React.FC<TabItemCardProps> = ({ item }) => {
  return (
    <div
      className="poe-table-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <ItemTooltip item={{ name: item.name, typeLine: item.typeLine }}>
          <img
            src={getImageUrl(item.icon)}
            alt={item.name || item.typeLine}
            style={{ width: '36px', height: '36px', objectFit: 'contain', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', border: '1px solid rgba(200,170,110,0.2)' }}
          />
        </ItemTooltip>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name || item.typeLine}
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
            {item.tabName} · 數量: {item.stackSize || 1}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '75px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>單價</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-bright)' }}>
            {(item.unitPriceChaos || 0).toLocaleString()} c
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '85px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: 500 }}>總價</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-gold)', fontFamily: 'Cinzel, serif' }}>
            {(item.totalPriceChaos || 0).toLocaleString()} c
          </span>
        </div>
      </div>
    </div>
  );
};
