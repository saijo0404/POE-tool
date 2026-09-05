import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Coins } from 'lucide-react';
import {
  getAllDeviceCrafts,
  calculateDeviceCraftBreakEven,
  type DeviceCraftForecastResult
} from '../../domain/mapping/deviceCraftBreakEven';

interface DeviceBreakEvenCardProps {
  onApplyCraftCost?: (costChaos: number) => void;
  currentCraftCost?: number;
}

function getRecommendationBadge(rec: DeviceCraftForecastResult['recommendationLevel']) {
  if (rec === 'strongly_recommended') {
    return {
      text: '強烈推薦 (Strong Buy)',
      color: '#86efac',
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.3)',
      icon: <CheckCircle2 size={13} color="#86efac" />
    };
  }
  if (rec === 'situational') {
    return {
      text: '保守打平 (Situational)',
      color: '#fde047',
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.3)',
      icon: <TrendingUp size={13} color="#fde047" />
    };
  }
  return {
    text: '高風險 (High Risk)',
    color: '#fca5a5',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: <AlertTriangle size={13} color="#fca5a5" />
  };
}

export const DeviceBreakEvenCard: React.FC<DeviceBreakEvenCardProps> = ({
  onApplyCraftCost,
  currentCraftCost = 0
}) => {
  const crafts = useMemo(() => getAllDeviceCrafts(), []);
  const [selectedCraftId, setSelectedCraftId] = useState<string>('essence');
  const [quantityBonus, setQuantityBonus] = useState<number>(75);
  const [packSizeBonus, setPackSizeBonus] = useState<number>(25);

  const forecast = useMemo(() => {
    return calculateDeviceCraftBreakEven({
      craftId: selectedCraftId,
      itemQuantityBonusPercent: quantityBonus,
      packSizeBonusPercent: packSizeBonus
    });
  }, [selectedCraftId, quantityBonus, packSizeBonus]);

  const recBadge = getRecommendationBadge(forecast.recommendationLevel);

  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
            地圖儀工藝成本收益損益平衡預測 (Device Craft Break-even)
          </h3>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 9px',
          borderRadius: '12px',
          backgroundColor: recBadge.bg,
          border: `1px solid ${recBadge.border}`,
          fontSize: '0.78rem',
          color: recBadge.color,
          fontWeight: 600
        }}>
          {recBadge.icon}
          <span>{recBadge.text}</span>
        </div>
      </div>

      {/* Craft Pills Selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {crafts.map(c => {
          const isSelected = c.id === selectedCraftId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCraftId(c.id)}
              style={{
                fontSize: '0.8rem',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: isSelected ? 'rgba(243, 209, 121, 0.2)' : 'rgba(0,0,0,0.3)',
                color: isSelected ? 'var(--text-gold)' : 'var(--text-dim)',
                border: isSelected ? '1px solid var(--text-gold)' : '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {c.name.split(' (')[0].replace('地圖儀：', '')} ({c.costChaos}C)
            </button>
          );
        })}
      </div>

      {/* Parameter Sliders */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        background: 'rgba(0,0,0,0.25)',
        padding: '10px 14px',
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>地圖掉落數量加成:</span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>+{quantityBonus}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            step={5}
            value={quantityBonus}
            onChange={e => setQuantityBonus(Number(e.target.value))}
            style={{ accentColor: 'var(--text-gold)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-dim)' }}>地圖怪群規模加成:</span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>+{packSizeBonus}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={packSizeBonus}
            onChange={e => setPackSizeBonus(Number(e.target.value))}
            style={{ accentColor: 'var(--text-gold)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>工藝混沌成本</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-gold)' }}>{forecast.effectiveCostChaos} C</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>預估毛收益</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#93c5fd' }}>{forecast.expectedRevenueChaos} C</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>淨利期望</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: forecast.netProfitChaos >= 0 ? '#86efac' : '#fca5a5' }}>
            {forecast.netProfitChaos >= 0 ? `+${forecast.netProfitChaos}` : forecast.netProfitChaos} C
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>預估 ROI</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: forecast.expectedRoiPercent >= 0 ? '#86efac' : '#fca5a5' }}>
            {forecast.expectedRoiPercent >= 0 ? `+${forecast.expectedRoiPercent}%` : `${forecast.expectedRoiPercent}%`}
          </div>
        </div>
      </div>

      {/* Break-Even Drops Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>最低損益平衡掉落門檻：</div>
        {forecast.breakEvenDrops.map(drop => (
          <div
            key={drop.dropName}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '4px',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChevronRight size={14} color="var(--text-gold)" />
              <span style={{ color: 'var(--text-light)' }}>{drop.dropName}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>(單價 ~{drop.unitValueChaos} C)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--text-dim)' }}>
                單場預期: <strong style={{ color: 'var(--text-light)' }}>{drop.expectedUnitsWithMapBonus}</strong>
              </span>
              <span style={{
                color: 'var(--text-gold)',
                fontWeight: 600,
                background: 'rgba(243,209,121,0.1)',
                padding: '2px 8px',
                borderRadius: '8px'
              }}>
                需掉落: {drop.minUnitsToBreakEven} 個回本
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Verdict & Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          {forecast.verdictNote}
        </div>

        {onApplyCraftCost && (
          <button
            type="button"
            className="poe-button"
            onClick={() => onApplyCraftCost(forecast.effectiveCostChaos)}
            style={{
              fontSize: '0.8rem',
              padding: '5px 12px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Coins size={14} />
            套用工藝成本 ({forecast.effectiveCostChaos} C)
            {currentCraftCost === forecast.effectiveCostChaos && ' [已套用]'}
          </button>
        )}
      </div>
    </div>
  );
};
