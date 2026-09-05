import React from 'react';
import type { TujenHaggleAdvice } from '../../../domain/expedition/types';

interface TujenHaggleSectionProps {
  askingPrice: number;
  onAskingPriceChange: (v: number) => void;
  advice: TujenHaggleAdvice;
}

export const TujenHaggleSection: React.FC<TujenHaggleSectionProps> = ({
  askingPrice,
  onAskingPriceChange,
  advice,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label style={{ fontSize: '12px', color: '#8b949e' }}>圖貞開價文物數量:</label>
      <input
        type="number"
        value={askingPrice}
        onChange={(e) => onAskingPriceChange(Number(e.target.value) || 0)}
        style={{
          width: '90px',
          padding: '4px 8px',
          background: '#0d1117',
          border: '1px solid #30363d',
          color: '#fff',
          borderRadius: '4px',
        }}
      />
      <span style={{ fontSize: '11px', color: '#3fb950' }}>
        (預估省下 {advice.estimatedSavings} 文物 / 節省 {advice.savingsPercent}%)
      </span>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      <OfferCard
        title="首出安全出價 (52%)"
        amount={advice.firstOfferSafe}
        color="#3fb950"
        desc="成交率高且極低機率直接沒收"
      />
      <OfferCard
        title="首出進取出價 (45%)"
        amount={advice.firstOfferAggressive}
        color="#e3b341"
        desc="追求極限省文物，偶有皺眉風險"
      />
      <OfferCard
        title="二出回價 (68%)"
        amount={advice.secondCounterOffer}
        color="#58a6ff"
        desc="若首出被拒，拉至此處穩拿"
      />
    </div>

    <div
      style={{
        padding: '8px 10px',
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '4px',
        color: '#8b949e',
        fontSize: '11px',
      }}
    >
      💡 <strong style={{ color: '#c9d1d9' }}>談判指引:</strong> {advice.tipZh}
    </div>
  </div>
);

const OfferCard: React.FC<{
  title: string;
  amount: number;
  color: string;
  desc: string;
}> = ({ title, amount, color, desc }) => (
  <div
    style={{
      padding: '8px',
      background: '#0d1117',
      borderRadius: '4px',
      border: '1px solid #21262d',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '11px', color: '#8b949e' }}>{title}</div>
    <div style={{ fontSize: '18px', fontWeight: 'bold', color, margin: '4px 0' }}>
      {amount} <span style={{ fontSize: '11px' }}>文物</span>
    </div>
    <div style={{ fontSize: '10px', color: '#8b949e' }}>{desc}</div>
  </div>
);
