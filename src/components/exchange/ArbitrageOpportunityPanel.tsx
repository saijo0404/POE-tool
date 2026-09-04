import React from 'react';
import { Flame, ArrowRight, ExternalLink } from 'lucide-react';
import { poeApi } from '../../services/api';
import type { ArbitrageOpportunity } from '../../domain/exchange/types';

interface ArbitrageOpportunityPanelProps {
  opportunities: ArbitrageOpportunity[];
  league: string;
}

export const ArbitrageOpportunityPanel: React.FC<ArbitrageOpportunityPanelProps> = ({
  opportunities,
  league,
}) => {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color="#e74c3c" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#ff6b6b', fontWeight: 600 }}>
            跨市場價差套利機會 (Faustus 交易所 vs 官方市集直購)
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            即時偵測具備利潤空間的大宗物資
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '10px' }}>
        {opportunities.slice(0, 4).map((opp) => (
          <ArbitrageCard key={opp.itemId} opp={opp} league={league} />
        ))}
      </div>
    </div>
  );
};

const ArbitrageCard: React.FC<{ opp: ArbitrageOpportunity; league: string }> = ({ opp, league }) => {
  const isFaustusBuy = opp.direction === 'BUY_FAUSTUS_SELL_TRADE';

  const handleOpenTrade = async () => {
    try {
      const queryJson = JSON.stringify({
        query: {
          status: { option: 'online' },
          type: opp.itemName,
        },
      });
      await poeApi.createTradeSearchUrl(league, queryJson);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#10141e',
        border: '1px solid rgba(231, 76, 60, 0.3)',
        borderRadius: '6px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {opp.icon && (
            <img src={opp.icon} alt={opp.itemName} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          )}
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-gold)' }}>
              {opp.itemNameZh || opp.itemName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opp.itemName}</div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            color: '#2ecc71',
            border: '1px solid rgba(46, 204, 113, 0.4)',
          }}
        >
          +{opp.roiPercent}% ROI
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '6px 8px',
          borderRadius: '4px',
          fontSize: '0.78rem',
        }}
      >
        <div style={{ color: isFaustusBuy ? '#3498db' : '#f39c12' }}>
          {isFaustusBuy ? 'Faustus 買入' : '市集直購買入'}: <strong>{isFaustusBuy ? opp.faustusPriceChaos : opp.tradePriceChaos}c</strong>
        </div>
        <ArrowRight size={14} color="var(--text-muted)" />
        <div style={{ color: isFaustusBuy ? '#f39c12' : '#3498db' }}>
          {isFaustusBuy ? '市集賣出' : 'Faustus 賣出'}: <strong>{isFaustusBuy ? opp.tradePriceChaos : opp.faustusPriceChaos}c</strong>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          單件淨利: <strong style={{ color: '#2ecc71' }}>+{opp.profitChaos}c</strong> ({opp.profitDivine} div)
        </span>
        <button
          type="button"
          onClick={handleOpenTrade}
          className="poe-button-secondary"
          style={{ padding: '2px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          市集查詢 <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
};
