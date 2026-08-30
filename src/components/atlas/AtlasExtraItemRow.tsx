import React from 'react';
import type { AtlasTierExtraItem, ExtraItemCategory } from '../../domain/atlas/types';
import { resolveExtraItemPrice } from '../../domain/atlas/atlasHelpers';
import { Trash2, Lock } from 'lucide-react';

interface AtlasExtraItemRowProps {
  item: AtlasTierExtraItem;
  ninjaRates: Record<string, number>;
  divineRate: number;
  onUpdate: (id: string, updates: Partial<AtlasTierExtraItem>) => void;
  onRemove: (id: string) => void;
}

const CATEGORY_LABELS: Record<ExtraItemCategory, { label: string; color: string }> = {
  craft: { label: '地圖工藝', color: '#f59e0b' },
  map: { label: '地圖基底', color: '#38bdf8' },
  delirium: { label: '瞻妄玉', color: '#a855f7' },
  currency: { label: '通貨耗材', color: '#aa9e82' },
  fragment: { label: '額外碎片', color: '#22c55e' },
  other: { label: '其他自訂', color: '#94a3b8' }
};

export const AtlasExtraItemRow: React.FC<AtlasExtraItemRowProps> = ({
  item,
  ninjaRates,
  divineRate,
  onUpdate,
  onRemove
}) => {
  const isCraft = item.category === 'craft';
  const unitPrice = resolveExtraItemPrice(item, ninjaRates, divineRate);
  const count = isCraft ? 1 : (item.count || 1);
  const totalItemCost = Math.round(count * unitPrice * 10) / 10;
  const catInfo = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '8px 12px',
        background: isCraft ? 'rgba(245, 158, 11, 0.05)' : 'rgba(0, 0, 0, 0.3)',
        border: isCraft ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(200, 170, 110, 0.18)',
        borderRadius: '6px'
      }}
    >
      {/* Left: Item Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
        <span style={{
          fontSize: '0.72rem',
          padding: '2px 6px',
          borderRadius: '4px',
          background: `${catInfo.color}22`,
          color: catInfo.color,
          border: `1px solid ${catInfo.color}55`,
          whiteSpace: 'nowrap'
        }}>
          {catInfo.label}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' }}>
            {item.name}
          </div>
          {item.nameEn && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              {item.nameEn}
            </div>
          )}
        </div>
      </div>

      {/* Center: Count Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>單場用量：</span>
        {isCraft ? (
          <div
            title="地圖工藝單場固定消耗 1 次"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: 'var(--text-gold)',
              fontWeight: 600
            }}
          >
            <Lock size={12} /> 1 次 (固定)
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(200, 170, 110, 0.3)', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => onUpdate(item.id, { count: Math.max((item.count || 1) - 1, 1) })}
              style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
            >
              -
            </button>
            <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-gold)' }}>
              {item.count || 1}
            </span>
            <button
              type="button"
              onClick={() => onUpdate(item.id, { count: (item.count || 1) + 1 })}
              style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Right: Unit Price & Subtotal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>單價</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <input
              type="number"
              min="0"
              step="0.5"
              className="poe-input"
              value={item.unitPriceChaos}
              onChange={e => onUpdate(item.id, { unitPriceChaos: parseFloat(e.target.value) || 0 })}
              style={{ width: '55px', height: '24px', padding: '0 4px', fontSize: '0.78rem', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>C</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '70px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>小計</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-gold)' }}>
            {totalItemCost} C
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
          title="移除此項目"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
