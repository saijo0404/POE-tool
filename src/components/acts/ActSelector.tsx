import React from 'react';
import { Compass, Award } from 'lucide-react';

interface ActSelectorProps {
  currentAct: number;
  onSelectAct: (act: number) => void;
  completedStepCount: number;
  totalStepCount: number;
  passivePointsEarned: number;
}

export const ActSelector: React.FC<ActSelectorProps> = ({
  currentAct,
  onSelectAct,
  completedStepCount,
  totalStepCount,
  passivePointsEarned
}) => {
  const acts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const progressPercent = totalStepCount > 0 ? Math.round((completedStepCount / totalStepCount) * 100) : 0;

  return (
    <div className="poe-card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={20} color="var(--text-gold)" />
          <div>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-gold)', fontWeight: 700 }} className="poe-font">
              章節快速導航 (Acts 1 ~ 10)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
              點擊切換章節流程
            </span>
          </div>
        </div>

        {/* Global Stats: Passive Points & Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(243, 209, 121, 0.15)',
            border: '1px solid rgba(243, 209, 121, 0.35)',
            padding: '4px 10px',
            borderRadius: '4px'
          }}>
            <Award size={14} color="var(--text-gold)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-gold)' }}>
              支線天賦點: <strong>{passivePointsEarned} / 24 點</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px' }}>
            <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#22c55e', transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{progressPercent}% 完成</span>
          </div>
        </div>
      </div>

      {/* Act Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
        {acts.map(actNum => {
          const isSelected = actNum === currentAct;
          return (
            <button
              key={actNum}
              type="button"
              onClick={() => onSelectAct(actNum)}
              style={{
                backgroundColor: isSelected ? 'linear-gradient(180deg, #9a8352 0%, #68532b 100%)' : 'rgba(15, 20, 30, 0.7)',
                background: isSelected ? 'linear-gradient(180deg, #9a8352 0%, #68532b 100%)' : undefined,
                border: `1px solid ${isSelected ? 'var(--border-gold-bright)' : 'rgba(200, 170, 110, 0.2)'}`,
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                padding: '8px 4px',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                boxShadow: isSelected ? '0 0 12px rgba(243, 209, 121, 0.35)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACT</span>
              <span className="poe-font" style={{ fontSize: '1.05rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-gold)' }}>
                {actNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
