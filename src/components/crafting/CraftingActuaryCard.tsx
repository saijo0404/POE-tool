import React from 'react';
import { Calculator, Award, Sparkles, AlertCircle } from 'lucide-react';
import type { CraftActuaryResult } from '../../domain/crafting/types';
import { Card } from '../ui';

interface CraftingActuaryCardProps {
  actuaryResult: CraftActuaryResult | null;
}

export const CraftingActuaryCard: React.FC<CraftingActuaryCardProps> = ({ actuaryResult }) => {
  if (!actuaryResult) {
    return (
      <Card variant="default" padding="lg" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <AlertCircle size={24} style={{ marginBottom: '8px', color: 'var(--text-gold)' }} />
        <p style={{ margin: 0 }}>請設定基底並至少選擇 1 條目標詞綴以進行精算。</p>
      </Card>
    );
  }

  const { evaluations, recommendedMethod, activeTargetModsCount } = actuaryResult;

  return (
    <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={18} color="var(--text-gold)" />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-gold)' }}>3. 工藝成本期望精算 (Actuary Report)</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          已計算 {activeTargetModsCount} 條目標組合
        </span>
      </div>

      {/* Recommended Method Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(20, 24, 34, 0.8) 100%)',
          border: '1px solid #f3d179',
          borderRadius: '6px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={22} color="#f3d179" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#0d121c', backgroundColor: '#f3d179', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                最佳推薦工藝
              </span>
              <span style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>
                {recommendedMethod.title}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {recommendedMethod.subtitle}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', color: '#f3d179', fontWeight: 700 }}>
            預估 ~{recommendedMethod.totalExpectedCostChaos} Chaos
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            約 {recommendedMethod.totalExpectedCostDivine} Divine (平均 {recommendedMethod.averageAttempts} 次)
          </span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {evaluations.map(ev => {
          const isRec = ev.isRecommended;

          return (
            <div
              key={ev.method}
              style={{
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: isRec ? 'rgba(212, 175, 55, 0.08)' : 'rgba(20, 24, 34, 0.5)',
                border: `1px solid ${isRec ? '#f3d179' : 'rgba(200, 170, 110, 0.2)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isRec ? '#f3d179' : '#fff' }}>
                  {ev.title}
                </span>
                {isRec && <Sparkles size={14} color="#f3d179" />}
              </div>

              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', minHeight: '32px' }}>
                {ev.subtitle}
              </span>

              <div style={{ borderTop: '1px dashed rgba(200, 170, 110, 0.15)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>單次成功機率：</span>
                  <span style={{ color: '#68c4ff', fontWeight: 600 }}>{(ev.successProbability * 100).toFixed(2)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>平均期望次數：</span>
                  <span style={{ color: '#fff' }}>{ev.averageAttempts} 次</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>單次點數成本：</span>
                  <span style={{ color: '#fff' }}>{ev.costPerAttemptChaos} c</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px' }}>
                  <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>期望總花費：</span>
                  <span style={{ color: '#f3d179', fontWeight: 700 }}>~{ev.totalExpectedCostChaos} c ({ev.totalExpectedCostDivine} Div)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#e57373', fontSize: '0.72rem' }}>95% 信心成本：</span>
                  <span style={{ color: '#e57373', fontSize: '0.72rem' }}>~{ev.confidence95CostChaos} c ({ev.confidence95Attempts} 次)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
