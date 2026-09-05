import React, { useState } from 'react';
import type { ScarabSynergyRecommendation, RecommendedScarabSlot } from '../../domain/atlas/scarabSynergyEngine';
import type { AtlasTierScarab } from '../../domain/atlas/types';
import { Sparkles, Check, Flame, Zap, ArrowRight } from 'lucide-react';
import { Card, Button } from '../ui';

interface ScarabSynergyCardProps {
  recommendation: ScarabSynergyRecommendation;
  onApplyToCurrentTier?: (scarabs: AtlasTierScarab[]) => void;
  divineRate?: number;
}

function convertToAtlasTierScarabs(slots: RecommendedScarabSlot[]): AtlasTierScarab[] {
  return slots.map(slot => ({
    id: `sc_syn_${Date.now()}_${slot.scarab.id}_${Math.random().toString(36).substring(2, 5)}`,
    name: slot.scarab.name,
    nameEn: slot.scarab.nameEn,
    count: slot.count,
    customPriceChaos: slot.unitCostChaos
  }));
}

function getTierBadgeStyle(tier: 'S' | 'A' | 'B'): React.CSSProperties {
  if (tier === 'S') {
    return {
      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(249, 115, 22, 0.25))',
      color: '#fde047',
      border: '1px solid rgba(234, 179, 8, 0.5)'
    };
  }
  if (tier === 'A') {
    return {
      background: 'rgba(59, 130, 246, 0.2)',
      color: '#93c5fd',
      border: '1px solid rgba(59, 130, 246, 0.4)'
    };
  }
  return {
    background: 'rgba(156, 163, 175, 0.2)',
    color: '#d1d5db',
    border: '1px solid rgba(156, 163, 175, 0.3)'
  };
}

export const ScarabSynergyCard: React.FC<ScarabSynergyCardProps> = ({
  recommendation,
  onApplyToCurrentTier,
  divineRate = 150
}) => {
  const [applied, setApplied] = useState(false);

  if (recommendation.slots.length === 0) {
    return null;
  }

  const handleApply = () => {
    if (!onApplyToCurrentTier) return;
    const tierScarabs = convertToAtlasTierScarabs(recommendation.slots);
    onApplyToCurrentTier(tierScarabs);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const costDivine = Math.round((recommendation.estimatedCostChaos / divineRate) * 100) / 100;

  return (
    <Card variant="default" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
            聖甲蟲協同組合推薦
          </h3>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            ...getTierBadgeStyle(recommendation.tier)
          }}>
            {recommendation.tier} 級協同
          </span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.74rem',
            padding: '2px 7px',
            borderRadius: '4px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#86efac',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <Zap size={12} /> {recommendation.synergyMultiplier}x 乘數
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            預估單場甲蟲花費：
            <span style={{ color: 'var(--text-gold)', fontWeight: 700, marginLeft: '4px' }}>
              {Math.round(recommendation.estimatedCostChaos)} C
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginLeft: '4px' }}>
              (~{costDivine} Div)
            </span>
          </div>

          {onApplyToCurrentTier && (
            <Button
              variant={applied ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleApply}
              icon={applied ? <Check size={14} color="#86efac" /> : <ArrowRight size={14} />}
            >
              {applied ? '已套用至當前配置' : '一鍵套用此組合'}
            </Button>
          )}
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '4px' }}>
        {recommendation.summaryNote}
      </div>

      {/* Recommended Scarabs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {recommendation.slots.map((slot) => (
          <div
            key={slot.scarab.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.84rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Flame size={15} color="var(--text-gold)" />
              <span style={{ fontWeight: 600, color: 'var(--text-light)' }}>
                {slot.scarab.name}
              </span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>
                ({slot.scarab.nameEn})
              </span>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                {slot.synergyReason}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                color: 'var(--text-gold)',
                fontWeight: 700,
                background: 'rgba(243, 209, 121, 0.1)',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                x{slot.count}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', minWidth: '60px', textAlign: 'right' }}>
                {slot.totalCostChaos} C
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
