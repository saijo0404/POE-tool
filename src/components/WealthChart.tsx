import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { WealthSnapshot } from '../types/poe';
import { Calendar, TrendingUp } from 'lucide-react';

interface WealthChartProps {
  snapshots: WealthSnapshot[];
}

type TimeRangeOption = '24h' | '3d' | '7d' | 'all';

export const WealthChart: React.FC<WealthChartProps> = ({ snapshots }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('24h');

  // Filter snapshots by selected time range
  const filteredSnapshots = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return [];
    if (timeRange === 'all') return snapshots;

    const now = Date.now();
    const rangeHoursMap: Record<TimeRangeOption, number> = {
      '24h': 24,
      '3d': 72,
      '7d': 168,
      'all': 0
    };

    const cutoff = now - rangeHoursMap[timeRange] * 60 * 60 * 1000;
    const filtered = snapshots.filter(s => new Date(s.timestamp).getTime() >= cutoff);
    return filtered.length > 0 ? filtered : snapshots.slice(-5); // Fallback to last 5 if none in window
  }, [snapshots, timeRange]);

  // Calculate statistics for the selected time range
  const stats = useMemo(() => {
    if (filteredSnapshots.length < 2) {
      return { deltaDivine: 0, deltaChaos: 0, avgHourlyDivine: 0 };
    }
    const first = filteredSnapshots[0];
    const last = filteredSnapshots[filteredSnapshots.length - 1];

    const deltaDivine = Math.round((last.totalDivine - first.totalDivine) * 100) / 100;
    const deltaChaos = Math.round((last.totalChaos - first.totalChaos) * 100) / 100;

    const timeDiffHours = (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / (1000 * 60 * 60);
    const avgHourlyDivine = timeDiffHours > 0.1 ? Math.round((deltaDivine / timeDiffHours) * 100) / 100 : 0;

    return { deltaDivine, deltaChaos, avgHourlyDivine };
  }, [filteredSnapshots]);

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="poe-card" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        暫無歷史資產快照資料
      </div>
    );
  }

  const data = filteredSnapshots.map(s => {
    const d = new Date(s.timestamp);
    const timeStr = timeRange === '24h'
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return {
      time: timeStr,
      divine: s.totalDivine,
      chaos: s.totalChaos,
      hourlyDivine: s.hourlyChangeDivine,
      hourlyChaos: s.hourlyChangeChaos
    };
  });

  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Time Range Controls & Summary Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.9rem' }}>
            <TrendingUp size={16} color="var(--border-gold)" />
            資產成長趨勢曲線
          </div>

          {/* Quick Stats Pill */}
          {filteredSnapshots.length >= 2 && (
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{
                background: stats.deltaDivine >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: stats.deltaDivine >= 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                color: stats.deltaDivine >= 0 ? '#4ade80' : '#f87171'
              }}>
                區間淨利: {stats.deltaDivine >= 0 ? `+${stats.deltaDivine}` : stats.deltaDivine} Div ({stats.deltaChaos >= 0 ? `+${stats.deltaChaos}` : stats.deltaChaos} c)
              </span>
              <span style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                color: 'var(--accent-blue)'
              }}>
                平均產值: {stats.avgHourlyDivine >= 0 ? `+${stats.avgHourlyDivine}` : stats.avgHourlyDivine} Div/hr
              </span>
            </div>
          )}
        </div>

        {/* Time Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#090c10', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Calendar size={13} color="var(--text-muted)" style={{ marginLeft: '6px' }} />
          {(['24h', '3d', '7d', 'all'] as TimeRangeOption[]).map((option) => {
            const labels: Record<TimeRangeOption, string> = {
              '24h': '近24小時',
              '3d': '近3天',
              '7d': '近7天',
              'all': '全部歷史'
            };
            const isSelected = timeRange === option;
            return (
              <button
                key={option}
                onClick={() => setTimeRange(option)}
                style={{
                  background: isSelected ? 'rgba(200, 170, 110, 0.2)' : 'transparent',
                  color: isSelected ? 'var(--text-gold)' : 'var(--text-muted)',
                  border: isSelected ? '1px solid rgba(200, 170, 110, 0.4)' : '1px solid transparent',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                {labels[option]}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Section */}
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="divineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="chaosGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f3d179" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f3d179" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
            <YAxis yAxisId="left" stroke="#38bdf8" fontSize={12} unit=" Div" />
            <YAxis yAxisId="right" orientation="right" stroke="#f3d179" fontSize={12} unit=" c" />
            <Tooltip
              contentStyle={{ backgroundColor: '#101622', borderColor: '#c8aa6e', color: '#fff', borderRadius: '6px' }}
              formatter={(val: any, name: any) => [
                name === 'divine' ? `${val} Divine Orbs` : `${val} Chaos Orbs`,
                name === 'divine' ? '總資產 (神聖石)' : '總資產 (混沌石)'
              ]}
            />
            <Area yAxisId="left" type="monotone" dataKey="divine" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#divineGrad)" name="divine" />
            <Area yAxisId="right" type="monotone" dataKey="chaos" stroke="#f3d179" strokeWidth={2} fillOpacity={1} fill="url(#chaosGrad)" name="chaos" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WealthChart;
