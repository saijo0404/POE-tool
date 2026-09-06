import React from 'react';
import { Calculator, Coins } from 'lucide-react';
import type {
  WaystoneRollingCriteria,
  WaystoneRollingForecast,
  WaystoneRollingStrategy
} from '../../domain/waystone/types';

interface WaystoneRollingCardProps {
  criteria: WaystoneRollingCriteria;
  forecast: WaystoneRollingForecast;
  onCriteriaChange: (patch: Partial<WaystoneRollingCriteria>) => void;
  onStrategyChange: (strategy: WaystoneRollingStrategy) => void;
}

const STRATEGIES: Array<{ id: WaystoneRollingStrategy; label: string; desc: string }> = [
  { id: 'alch_scour', label: '點金 + 重鑄 (Alch & Scour)', desc: '常規稀有地圖洗法，追求 65%+ 高掉落數量' },
  { id: 'transmute_aug_regal', label: '蛻變 + 增幅 + 富豪 (Magic/Regal)', desc: '低風險低成本，適合拓荒或保命' },
  { id: 'chaos_spam', label: '混沌直骰 (Chaos Spam)', desc: '快速洗圖，直接重骰整張稀有地圖' }
];

export const WaystoneRollingCard: React.FC<WaystoneRollingCardProps> = ({
  criteria,
  forecast,
  onCriteriaChange,
  onStrategyChange
}) => {
  return (
    <div className="poe-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} /> 洗圖通貨成本期望精算 (Rolling Cost Forecaster)
        </h3>
      </div>

      {/* Strategy Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>選擇洗圖策略：</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {STRATEGIES.map(st => {
            const isActive = forecast.strategy === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onStrategyChange(st.id)}
                className={isActive ? 'poe-button' : 'poe-button-secondary'}
                style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  borderRadius: '6px',
                  border: isActive ? '1px solid var(--text-gold)' : '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{st.label}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '2px' }}>{st.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Criteria Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '6px' }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            最高容忍危險度：
          </label>
          <select
            className="poe-select"
            value={criteria.maxAcceptableRisk}
            onChange={e => onCriteriaChange({ maxAcceptableRisk: e.target.value as WaystoneRollingCriteria['maxAcceptableRisk'] })}
            style={{ width: '100%' }}
          >
            <option value="safe">僅接受安全詞綴 (零危險)</option>
            <option value="caution">接受輕度注意詞綴 (無致命與高危)</option>
            <option value="warning">接受中度危險 (僅避開致命秒殺)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            目標掉落數量 (Quantity): <strong style={{ color: 'var(--text-gold)' }}>+{criteria.minItemQuantity}%</strong>
          </label>
          <input
            type="range"
            min={0}
            max={85}
            step={5}
            value={criteria.minItemQuantity}
            onChange={e => onCriteriaChange({ minItemQuantity: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Forecast Output Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <MetricBox label="單次命中率" value={`${forecast.successRatePercent}%`} color="#38bdf8" />
        <MetricBox label="期望嘗試次數" value={`${forecast.expectedAttempts} 次`} color="var(--text-gold)" />
        <MetricBox label="95% 信心保底" value={`≤ ${forecast.attempts95Percentile} 次`} color="#4ade80" />
      </div>

      {/* Currency Breakdown */}
      <div style={{ background: 'rgba(0,0,0,0.35)', padding: '14px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Coins size={15} /> 預估通貨花費明細 (Expected Currency Costs)：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem' }}>
          {forecast.costEstimates.alchemy > 0 && (
            <span>點金石: <strong style={{ color: '#f3d179' }}>{forecast.costEstimates.alchemy}</strong></span>
          )}
          {forecast.costEstimates.scouring > 0 && (
            <span>重鑄石: <strong style={{ color: '#f3d179' }}>{forecast.costEstimates.scouring}</strong></span>
          )}
          {forecast.costEstimates.chaos > 0 && (
            <span>混沌石: <strong style={{ color: '#f3d179' }}>{forecast.costEstimates.chaos}</strong></span>
          )}
          {forecast.costEstimates.transmutation > 0 && (
            <span>蛻變石: <strong style={{ color: '#60a5fa' }}>{forecast.costEstimates.transmutation}</strong></span>
          )}
          {forecast.costEstimates.regal > 0 && (
            <span>富豪石: <strong style={{ color: '#a78bfa' }}>{forecast.costEstimates.regal}</strong></span>
          )}
          <span style={{ color: 'var(--text-muted)' }}>
            Faustus 市集金幣折算: ≈ <strong style={{ color: '#fbbf24' }}>{forecast.costEstimates.goldEquivalent} Gold</strong>
          </span>
        </div>
      </div>

      {/* Recommendation Box */}
      <div style={{
        padding: '10px 14px',
        background: forecast.recommendation.includes('⚠️') ? 'rgba(249, 115, 22, 0.1)' : 'rgba(34, 197, 94, 0.1)',
        border: forecast.recommendation.includes('⚠️') ? '1px solid rgba(249, 115, 22, 0.25)' : '1px solid rgba(34, 197, 94, 0.25)',
        borderRadius: '5px',
        fontSize: '0.8rem',
        color: forecast.recommendation.includes('⚠️') ? '#fb923c' : '#4ade80'
      }}>
        {forecast.recommendation}
      </div>
    </div>
  );
};

const MetricBox: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '5px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{label}</div>
    <div style={{ fontSize: '1.15rem', fontWeight: 700, color }}>{value}</div>
  </div>
);
