import React from 'react';
import { Award, Clock, DollarSign, Zap, TrendingUp } from 'lucide-react';
import type { MappingSessionStats } from '../../domain/mapping/types';
import { formatDuration } from '../../domain/mapping/mappingExport';
import { Card } from '../ui';

interface MappingSummaryCardProps {
  stats: MappingSessionStats;
}

export const MappingSummaryCard: React.FC<MappingSummaryCardProps> = ({ stats }) => {
  const isProfitPositive = stats.totalNetProfitChaos >= 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        width: '100%'
      }}
    >
      <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem' }}>已完成場次</span>
          <Award size={18} color="var(--text-gold)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-gold)' }}>
          {stats.totalRuns} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>場</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          平均單場耗時: <strong style={{ color: '#fff' }}>{formatDuration(stats.avgDurationSeconds)}</strong>
        </div>
      </Card>

      <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem' }}>累積總刷圖時間</span>
          <Clock size={18} color="#61afef" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#61afef' }}>
          {formatDuration(stats.totalDurationSeconds)}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          總門票成本: {stats.totalCostDivine} Div ({stats.totalCostChaos}c)
        </div>
      </Card>

      <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem' }}>累積淨利潤 (Net Profit)</span>
          <DollarSign size={18} color={isProfitPositive ? '#98c379' : '#e06c75'} />
        </div>
        <div
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: isProfitPositive ? '#98c379' : '#e06c75'
          }}
        >
          {isProfitPositive ? '+' : ''}
          {stats.totalNetProfitDivine} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Div</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          折合 {stats.totalNetProfitChaos} Chaos (毛利 {stats.totalRevenueDivine} Div)
        </div>
      </Card>

      <Card variant="elevated" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-gold)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>純刷圖時薪 (Active Div/hr)</span>
          <Zap size={18} color="var(--text-gold)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-gold)' }}>
          {stats.activeMappingDivPerHour} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Div/hr</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          折合 {stats.activeMappingChaosPerHour} c/hr (依純戰鬥時間)
        </div>
      </Card>

      <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem' }}>含整備總時薪 (Total Div/hr)</span>
          <TrendingUp size={18} color="#e5c07b" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e5c07b' }}>
          {stats.sessionTotalDivPerHour} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Div/hr</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          包含藏身處整備與放貨時間
        </div>
      </Card>
    </div>
  );
};
