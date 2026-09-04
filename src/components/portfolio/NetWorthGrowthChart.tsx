import React, { useState } from 'react';
import type { NetWorthPoint } from '../../domain/portfolio/types';
import { TrendingUp, Rocket } from 'lucide-react';

interface NetWorthGrowthChartProps {
  timeline: NetWorthPoint[];
  currencyMode: 'chaos' | 'divine';
  timeframe: '7d' | '30d' | 'all';
  onSelectTimeframe: (tf: '7d' | '30d' | 'all') => void;
}

export const NetWorthGrowthChart: React.FC<NetWorthGrowthChartProps> = ({
  timeline,
  currencyMode,
  timeframe,
  onSelectTimeframe
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<NetWorthPoint | null>(null);

  if (!timeline || timeline.length === 0) {
    return null;
  }

  const values = timeline.map(p => (currencyMode === 'divine' ? p.totalDivine : p.totalChaos));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const w = 700;
  const h = 220;
  const padX = 40;
  const padY = 30;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const stepX = timeline.length > 1 ? chartW / (timeline.length - 1) : chartW;
  const coordinates = timeline.map((p, idx) => {
    const val = currencyMode === 'divine' ? p.totalDivine : p.totalChaos;
    const x = padX + idx * stepX;
    const y = padY + chartH - ((val - min) / range) * chartH;
    return { x, y, point: p, val };
  });

  const polylinePoints = coordinates.map(c => `${c.x},${c.y}`).join(' ');
  const polygonPoints = `${padX},${padY + chartH} ${polylinePoints} ${padX + chartW},${padY + chartH}`;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h3 className="poe-font" style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={16} /> 賽季歷史淨值增長曲線 (Net Worth Growth Timeline)
        </h3>

        <div style={{ display: 'flex', gap: '4px' }}>
          {(['7d', '30d', 'all'] as const).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => onSelectTimeframe(tf)}
              className={timeframe === tf ? 'poe-button' : 'poe-button-secondary'}
              style={{ padding: '2px 8px', fontSize: '0.74rem' }}
            >
              {tf === '7d' ? '7 天' : tf === '30d' ? '30 天' : '全部歷史'}
            </button>
          ))}
        </div>
      </div>

      {hoveredPoint?.leapNote && (
        <div style={{ padding: '6px 10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '4px', color: '#fbbf24', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Rocket size={14} /> {hoveredPoint.leapNote} ({hoveredPoint.dateLabel})
        </div>
      )}

      <div style={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', maxHeight: '220px', display: 'block' }}>
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <polygon points={polygonPoints} fill="url(#growthGrad)" />
          <polyline fill="none" stroke="var(--accent-blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />

          {coordinates.map((c, i) => {
            const isLeap = c.point.isLeapPoint;
            const isHovered = hoveredPoint === c.point;

            return (
              <g key={c.point.timestamp} onMouseEnter={() => setHoveredPoint(c.point)} onMouseLeave={() => setHoveredPoint(null)}>
                {isLeap && (
                  <circle cx={c.x} cy={c.y} r="8" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.8" />
                )}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isLeap ? 5 : isHovered ? 4.5 : 3}
                  fill={isLeap ? '#f59e0b' : 'var(--accent-blue)'}
                  stroke="var(--bg-card)"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                />
                <text x={c.x} y={padY + chartH + 16} fill="var(--text-muted)" fontSize="9.5" textAnchor="middle">{c.point.dateLabel.split(' ')[0]}</text>
                <text x={c.x} y={c.y - 7} fill={isLeap ? '#f59e0b' : 'var(--text-bright)'} fontSize="9" textAnchor="middle" opacity={i === coordinates.length - 1 || isHovered || isLeap ? 1 : 0.6}>
                  {c.val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
