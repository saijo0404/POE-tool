import React, { useState } from 'react';
import type { CharacterClass } from '../../domain/acts/types';
import type { GemSwapLevel } from '../../domain/acts/gemSwapTypes';
import { getGemSwapMilestonesByClass } from '../../domain/acts/gemSwapData';
import { AlertCircle, CheckSquare, Square, Shield, Zap } from 'lucide-react';

interface ActGemSwapCheckpointsProps {
  selectedClass: CharacterClass;
  completedGemIds?: Set<string>;
  onToggleGem?: (gemId: string) => void;
}

export const ActGemSwapCheckpoints: React.FC<ActGemSwapCheckpointsProps> = ({
  selectedClass,
  completedGemIds = new Set(),
  onToggleGem
}) => {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<GemSwapLevel | 'all'>('all');
  const milestones = getGemSwapMilestonesByClass(selectedClass);

  const displayedMilestones = selectedLevelFilter === 'all'
    ? milestones
    : milestones.filter(m => m.level === selectedLevelFilter);

  return (
    <div className="poe-card" style={{ borderColor: 'rgba(200, 170, 110, 0.35)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
            技能與裝備轉換里程碑檢查點 (Gem Swap Checkpoints)
          </h3>
        </div>

        {/* Level Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {(['all', 12, 28, 38] as const).map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevelFilter(lvl)}
              className={selectedLevelFilter === lvl ? 'poe-button' : 'poe-button-secondary'}
              style={{ padding: '4px 10px', fontSize: '0.76rem' }}
            >
              {lvl === 'all' ? '全部等級' : `Lv ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {/* Milestones Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayedMilestones.map(ms => (
          <div
            key={ms.level}
            style={{
              backgroundColor: 'rgba(15, 20, 30, 0.65)',
              border: '1px solid rgba(243, 209, 121, 0.25)',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {/* Milestone Title Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  backgroundColor: 'rgba(200, 170, 110, 0.2)',
                  border: '1px solid var(--text-gold)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-gold)'
                }}>
                  Lv {ms.level}
                </span>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
                  {ms.title}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  ({ms.archetypeName})
                </span>
              </div>

              {/* Target Resistance Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '4px',
                padding: '2px 8px',
                color: '#38bdf8'
              }}>
                <Shield size={13} />
                <span>門檻目標：{ms.gearResistanceTarget}</span>
              </div>
            </div>

            {/* Note */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              💡 {ms.summaryNote}
            </div>

            {/* Gems List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
              {ms.gems.map(gem => {
                const isAcquired = completedGemIds.has(gem.id);
                return (
                  <div
                    key={gem.id}
                    style={{
                      backgroundColor: isAcquired ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: isAcquired ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {onToggleGem && (
                          <button
                            type="button"
                            onClick={() => onToggleGem(gem.id)}
                            style={{ background: 'transparent', border: 'none', color: isAcquired ? '#22c55e' : 'var(--text-gold)', cursor: 'pointer', padding: 0 }}
                          >
                            {isAcquired ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        )}
                        <span style={{ fontWeight: 600, fontSize: '0.86rem', color: isAcquired ? '#86efac' : 'var(--text-gold)' }}>
                          {gem.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({gem.nameEn})</span>
                      </div>

                      <span style={{
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        color: gem.recommendedColors.includes('R') ? '#f87171' : gem.recommendedColors.includes('G') ? '#4ade80' : '#60a5fa'
                      }}>
                        {gem.recommendedColors}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#94a3b8' }}>
                      <span>📍 {gem.sourceNpc}</span>
                      <span>•</span>
                      <span>需求: {gem.primaryAttribute === 'intelligence' ? '智慧' : gem.primaryAttribute === 'strength' ? '力量' : '敏捷'} {gem.requiredAttributeValue}</span>
                    </div>

                    {gem.attributeWarning && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.73rem',
                        color: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        padding: '3px 6px',
                        borderRadius: '3px'
                      }}>
                        <AlertCircle size={12} />
                        <span>{gem.attributeWarning}</span>
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                      {gem.usageTips}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
