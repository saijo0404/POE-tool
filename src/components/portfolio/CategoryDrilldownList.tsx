import React from 'react';
import type { CategoryAllocation } from '../../domain/portfolio/types';
import { Layers } from 'lucide-react';

interface CategoryDrilldownListProps {
  allocation?: CategoryAllocation;
  currencyMode: 'chaos' | 'divine';
}

export const CategoryDrilldownList: React.FC<CategoryDrilldownListProps> = ({
  allocation,
  currencyMode
}) => {
  if (!allocation) {
    return (
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
        點選左側圓餅圖或品類查看細項
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className="poe-font" style={{ margin: 0, fontSize: '1.05rem', color: allocation.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} /> {allocation.label} 細項鑽取排行
        </h3>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>共 {allocation.itemCount} 項物資</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
        {allocation.topItems.map((item, idx) => {
          const val = currencyMode === 'divine' ? `${item.totalPriceDivine} D` : `${item.totalPriceChaos.toLocaleString()} C`;
          const share = Math.round(((item.totalPriceChaos || 0) / (allocation.totalChaos || 1)) * 100);

          return (
            <div
              key={`${item.id}-${idx}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 10px', backgroundColor: 'var(--bg-panel)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.icon && <img src={item.icon} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />}
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>{item.name || item.typeLine}</span>
                  {item.stackSize && item.stackSize > 1 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>x{item.stackSize}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-gold)' }}>{val}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', minWidth: '32px', textAlign: 'right' }}>{share}%</span>
                </div>
              </div>
              <div style={{ width: '100%', height: '3px', backgroundColor: 'var(--bg-dark)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${share}%`, height: '100%', backgroundColor: allocation.color, borderRadius: '2px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
