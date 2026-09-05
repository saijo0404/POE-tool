import React from 'react';
import type { OilArbitrageResult } from '../../domain/blight/types';
import { BLIGHT_OILS } from '../../domain/blight/blightData';

interface BlightArbitrageSectionProps {
  arbitrageList: OilArbitrageResult[];
  onUpdatePrice: (oilId: string, price: number) => void;
}

export const BlightArbitrageSection: React.FC<BlightArbitrageSectionProps> = ({
  arbitrageList,
  onUpdatePrice,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ color: '#8b949e', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
      <span>3:1 升級路徑 (低階 ➔ 高階)</span>
      <span>3x 成本 vs 產出 ➔ 淨利</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
      {arbitrageList.map((item) => {
        const fromOil = BLIGHT_OILS.find((o) => o.id === item.fromOilId);
        const toOil = BLIGHT_OILS.find((o) => o.id === item.toOilId);
        return (
          <ArbitrageRow
            key={`${item.fromOilId}_${item.toOilId}`}
            fromName={fromOil?.nameZh ?? item.fromOilId}
            toName={toOil?.nameZh ?? item.toOilId}
            item={item}
            onUpdateFromPrice={(v) => onUpdatePrice(item.fromOilId, v)}
            onUpdateToPrice={(v) => onUpdatePrice(item.toOilId, v)}
          />
        );
      })}
    </div>
  </div>
);

interface ArbitrageRowProps {
  fromName: string;
  toName: string;
  item: OilArbitrageResult;
  onUpdateFromPrice: (v: number) => void;
  onUpdateToPrice: (v: number) => void;
}

const ArbitrageRow: React.FC<ArbitrageRowProps> = ({
  fromName,
  toName,
  item,
  onUpdateFromPrice,
  onUpdateToPrice,
}) => (
  <div
    style={{
      padding: '6px 8px',
      background: '#0d1117',
      borderRadius: '4px',
      border: '1px solid #21262d',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
    }}
  >
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span>{fromName}</span>
      <input
        type="number"
        value={item.fromOilPriceChaos}
        onChange={(e) => onUpdateFromPrice(Number(e.target.value) || 0)}
        style={{ width: '45px', padding: '1px 3px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '3px', fontSize: '11px' }}
      />
      <span style={{ color: '#8b949e' }}>➔</span>
      <span>{toName}</span>
      <input
        type="number"
        value={item.toOilPriceChaos}
        onChange={(e) => onUpdateToPrice(Number(e.target.value) || 0)}
        style={{ width: '45px', padding: '1px 3px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '3px', fontSize: '11px' }}
      />
    </div>

    <div style={{ textAlign: 'right' }}>
      <span style={{ color: '#8b949e', marginRight: '6px', fontSize: '11px' }}>
        成本 {Number(item.threeToOneCostChaos.toFixed(1))}C
      </span>
      <span style={{ color: item.arbitrageProfitChaos > 0 ? '#3fb950' : item.arbitrageProfitChaos < 0 ? '#f85149' : '#8b949e', fontWeight: 'bold' }}>
        {item.arbitrageProfitChaos > 0 ? `+${item.arbitrageProfitChaos}` : item.arbitrageProfitChaos} C
      </span>
      <RecommendationBadge rec={item.recommendation} />
    </div>
  </div>
);

const RecommendationBadge: React.FC<{ rec: OilArbitrageResult['recommendation'] }> = ({ rec }) => {
  const isUp = rec === 'upgrade';
  const isSell = rec === 'sell_raw';
  const color = isUp ? '#3fb950' : isSell ? '#f85149' : '#8b949e';
  const text = isUp ? '升級' : isSell ? '生賣' : '持平';

  return (
    <span
      style={{
        marginLeft: '6px',
        padding: '1px 5px',
        borderRadius: '3px',
        background: isUp ? '#1b4725' : isSell ? '#4d1e1c' : '#21262d',
        color,
        fontSize: '10px',
      }}
    >
      {text}
    </span>
  );
};
