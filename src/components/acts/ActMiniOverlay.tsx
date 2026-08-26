import React, { useState } from 'react';
import type { ActData, CharacterClass } from '../../domain/acts/types';
import { ChevronLeft, ChevronRight, X, Award, MapPin, Shield, CheckSquare, Square, Lightbulb } from 'lucide-react';

interface ActMiniOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  actData: ActData;
  completedSteps: Set<string>;
  onToggleStep: (stepId: string) => void;
  selectedClass: CharacterClass;
  onPrevAct: () => void;
  onNextAct: () => void;
}

export const ActMiniOverlay: React.FC<ActMiniOverlayProps> = ({
  isOpen,
  onClose,
  actData,
  completedSteps,
  onToggleStep,
  selectedClass,
  onPrevAct,
  onNextAct
}) => {
  // Find index of first uncompleted step in this Act
  const firstUncompletedIdx = actData.steps.findIndex(s => !completedSteps.has(s.id));
  const [activeStepIdx, setActiveStepIdx] = useState<number>(
    firstUncompletedIdx >= 0 ? firstUncompletedIdx : 0
  );

  if (!isOpen) return null;

  const currentStep = actData.steps[activeStepIdx] || actData.steps[0];
  const isDone = completedSteps.has(currentStep.id);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '360px',
        backgroundColor: 'rgba(10, 13, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-gold)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div style={{
        backgroundColor: 'rgba(22, 28, 43, 0.9)',
        borderBottom: '1px solid rgba(200, 170, 110, 0.3)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onPrevAct}
            disabled={actData.act <= 1}
            style={{ background: 'transparent', border: 'none', color: actData.act <= 1 ? '#475569' : 'var(--text-gold)', cursor: 'pointer', padding: '2px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="poe-font" style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 700 }}>
            ACT {actData.act} 拓荒極簡 HUD
          </span>
          <button
            type="button"
            onClick={onNextAct}
            disabled={actData.act >= 10}
            style={{ background: 'transparent', border: 'none', color: actData.act >= 10 ? '#475569' : 'var(--text-gold)', cursor: 'pointer', padding: '2px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Step HUD Body */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Step Indicator & Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onToggleStep(currentStep.id)}
              style={{ background: 'transparent', border: 'none', color: isDone ? '#22c55e' : 'var(--text-gold)', cursor: 'pointer', padding: 0 }}
            >
              {isDone ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>
            <span style={{ fontSize: '0.92rem', color: isDone ? 'var(--text-muted)' : '#f8fafc', fontWeight: 600 }}>
              {currentStep.zoneName}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {currentStep.hasWaypoint && <span title="有傳送點" style={{ color: '#38bdf8' }}><MapPin size={13} /></span>}
            {currentStep.hasTrial && <span title="帝國試煉" style={{ color: '#c084fc' }}><Shield size={13} /></span>}
            {currentStep.isPassivePoint && <span title="天賦點任務" style={{ color: 'var(--text-gold)' }}><Award size={13} /></span>}
          </div>
        </div>

        {/* Objective */}
        <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.4' }}>
          <strong>目標：</strong> {currentStep.mainObjective}
        </div>

        {/* Tips */}
        {currentStep.tips && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#cbd5e1', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>
            <Lightbulb size={12} color="#facc15" />
            <span>{currentStep.tips}</span>
          </div>
        )}

        {/* Class Reward (if any) */}
        {currentStep.rewards && currentStep.rewards.length > 0 && (
          <div style={{ backgroundColor: 'rgba(14, 143, 127, 0.15)', border: '1px solid rgba(14, 143, 127, 0.3)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.76rem' }}>
            {currentStep.rewards.map((r, i) => (
              <div key={i} style={{ color: '#fef08a' }}>
                🎁 <strong>{r.questName}：</strong> 推薦選取 <strong>{r.recommendedPicks[selectedClass]}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Step Navigation Slider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveStepIdx(i => Math.max(i - 1, 0))}
            disabled={activeStepIdx <= 0}
            className="poe-button-secondary"
            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
          >
            上一區
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            步驟 {activeStepIdx + 1} / {actData.steps.length}
          </span>
          <button
            type="button"
            onClick={() => setActiveStepIdx(i => Math.min(i + 1, actData.steps.length - 1))}
            disabled={activeStepIdx >= actData.steps.length - 1}
            className="poe-button-secondary"
            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
          >
            下一區
          </button>
        </div>
      </div>
    </div>
  );
};
