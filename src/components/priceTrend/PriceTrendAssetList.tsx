import React from 'react';
import type { AssetTrend, AssetCategory } from '../../domain/priceTrend/types';
import { formatTrendPercentage, generatePriceSparklinePoints } from '../../domain/priceTrend/trendCalculator';
import { Flame } from 'lucide-react';

interface PriceTrendAssetListProps {
  assets: AssetTrend[];
  selectedId: string;
  onSelect: (id: string) => void;
  categoryFilter: 'all' | AssetCategory;
  onSelectCategory: (cat: 'all' | AssetCategory) => void;
  currencyMode: 'chaos' | 'divine';
}

const CATEGORIES: { id: 'all' | AssetCategory; label: string }[] = [
  { id: 'all', label: '全部資產' },
  { id: 'unique', label: '頂級暗金' },
  { id: 'currency', label: '核心通貨' },
  { id: 'divcard', label: '命運卡' },
  { id: 'essence', label: '大宗精髓' },
  { id: 'scarab', label: '聖甲蟲' }
];

export const PriceTrendAssetList: React.FC<PriceTrendAssetListProps> = ({
  assets,
  selectedId,
  onSelect,
  categoryFilter,
  onSelectCategory,
  currencyMode
}) => {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectCategory(c.id)}
            className={categoryFilter === c.id ? 'poe-button' : 'poe-button-secondary'}
            style={{ padding: '4px 10px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Asset Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '420px', overflowY: 'auto' }}>
        {assets.map(asset => {
          const isSelected = asset.id === selectedId;
          const isUp = asset.change24hPercent >= 0;
          const stroke = isUp ? 'var(--accent-green)' : 'var(--accent-red)';
          const points = generatePriceSparklinePoints(asset.sparkline7d, 64, 20);
          const price = currencyMode === 'divine' ? `${asset.currentPriceDivine} D` : `${asset.currentPriceChaos} C`;

          return (
            <div
              key={asset.id}
              onClick={() => onSelect(asset.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-panel)',
                border: isSelected ? '1px solid var(--border-gold)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {asset.icon && <img src={asset.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />}
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {asset.name}
                    {asset.isVolatile && <span title="24h 劇烈波動"><Flame size={13} color="#f59e0b" /></span>}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-gold)' }}>{price}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="64" height="20" style={{ overflow: 'visible' }}>
                  <polyline fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={points} />
                </svg>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: stroke, minWidth: '55px', textAlign: 'right' }}>
                  {formatTrendPercentage(asset.change24hPercent)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
