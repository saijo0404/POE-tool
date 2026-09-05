import React, { useState, useMemo } from 'react';
import { Dices, Sparkles, AlertCircle, ShieldAlert, Layers } from 'lucide-react';
import {
  compareRollingStrategies,
  type RollingStrategyType
} from '../../domain/mapMod/mapRollingSimulator';

interface MapRollingSimulatorCardProps {
  initialForbiddenCount?: number;
}

const BATCH_SIZES = [1, 10, 25, 50];

export const MapRollingSimulatorCard: React.FC<MapRollingSimulatorCardProps> = ({
  initialForbiddenCount = 3
}) => {
  const [forbiddenCount, setForbiddenCount] = useState<number>(initialForbiddenCount);
  const [minQuant, setMinQuant] = useState<number>(75);
  const [minPack, setMinPack] = useState<number>(20);
  const [batchCount, setBatchCount] = useState<number>(25);
  const [selectedStrategy, setSelectedStrategy] = useState<RollingStrategyType>('scour_alch');

  const comparisons = useMemo(() => {
    return compareRollingStrategies({
      forbiddenModsCount: forbiddenCount,
      minQuantityPercent: minQuant,
      minPackSizePercent: minPack,
      mapCount: batchCount
    });
  }, [forbiddenCount, minQuant, minPack, batchCount]);

  const activeResult = comparisons.find(c => c.strategy === selectedStrategy) || comparisons[0];

  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Dices size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
            地圖洗詞期望成本精算 (Map Rolling Simulator)
          </h3>
        </div>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          蒙地卡羅機率模型 / 95% 信賴區間
        </span>
      </div>

      {/* Control Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '10px',
        background: 'rgba(0,0,0,0.25)',
        padding: '10px 14px',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="sim-forbidden-count" style={{ fontSize: '0.76rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={12} color="#fca5a5" /> 避開危險詞綴數:
          </label>
          <input
            id="sim-forbidden-count"
            type="number"
            min={0}
            max={20}
            value={forbiddenCount}
            onChange={e => setForbiddenCount(Math.max(0, Number(e.target.value)))}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'var(--text-light)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="sim-min-quant" style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            目標掉落數量 (%):
          </label>
          <input
            id="sim-min-quant"
            type="number"
            min={0}
            max={120}
            value={minQuant}
            onChange={e => setMinQuant(Math.max(0, Number(e.target.value)))}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'var(--text-light)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="sim-min-pack" style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            目標怪群規模 (%):
          </label>
          <input
            id="sim-min-pack"
            type="number"
            min={0}
            max={50}
            value={minPack}
            onChange={e => setMinPack(Math.max(0, Number(e.target.value)))}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'var(--text-light)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={12} color="var(--text-gold)" /> 洗圖張數批次:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {BATCH_SIZES.map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => setBatchCount(sz)}
                style={{
                  flex: 1,
                  fontSize: '0.76rem',
                  padding: '4px 0',
                  borderRadius: '4px',
                  backgroundColor: batchCount === sz ? 'var(--text-gold)' : 'rgba(255,255,255,0.05)',
                  color: batchCount === sz ? '#0d121c' : 'var(--text-dim)',
                  fontWeight: batchCount === sz ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Strategies Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
        {comparisons.map(item => {
          const isSelected = item.strategy === selectedStrategy;
          return (
            <div
              key={item.strategy}
              onClick={() => setSelectedStrategy(item.strategy)}
              style={{
                background: isSelected ? 'rgba(243, 209, 121, 0.08)' : 'rgba(255,255,255,0.02)',
                border: isSelected ? '1px solid var(--text-gold)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                position: 'relative'
              }}
            >
              {item.isRecommended && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#86efac',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <Sparkles size={10} /> 最佳推薦
                </div>
              )}

              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? 'var(--text-gold)' : 'var(--text-light)' }}>
                {item.strategyName.split(' (')[0]}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>單場合格機率:</span>
                <span style={{ color: '#93c5fd', fontWeight: 600 }}>{Math.round(item.successProbability * 1000) / 10}%</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>單張期望花費:</span>
                <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>~{item.expectedCostChaos} C</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>{batchCount} 張總期望:</span>
                <span style={{ color: '#86efac', fontWeight: 700 }}>~{item.totalBatchCostChaos} C</span>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {item.recommendationReason}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confidence Interval & Note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        background: 'rgba(0,0,0,0.3)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)' }}>
          <AlertCircle size={14} color="var(--text-gold)" />
          <span>
            選中方案【{activeResult.strategyName.split(' (')[0]}】：95% 信心上限為單張 <strong>{activeResult.confidence95Attempts} 次 ({activeResult.confidence95CostChaos} C)</strong>
          </span>
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          {activeResult.verdictNote}
        </div>
      </div>
    </div>
  );
};
