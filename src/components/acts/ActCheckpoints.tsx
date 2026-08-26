import React from 'react';
import type { ActData } from '../../domain/acts/types';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface ActCheckpointsProps {
  actData: ActData;
}

export const ActCheckpoints: React.FC<ActCheckpointsProps> = ({ actData }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
      {/* Chapter Overview Card */}
      <div className="poe-card" style={{ borderColor: 'rgba(200, 170, 110, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color="var(--text-gold)" />
          <h4 className="poe-font" style={{ fontSize: '0.92rem', color: 'var(--text-gold)', margin: 0 }}>
            {actData.title}
          </h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <div>📍 <strong>主城鎮：</strong> {actData.townName}</div>
          <div>📈 <strong>建議角色等級：</strong> <span style={{ color: '#38bdf8' }}>{actData.recommendedLevel}</span></div>
          {actData.ascendancyAdvice && (
            <div style={{ color: '#c084fc', marginTop: '2px' }}>
              🛡️ <strong>昇華指引：</strong> {actData.ascendancyAdvice}
            </div>
          )}
          {actData.banditRecommendation && (
            <div style={{ color: '#facc15', marginTop: '2px' }}>
              ⚔️ <strong>盜賊推薦：</strong> {actData.banditRecommendation}
            </div>
          )}
        </div>
      </div>

      {/* Critical Checkpoints Card */}
      <div className="poe-card" style={{ borderColor: 'rgba(243, 209, 121, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <AlertTriangle size={16} color="#fbbf24" />
          <h4 className="poe-font" style={{ fontSize: '0.92rem', color: '#fbbf24', margin: 0 }}>
            本章關鍵檢查點 (Key Checkpoints)
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actData.checkpoints.map((cp, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(15, 20, 30, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                padding: '8px 10px',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ color: '#fef08a', fontWeight: 600, marginBottom: '2px' }}>
                • {cp.title}
              </div>
              <div style={{ color: 'var(--text-muted)', lineHeight: '1.4', fontSize: '0.76rem' }}>
                {cp.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
