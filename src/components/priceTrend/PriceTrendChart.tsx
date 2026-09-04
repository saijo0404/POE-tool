import React, { useState } from 'react';
import type { AssetTrend, PricePoint } from '../../domain/priceTrend/types';
import { formatTrendPercentage } from '../../domain/priceTrend/trendCalculator';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PriceTrendChartProps {
  asset: AssetTrend;
  currencyMode: 'chaos' | 'divine';
  onToggleCurrency: (mode: 'chaos' | 'divine') => void;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  asset,
  currencyMode,
  onToggleCurrency
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  const values = asset.history.map(h => (currencyMode === 'divine' ? h.priceDivine : h.priceChaos));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const w = 600;
  const h = 260;
  const padX = 50;
  const padY = 35;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const stepX = chartW / (values.length - 1);
  const coordinates = values.map((val, idx) => {
    const x = padX + idx * stepX;
    const y = padY + chartH - ((val - min) / range) * chartH;
    return { x, y, point: asset.history[idx], val };
  });

  const polylinePoints = coordinates.map(c => `${c.x},${c.y}`).join(' ');
  const polygonPoints = `${padX},${padY + chartH} ${polylinePoints} ${padX + chartW},${padY + chartH}`;
  const isUp = asset.change7dPercent >= 0;
  const strokeColor = isUp ? 'var(--accent-green)' : 'var(--accent-red)';
  const currPrice = currencyMode === 'divine' ? asset.currentPriceDivine : asset.currentPriceChaos;
  const currUnit = currencyMode === 'divine' ? 'Divine (D)' : 'Chaos (C)';

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {asset.icon && <img src={asset.icon} alt={asset.name} style={{ width: '38px', height: '38px', objectFit: 'contain' }} />}
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-bright)' }}>{asset.name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>7 天走勢分析與歷史行情折線圖</span>
          </div>
        </div>

        {/* Currency Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-dark)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={() => onToggleCurrency('divine')} className={currencyMode === 'divine' ? 'poe-button' : 'poe-button-secondary'} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>Divine</button>
          <button type="button" onClick={() => onToggleCurrency('chaos')} className={currencyMode === 'chaos' ? 'poe-button' : 'poe-button-secondary'} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>Chaos</button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>當前參考價格</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-gold)', marginTop: '2px' }}>{currPrice} <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>{currUnit}</span></div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {asset.change24hPercent >= 0 ? <TrendingUp size={13} color="var(--accent-green)" /> : <TrendingDown size={13} color="var(--accent-red)" />}
            24 小時漲跌
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: asset.change24hPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '2px' }}>
            {formatTrendPercentage(asset.change24hPercent)}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={13} color="var(--accent-blue)" /> 7 天累積漲跌
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isUp ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '2px' }}>
            {formatTrendPercentage(asset.change7dPercent)}
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', maxHeight: '280px', display: 'block' }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={polygonPoints} fill="url(#priceGrad)" />
          <polyline fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />

          {/* Points & Hover Target */}
          {coordinates.map((c, i) => (
            <g key={c.point.timestamp} onMouseEnter={() => setHoveredPoint(c.point)} onMouseLeave={() => setHoveredPoint(null)}>
              <circle cx={c.x} cy={c.y} r={hoveredPoint === c.point ? 5 : 3.5} fill={strokeColor} stroke="var(--bg-card)" strokeWidth="2" style={{ cursor: 'pointer', transition: 'r 0.15s' }} />
              <text x={c.x} y={padY + chartH + 18} fill="var(--text-muted)" fontSize="10" textAnchor="middle">{c.point.dateLabel}</text>
              <text x={c.x} y={c.y - 8} fill="var(--text-bright)" fontSize="9.5" textAnchor="middle" opacity={i === coordinates.length - 1 || hoveredPoint === c.point ? 1 : 0.65}>
                {c.val}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
