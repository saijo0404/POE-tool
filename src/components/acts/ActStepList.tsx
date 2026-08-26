import React from 'react';
import type { ActStep, CharacterClass } from '../../domain/acts/types';
import {
  CheckSquare,
  Square,
  MapPin,
  Award,
  Shield,
  Lightbulb,
  Gift
} from 'lucide-react';

interface ActStepListProps {
  steps: ActStep[];
  completedSteps: Set<string>;
  onToggleStep: (stepId: string) => void;
  selectedClass: CharacterClass;
}

export const ActStepList: React.FC<ActStepListProps> = ({
  steps,
  completedSteps,
  onToggleStep,
  selectedClass
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {steps.map((step, index) => {
        const isDone = completedSteps.has(step.id);

        return (
          <div
            key={step.id}
            className="poe-card"
            style={{
              padding: '14px 16px',
              backgroundColor: isDone ? 'rgba(10, 14, 20, 0.5)' : 'var(--bg-card)',
              borderColor: isDone ? 'rgba(34, 197, 94, 0.35)' : step.isPassivePoint ? 'rgba(243, 209, 121, 0.4)' : 'var(--border-subtle)',
              opacity: isDone ? 0.75 : 1,
              transition: 'all 0.18s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => onToggleStep(step.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isDone ? '#22c55e' : 'var(--text-gold)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '2px'
                }}
                title={isDone ? '標記為未完成' : '標記為已完成'}
              >
                {isDone ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>

              {/* Step Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Zone Header & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)',
                      fontWeight: 600
                    }}>
                      #{index + 1}
                    </span>
                    <h4 className="poe-font" style={{
                      fontSize: '1rem',
                      color: isDone ? 'var(--text-muted)' : 'var(--text-gold)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      margin: 0
                    }}>
                      {step.zoneName}
                    </h4>
                    {step.zoneLevel && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '3px' }}>
                        Lv {step.zoneLevel}
                      </span>
                    )}
                  </div>

                  {/* Feature Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {step.hasWaypoint && (
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <MapPin size={11} /> 傳送點 WP
                      </span>
                    )}

                    {step.hasTrial && (
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        color: '#c084fc',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontWeight: 600
                      }}>
                        <Shield size={11} /> 帝國試煉 (Trial)
                      </span>
                    )}

                    {step.isPassivePoint && (
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(243, 209, 121, 0.2)',
                        color: 'var(--text-gold)',
                        border: '1px solid rgba(243, 209, 121, 0.45)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontWeight: 700
                      }}>
                        <Award size={11} /> ⭐ +1 天賦點任務
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Objective */}
                <div style={{ fontSize: '0.88rem', color: isDone ? 'var(--text-dim)' : '#f1f5f9', lineHeight: '1.4' }}>
                  <strong>目標：</strong> {step.mainObjective}
                </div>

                {/* Layout Tips (if any) */}
                {step.tips && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    color: '#94a3b8'
                  }}>
                    <Lightbulb size={13} color="#facc15" />
                    <span><strong>走法技巧：</strong> {step.tips}</span>
                  </div>
                )}

                {/* Quest Reward Recommendation for Selected Class */}
                {step.rewards && step.rewards.length > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(14, 143, 127, 0.12)',
                    border: '1px solid rgba(14, 143, 127, 0.3)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    marginTop: '4px'
                  }}>
                    {step.rewards.map((reward, rIdx) => {
                      const pick = reward.recommendedPicks[selectedClass] || '依流派選取';
                      return (
                        <div key={rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5eead4' }}>
                            <Gift size={14} />
                            <span><strong>{reward.questName}</strong> ({reward.npc})：</span>
                          </div>
                          <div style={{ color: '#fef08a', fontWeight: 600 }}>
                            👉 推薦選取：{pick}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
