import React from 'react';
import type { AtlasCalculationSummary } from '../../domain/atlas/types';
import { Calculator, DollarSign, TrendingUp, Clock, Percent } from 'lucide-react';
import { Card } from '../ui';

interface AtlasCostSummaryCardProps {
  summary: AtlasCalculationSummary;
  divineRate: number;
  onUpdateRevenue: (chaos: number) => void;
  onUpdateMapsPerHour: (speed: number) => void;
}

export const AtlasCostSummaryCard: React.FC<AtlasCostSummaryCardProps> = ({
  summary,
  divineRate,
  onUpdateRevenue,
  onUpdateMapsPerHour
}) => {
  const isProfitable = summary.netProfitChaosPerMap >= 0;

  return (
    <Card
      variant="elevated"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={20} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.15rem', color: 'var(--text-gold)', margin: 0 }}>
            單場刷圖成本與利潤精算 (Cost & Profit Hub)
          </h3>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          參考神聖石匯率: 1 Div = {divineRate} Chaos
        </div>
      </div>

      {/* Input Parameters Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid rgba(200, 170, 110, 0.15)'
      }}>
        {/* Expected Revenue Input */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <DollarSign size={14} /> 預估單場毛收入 (Gross Revenue)：
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="number"
              min="0"
              step="5"
              className="poe-input"
              value={summary.revenueChaosPerMap}
              onChange={e => onUpdateRevenue(parseFloat(e.target.value) || 0)}
              style={{ width: '100px', height: '34px', fontSize: '0.9rem', fontWeight: 600 }}
            />
            <span style={{ fontSize: '0.84rem', color: 'var(--text-gold)' }}>Chaos</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              (~{summary.revenueDivinePerMap} Div)
            </span>
          </div>
        </div>

        {/* Speed / Maps Per Hour Input */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Clock size={14} /> 預期刷圖速度 (Maps / Hour)：
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="number"
              min="1"
              max="60"
              className="poe-input"
              value={summary.mapsPerHour}
              onChange={e => onUpdateMapsPerHour(parseInt(e.target.value) || 15)}
              style={{ width: '80px', height: '34px', fontSize: '0.9rem', fontWeight: 600 }}
            />
            <span style={{ fontSize: '0.84rem', color: '#e2e8f0' }}>張 / 小時</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              (~{Math.round(60 / (summary.mapsPerHour || 15) * 10) / 10} 分鐘/張)
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {/* Card 1: Single Map Cost */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#fca5a5' }}>單場總成本 (Cost / Map)</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ef4444', margin: '4px 0' }}>
            {summary.totalCostChaosPerMap} <span style={{ fontSize: '0.9rem' }}>C</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            甲蟲 {summary.scarabCostChaos}c + 額外 {summary.extraItemCostChaos}c (~{summary.totalCostDivinePerMap} Div)
          </div>
        </div>

        {/* Card 2: Net Profit Per Map */}
        <div style={{
          background: isProfitable ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${isProfitable ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '6px',
          padding: '12px'
        }}>
          <div style={{ fontSize: '0.76rem', color: isProfitable ? '#86efac' : '#fca5a5' }}>
            單場淨利潤 (Net Profit / Map)
          </div>
          <div style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: isProfitable ? '#22c55e' : '#ef4444',
            margin: '4px 0'
          }}>
            {summary.netProfitChaosPerMap > 0 ? `+${summary.netProfitChaosPerMap}` : summary.netProfitChaosPerMap}
            <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>C</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: isProfitable ? '#86efac' : '#fca5a5' }}>
            ~{summary.netProfitDivinePerMap > 0 ? `+${summary.netProfitDivinePerMap}` : summary.netProfitDivinePerMap} Divine
          </div>
        </div>

        {/* Card 3: ROI */}
        <div style={{
          background: 'rgba(243, 209, 121, 0.08)',
          border: '1px solid rgba(243, 209, 121, 0.25)',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Percent size={13} /> 投資回報率 (ROI)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-gold)', margin: '4px 0' }}>
            {summary.roiPercentage > 0 ? `+${summary.roiPercentage}%` : `${summary.roiPercentage}%`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            淨利潤 / 總投入成本
          </div>
        </div>

        {/* Card 4: Estimated Hourly Profit */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <TrendingUp size={13} /> 預估時薪收益 (Hourly Profit)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>
            {summary.hourlyProfitDivine > 0 ? `+${summary.hourlyProfitDivine}` : summary.hourlyProfitDivine}
            <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>Div / hr</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            約 {summary.hourlyProfitChaos} Chaos / 小時 (毛收入 {summary.hourlyRevenueChaos}c)
          </div>
        </div>
      </div>
    </Card>
  );
};
