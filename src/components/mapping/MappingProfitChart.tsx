import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { MapRun } from '../../domain/mapping/types';

interface MappingProfitChartProps {
  runs: MapRun[];
}

interface ChartDataPoint {
  name: string;
  runNumber: number;
  cumulativeProfitDivine: number;
  cumulativeProfitChaos: number;
  runNetProfitDivine: number;
  runDurationSeconds: number;
}

export const MappingProfitChart: React.FC<MappingProfitChartProps> = ({ runs }) => {
  const chartData = useMemo(() => {
    if (!runs || runs.length === 0) return [];
    // Sort runs chronologically for chart display
    const sorted = [...runs].sort((a, b) => a.runNumber - b.runNumber);
    let runningDivine = 0;
    let runningChaos = 0;

    return sorted.map((r): ChartDataPoint => {
      runningDivine = Math.round((runningDivine + r.netProfitDivine) * 100) / 100;
      runningChaos = Math.round((runningChaos + r.netProfitChaos) * 100) / 100;

      return {
        name: `#${r.runNumber}`,
        runNumber: r.runNumber,
        cumulativeProfitDivine: runningDivine,
        cumulativeProfitChaos: runningChaos,
        runNetProfitDivine: r.netProfitDivine,
        runDurationSeconds: r.durationSeconds
      };
    });
  }, [runs]);

  if (chartData.length < 2) {
    return null;
  }

  return (
    <div className="poe-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gold)' }}>
          <TrendingUp size={18} />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', margin: 0 }}>
            刷圖累積淨利潤走勢 (Cumulative Net Profit Trend)
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          即時根據每場門票投入與掉落增量繪製
        </span>
      </div>

      <div style={{ width: '100%', height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
            <YAxis
              yAxisId="left"
              stroke="#98c379"
              fontSize={12}
              tickFormatter={v => `${v} Div`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121620',
                border: '1px solid rgba(200, 170, 110, 0.4)',
                borderRadius: '6px',
                fontSize: '0.82rem'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.82rem', paddingTop: '10px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cumulativeProfitDivine"
              name="累積淨利潤 (Divine)"
              stroke="#98c379"
              strokeWidth={3}
              dot={{ r: 4, fill: '#98c379' }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="runNetProfitDivine"
              name="單場淨利潤 (Divine)"
              stroke="var(--text-gold)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: 'var(--text-gold)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
