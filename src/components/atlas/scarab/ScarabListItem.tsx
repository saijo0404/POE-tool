import React, { useState } from 'react';
import type { AtlasTierScarab } from '../../../domain/atlas/types';
import { resolveScarabPrice } from '../../../domain/atlas/atlasHelpers';
import { Trash2, Zap } from 'lucide-react';

interface ScarabListItemProps {
  scarab: AtlasTierScarab;
  ninjaRates: Record<string, number>;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AtlasTierScarab>) => void;
}

export const ScarabListItem: React.FC<ScarabListItemProps> = ({
  scarab,
  ninjaRates,
  onRemove,
  onUpdate
}) => {
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');

  const unitPrice = resolveScarabPrice(scarab, ninjaRates);
  const totalItemCost = Math.round((scarab.count || 0) * unitPrice * 10) / 10;
  const hasLiveRate = scarab.nameEn && ninjaRates[scarab.nameEn] !== undefined;

  const handleStartEditPrice = () => {
    setIsEditingPrice(true);
    setCustomPriceInput(String(unitPrice));
  };

  const handleSavePrice = () => {
    const num = parseFloat(customPriceInput);
    if (!isNaN(num) && num >= 0) {
      onUpdate(scarab.id, { customPriceChaos: num });
    }
    setIsEditingPrice(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(200, 170, 110, 0.18)',
        borderRadius: '6px'
      }}
    >
      {/* Left: Scarab Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(200, 170, 110, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
          }}
        >
          🪲
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' }}>{scarab.name}</div>
          {scarab.nameEn && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{scarab.nameEn}</div>
          )}
        </div>
      </div>

      {/* Center: Count Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>數量：</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(200, 170, 110, 0.3)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <button
            type="button"
            onClick={() => onUpdate(scarab.id, { count: Math.max((scarab.count || 1) - 1, 1) })}
            style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
          >
            -
          </button>
          <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-gold)' }}>
            {scarab.count || 1}
          </span>
          <button
            type="button"
            onClick={() => onUpdate(scarab.id, { count: Math.min((scarab.count || 1) + 1, 4) })}
            style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
          >
            +
          </button>
        </div>
      </div>

      {/* Right: Unit Price & Subtotal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            {hasLiveRate && (
              <span title="poe.ninja 即時市價" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Zap size={11} color="#f59e0b" />
              </span>
            )}
            單價：
          </div>
          {isEditingPrice ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number"
                className="poe-input"
                value={customPriceInput}
                onChange={e => setCustomPriceInput(e.target.value)}
                style={{ width: '60px', height: '24px', padding: '0 4px', fontSize: '0.78rem' }}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSavePrice(); }}
              />
              <button
                type="button"
                className="poe-button"
                onClick={handleSavePrice}
                style={{ padding: '0 4px', height: '24px', fontSize: '0.72rem' }}
              >
                OK
              </button>
            </div>
          ) : (
            <span
              onClick={handleStartEditPrice}
              style={{
                fontSize: '0.84rem',
                color: '#e2e8f0',
                cursor: 'pointer',
                textDecoration: 'underline dotted rgba(200, 170, 110, 0.5)'
              }}
              title="點擊自訂單價"
            >
              {unitPrice} C
            </span>
          )}
        </div>

        <div style={{ textAlign: 'right', minWidth: '70px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>小計</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-gold)' }}>
            {totalItemCost} C
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(scarab.id)}
          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
          title="移除此甲蟲"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
