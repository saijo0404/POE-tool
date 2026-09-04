import React, { useState } from 'react';
import { ArrowRightLeft, Coins } from 'lucide-react';
import { createCurrencyConversionMatrix } from '../../domain/exchange/conversionMatrix';
import type { CurrencyKey, CurrencyRates } from '../../domain/exchange/types';

interface CurrencyMatrixWidgetProps {
  rates: CurrencyRates;
}

export const CurrencyMatrixWidget: React.FC<CurrencyMatrixWidgetProps> = ({ rates }) => {
  const [baseCurrency, setBaseCurrency] = useState<CurrencyKey>('divine');
  const [amount, setAmount] = useState<number>(1);

  const matrix = createCurrencyConversionMatrix(amount, baseCurrency, rates);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 34, 0.95) 0%, rgba(13, 16, 24, 0.95) 100%)',
        border: '1px solid rgba(200, 170, 110, 0.25)',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowRightLeft size={18} color="var(--text-gold)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-gold)', fontWeight: 600 }}>
            跨幣種即時折算矩陣 (Chaos ➔ Divine ➔ Mirror)
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(['chaos', 'divine', 'mirror', 'exalted'] as CurrencyKey[]).map((cur) => (
            <button
              key={cur}
              type="button"
              onClick={() => setBaseCurrency(cur)}
              className={baseCurrency === cur ? 'poe-button' : 'poe-button-secondary'}
              style={{ padding: '3px 8px', fontSize: '0.78rem', textTransform: 'capitalize' }}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div style={{ flex: '0 0 140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            基準數量 ({baseCurrency.toUpperCase()})
          </label>
          <input
            type="number"
            min="0"
            step={baseCurrency === 'mirror' ? '0.01' : '1'}
            value={amount || ''}
            onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', flex: 1 }}>
          <RateBox label="混沌石 (Chaos)" value={`${matrix.conversions.chaos.toLocaleString()} c`} isBase={baseCurrency === 'chaos'} />
          <RateBox label="神聖石 (Divine)" value={`${matrix.conversions.divine.toLocaleString()} div`} isBase={baseCurrency === 'divine'} />
          <RateBox label="卡蘭德魔鏡 (Mirror)" value={`${matrix.conversions.mirror < 0.001 && matrix.conversions.mirror > 0 ? matrix.conversions.mirror.toFixed(5) : matrix.conversions.mirror.toFixed(3)} mir`} isBase={baseCurrency === 'mirror'} />
          <RateBox label="崇高石 (Exalted)" value={`${matrix.conversions.exalted.toLocaleString()} ex`} isBase={baseCurrency === 'exalted'} />
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Coins size={14} color="#f39c12" />
        <span>Faustus 掛單金幣手續費預估：約 <strong style={{ color: '#f1c40f' }}>{matrix.goldFeeEstimate.toLocaleString()}</strong> 金幣</span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }}>匯率基準: 1 Div = {rates.divineChaosRate}c | 1 Mir = {(rates.mirrorChaosRate / rates.divineChaosRate).toFixed(0)} Div</span>
      </div>
    </div>
  );
};

const RateBox: React.FC<{ label: string; value: string; isBase: boolean }> = ({ label, value, isBase }) => (
  <div
    style={{
      backgroundColor: isBase ? 'rgba(200, 170, 110, 0.15)' : 'rgba(0, 0, 0, 0.3)',
      border: `1px solid ${isBase ? 'rgba(200, 170, 110, 0.5)' : 'rgba(255, 255, 255, 0.07)'}`,
      borderRadius: '6px',
      padding: '8px 10px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '0.72rem', color: isBase ? 'var(--text-gold)' : 'var(--text-muted)', marginBottom: '2px' }}>
      {label}
    </div>
    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isBase ? '#fff' : 'rgba(255,255,255,0.9)' }}>
      {value}
    </div>
  </div>
);
