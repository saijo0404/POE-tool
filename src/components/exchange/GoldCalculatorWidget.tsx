import React from 'react';
import { Coins, Sparkles, MapPin } from 'lucide-react';
import type { ExchangeItem, GoldFeeCalculation } from '../../domain/exchange/types';

interface GoldCalculatorWidgetProps {
  selectedItem: ExchangeItem | null;
  items: ExchangeItem[];
  onSelectItem: (item: ExchangeItem) => void;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  calculation: GoldFeeCalculation | null;
}

export const GoldCalculatorWidget: React.FC<GoldCalculatorWidgetProps> = ({
  selectedItem,
  items,
  onSelectItem,
  quantity,
  onChangeQuantity,
  calculation,
}) => {
  if (!selectedItem || !calculation) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 34, 0.95) 0%, rgba(13, 16, 24, 0.95) 100%)',
        border: '1px solid rgba(243, 156, 18, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={18} color="#f1c40f" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f1c40f', fontWeight: 600 }}>
            Faustus 金幣 (Gold) 手續費即時試算機
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: calculation.tier === 'PREMIUM' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(243, 156, 18, 0.2)',
            color: calculation.tier === 'PREMIUM' ? '#e74c3c' : '#f39c12',
            border: '1px solid rgba(243, 156, 18, 0.4)',
          }}
        >
          {calculation.tier} 費率等級
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr 1.2fr', gap: '12px', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            試算通貨物品
          </label>
          <select
            value={selectedItem.id}
            onChange={(e) => {
              const it = items.find((x) => x.id === e.target.value);
              if (it) onSelectItem(it);
            }}
            style={{
              width: '100%',
              padding: '6px 10px',
              backgroundColor: '#0a0d14',
              border: '1px solid rgba(200, 170, 110, 0.3)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          >
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.nameZh ? `${it.nameZh} (${it.name})` : it.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            兌換數量 (Units)
          </label>
          <input
            type="number"
            min="1"
            value={quantity || ''}
            onChange={(e) => onChangeQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{
              width: '100%',
              padding: '6px 10px',
              backgroundColor: '#0a0d14',
              border: '1px solid rgba(200, 170, 110, 0.3)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          />
        </div>

        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
            單件手續費
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1c40f' }}>
            {calculation.goldCostPerUnit.toLocaleString()} 金幣 / 件
          </div>
        </div>

        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(243, 156, 18, 0.1)', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(243, 156, 18, 0.3)' }}>
          <div style={{ fontSize: '0.72rem', color: '#f39c12', marginBottom: '2px' }}>
            總需支付手續費
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1c40f' }}>
            {calculation.totalGoldFee.toLocaleString()} 金幣
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <MapPin size={14} color="#3498db" />
        <span>
          金幣取得成本試算：預估約需刷 <strong style={{ color: '#3498db' }}>{calculation.estimatedMapsToFarm}</strong> 張 T16 地圖（以單場全清平均 25,000 金幣計算）
        </span>
        <Sparkles size={13} color="#2ecc71" style={{ marginLeft: 'auto' }} />
        <span style={{ color: '#2ecc71' }}>PoE 3.25+ 官方黑市大宗交易所標準費率</span>
      </div>
    </div>
  );
};
