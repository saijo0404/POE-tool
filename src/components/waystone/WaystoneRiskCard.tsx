import React from 'react';
import { AlertTriangle, ShieldCheck, Skull, Info, Sparkles } from 'lucide-react';
import type { WaystoneEvaluation, WaystoneRiskLevel } from '../../domain/waystone/types';

interface WaystoneRiskCardProps {
  evaluation: WaystoneEvaluation;
  rawText: string;
  onRawTextChange: (text: string) => void;
  onLoadSample: () => void;
}

const RISK_BADGES: Record<WaystoneRiskLevel, { text: string; bg: string; color: string; icon: React.ReactNode }> = {
  fatal: { text: '致命致死 (Fatal)', bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', icon: <Skull size={15} /> },
  warning: { text: '高度危險 (Warning)', bg: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', icon: <AlertTriangle size={15} /> },
  caution: { text: '注意警惕 (Caution)', bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15', icon: <Info size={15} /> },
  safe: { text: '極度安全 (Safe)', bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', icon: <ShieldCheck size={15} /> }
};

export const WaystoneRiskCard: React.FC<WaystoneRiskCardProps> = ({
  evaluation,
  rawText,
  onRawTextChange,
  onLoadSample
}) => {
  const badge = RISK_BADGES[evaluation.overallRiskLevel];

  return (
    <div className="poe-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} /> 銘刻地圖即時詞綴評鑑 (Waystone Risk Rating)
        </h3>
        <button
          type="button"
          className="poe-button-secondary"
          style={{ fontSize: '0.74rem', padding: '3px 8px' }}
          onClick={onLoadSample}
        >
          帶入範例銘刻地圖
        </button>
      </div>

      <textarea
        className="poe-input"
        rows={4}
        value={rawText}
        onChange={e => onRawTextChange(e.target.value)}
        placeholder="在遊戲中對著銘刻地圖按 Ctrl+C，然後貼上於此處進行即時危險度分析..."
        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }}
      />

      {evaluation.isWaystone ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Score Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.3)',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                銘刻階級：<strong style={{ color: 'var(--text-bright)' }}>T{evaluation.tier}</strong> ({evaluation.rarity})
                {evaluation.itemQuantity > 0 && ` | 數量 +${evaluation.itemQuantity}%`}
                {evaluation.waystoneDropChance > 0 && ` | 地圖掉落 +${evaluation.waystoneDropChance}%`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: badge.color }}>
                  安全評分：{evaluation.safetyScore} / 100
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: badge.bg,
              color: badge.color,
              fontWeight: 600,
              fontSize: '0.84rem'
            }}>
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          </div>

          {/* Suggestions */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-gold)', marginBottom: '4px' }}>評鑑與應對建議：</div>
            {evaluation.suggestions.map((s) => (
              <div key={s} style={{ color: s.includes('⚠️') ? '#f87171' : 'var(--text-bright)', lineHeight: 1.5 }}>
                {s}
              </div>
            ))}
          </div>

          {/* Matched Mods List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              偵測到之關鍵危險詞綴明細 ({evaluation.mods.length})：
            </div>
            {evaluation.mods.length === 0 ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>未檢測到特殊高危險詞綴</div>
            ) : (
              evaluation.mods.map(m => {
                const mBadge = RISK_BADGES[m.adjustedRisk];
                return (
                  <div
                    key={m.definition.id}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: `3px solid ${mBadge.color}`,
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-bright)' }}>
                        {m.definition.nameZh}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: mBadge.color, fontWeight: 600 }}>
                        {mBadge.text}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {m.rawText}
                    </div>
                    {m.riskReason && (
                      <div style={{ fontSize: '0.74rem', color: '#fb923c', fontStyle: 'italic' }}>
                        💡 {m.riskReason}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          貼上銘刻地圖 (Waystone) 裝備資料以開始評估
        </div>
      )}
    </div>
  );
};
