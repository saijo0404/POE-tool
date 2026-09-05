import React, { useState, useMemo } from 'react';
import type { MappingSession } from '../../domain/mapping/types';
import {
  analyzeMappingHistory,
  type MappingHistoryFilter,
  type MappingHistoryAnalytics
} from '../../domain/mapping/mappingAnalytics';
import { BarChart3, Award, Filter, Sparkles } from 'lucide-react';
import { Card } from '../ui';

interface MappingHistoryAnalyticsCardProps {
  sessions: MappingSession[];
  divineRate?: number;
  currentLeague?: string;
}

const TIME_RANGE_OPTIONS: { label: string; value: MappingHistoryFilter['timeRange'] }[] = [
  { label: '全部', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '近 7 天', value: '7days' },
  { label: '近 30 天', value: '30days' }
];

export const MappingHistoryAnalyticsCard: React.FC<MappingHistoryAnalyticsCardProps> = ({
  sessions,
  divineRate = 150,
  currentLeague
}) => {
  const [timeRange, setTimeRange] = useState<MappingHistoryFilter['timeRange']>('all');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');

  const allStrategies = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) {
      if (s.strategyName) set.add(s.strategyName);
    }
    return Array.from(set);
  }, [sessions]);

  const analytics: MappingHistoryAnalytics = useMemo(() => {
    return analyzeMappingHistory(
      sessions,
      {
        timeRange,
        strategyName: selectedStrategy || undefined,
        league: currentLeague
      },
      divineRate
    );
  }, [sessions, timeRange, selectedStrategy, currentLeague, divineRate]);

  return (
    <Card
      variant="subtle"
      padding="md"
      style={{
        color: '#e2e8f0'
      }}
    >
      {/* Header bar & filter controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--text-gold)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-gold)', fontWeight: 600 }}>
            📈 刷圖歷程深度統計與策略回報分析
          </h3>
        </div>

        {/* Time and Strategy Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#0a0d14', borderRadius: '4px', border: '1px solid rgba(200, 170, 110, 0.3)', padding: '2px' }}>
            {TIME_RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeRange(opt.value)}
                style={{
                  background: timeRange === opt.value ? 'rgba(200, 170, 110, 0.3)' : 'transparent',
                  color: timeRange === opt.value ? '#f3d179' : '#8c94a4',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {allStrategies.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} color="#8c94a4" />
              <select
                value={selectedStrategy}
                onChange={e => setSelectedStrategy(e.target.value)}
                style={{
                  background: '#0a0d14',
                  border: '1px solid rgba(200, 170, 110, 0.3)',
                  borderRadius: '4px',
                  color: '#f3d179',
                  padding: '3px 6px',
                  fontSize: '0.72rem'
                }}
              >
                <option value="">所有輿圖策略</option>
                {allStrategies.map(strat => (
                  <option key={strat} value={strat}>{strat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: '#0d121c', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.72rem', color: '#8c94a4', marginBottom: '4px' }}>總刷圖場次</div>
          <div style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 'bold' }}>{analytics.totalRuns} 場</div>
          <div style={{ fontSize: '0.68rem', color: '#8c94a4' }}>共 {analytics.totalSessions} 個 Sessions</div>
        </div>

        <div style={{ background: '#0d121c', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.72rem', color: '#8c94a4', marginBottom: '4px' }}>總累積刷圖時長</div>
          <div style={{ fontSize: '1.15rem', color: '#3498db', fontWeight: 'bold' }}>{analytics.formattedTotalDuration}</div>
          <div style={{ fontSize: '0.68rem', color: '#8c94a4' }}>平均單場 {analytics.formattedAvgRunDuration}</div>
        </div>

        <div style={{ background: '#0d121c', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.72rem', color: '#8c94a4', marginBottom: '4px' }}>總累積淨利潤</div>
          <div style={{ fontSize: '1.15rem', color: analytics.totalNetProfitChaos >= 0 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
            {analytics.totalNetProfitDivine >= 0 ? `+${analytics.totalNetProfitDivine}` : analytics.totalNetProfitDivine} div
          </div>
          <div style={{ fontSize: '0.68rem', color: '#8c94a4' }}>{analytics.totalNetProfitChaos >= 0 ? `+${analytics.totalNetProfitChaos}` : analytics.totalNetProfitChaos} Chaos</div>
        </div>

        <div style={{ background: '#0d121c', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.72rem', color: '#8c94a4', marginBottom: '4px' }}>綜合平均時薪</div>
          <div style={{ fontSize: '1.15rem', color: '#f1c40f', fontWeight: 'bold' }}>{analytics.overallDivPerHour} div/hr</div>
          <div style={{ fontSize: '0.68rem', color: '#8c94a4' }}>單場均利 {analytics.avgProfitPerRunDivine} div</div>
        </div>
      </div>

      {/* Rankings & Strategy Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {/* Top Profitable Runs */}
        <div style={{ background: '#0a0d14', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-gold)', fontWeight: 'bold', marginBottom: '8px' }}>
            <Award size={14} color="#f1c40f" />
            <span>🏆 單場最高回報 Top 3</span>
          </div>
          {analytics.topRuns.length === 0 ? (
            <div style={{ fontSize: '0.72rem', color: '#8c94a4', padding: '6px 0' }}>尚無刷圖紀錄</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {analytics.topRuns.map((r, idx) => (
                <div key={r.runId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: '#0e131d', padding: '4px 6px', borderRadius: '4px' }}>
                  <span style={{ color: idx === 0 ? '#f1c40f' : idx === 1 ? '#e0e0e0' : '#cd7f32', fontWeight: 600 }}>
                    #{idx + 1} {r.strategyName || r.sessionName} (第 {r.runNumber} 場)
                  </span>
                  <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>+{r.netProfitDivine} div</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strategy Performance Breakdown */}
        <div style={{ background: '#0a0d14', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-gold)', fontWeight: 'bold', marginBottom: '8px' }}>
            <Sparkles size={14} color="#3498db" />
            <span>🗺️ 輿圖策略回報對比</span>
          </div>
          {analytics.strategyBreakdown.length === 0 ? (
            <div style={{ fontSize: '0.72rem', color: '#8c94a4', padding: '6px 0' }}>尚無策略數據</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {analytics.strategyBreakdown.map(st => (
                <div key={st.strategyName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', background: '#0e131d', padding: '4px 6px', borderRadius: '4px' }}>
                  <span style={{ color: '#f3d179' }}>{st.strategyName} ({st.runCount}場)</span>
                  <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>+{st.totalNetProfitDivine} div ({st.divinePerHour} div/hr)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
