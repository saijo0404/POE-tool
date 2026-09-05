import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateUltimatumEv } from '../../domain/ultimatum/ultimatumEvEngine';
import { ULTIMATUM_MODS } from '../../domain/ultimatum/ultimatumMods';
import type { ActiveModSelection, PlayerWeaknessConfig, UltimatumRecommendation } from '../../domain/ultimatum/types';
import { Card } from '../ui';

interface UltimatumEvCardProps {
  divineRate?: number;
  onShowToast?: (msg: string) => void;
}

const WEAKNESS_LABELS: { key: keyof PlayerWeaknessConfig; label: string }[] = [
  { key: 'noLifeRecovery', label: '無法回血/依賴偷取' },
  { key: 'lowChaosRes', label: '負/低混沌抗性' },
  { key: 'slowMovement', label: '低跑速/缺乏位移' },
  { key: 'noBleedImmunity', label: '無流血/腐血免疫' },
  { key: 'lowPhysMitigation', label: '低物理減免' },
  { key: 'reliantOnFlasks', label: '仰賴藥劑回復' },
  { key: 'reliantOnCooldowns', label: '仰賴技能冷卻' }
];

function getRecBadgeStyle(rec: UltimatumRecommendation) {
  if (rec === 'STRONG_CONTINUE') {
    return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#6ee7b7', text: '強烈挺進 (Strong Continue)' };
  }
  if (rec === 'CAUTIOUS_CONTINUE') {
    return { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', color: '#fcd34d', text: '謹慎挑戰 (Cautious Continue)' };
  }
  return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#fca5a5', text: '見好就收 (Take Profit / Stop)' };
}

function WarningsSection({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '6px' }}>
      {warnings.map((w, i) => (
        <div key={i} style={{ color: '#fca5a5', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}

function EvSummaryHeader({ evChaos, prob, rec, divineRate }: { evChaos: number; prob: number; rec: UltimatumRecommendation; divineRate: number }) {
  const badge = getRecBadgeStyle(rec);
  const evDiv = Math.round((evChaos / (divineRate || 150)) * 100) / 100;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px' }}>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>挺進期望淨收益 (EV)</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: evChaos >= 0 ? '#86efac' : '#fca5a5' }}>
          {evChaos >= 0 ? `+${evChaos}` : evChaos} C <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>({evDiv} Div)</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>下一輪通關機率</div>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: prob >= 0.7 ? '#86efac' : prob >= 0.5 ? '#fcd34d' : '#fca5a5' }}>
          {Math.round(prob * 100)}%
        </div>
      </div>
      <div style={{ padding: '6px 12px', borderRadius: '16px', background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontWeight: 700, fontSize: '0.85rem' }}>
        {badge.text}
      </div>
    </div>
  );
}

function RoundSelector({ currentRound, onSelectRound }: { currentRound: number; onSelectRound: (r: number) => void }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>當前完成輪次 (Current Round):</div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i + 1}
            type="button"
            onClick={() => onSelectRound(i + 1)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              background: currentRound === i + 1 ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.05)',
              color: currentRound === i + 1 ? '#000' : 'var(--text-light)',
              fontWeight: currentRound === i + 1 ? 700 : 500,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            R{i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function RewardInput({ reward, onChangeReward, divineRate }: { reward: number; onChangeReward: (n: number) => void; divineRate: number }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>目前已獲取累積獎勵價值 (Chaos):</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="number"
          value={reward}
          onChange={e => onChangeReward(Math.max(0, Number(e.target.value) || 0))}
          style={{ width: '120px', padding: '6px 10px', borderRadius: '4px', background: '#111', border: '1px solid #444', color: '#fff' }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>~{Math.round((reward / divineRate) * 100) / 100} Div</span>
      </div>
    </div>
  );
}

function WeaknessPicker({ weaknesses, onToggle }: { weaknesses: PlayerWeaknessConfig; onToggle: (k: keyof PlayerWeaknessConfig) => void }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>機體弱點勾選 (Player Vulnerabilities):</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {WEAKNESS_LABELS.map(w => (
          <button
            key={w.key}
            type="button"
            onClick={() => onToggle(w.key)}
            style={{
              fontSize: '0.72rem',
              padding: '3px 8px',
              borderRadius: '4px',
              background: weaknesses[w.key] ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${weaknesses[w.key] ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
              color: weaknesses[w.key] ? '#fca5a5' : 'var(--text-dim)'
            }}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModPickerSection({ activeMods, onAdd, onRemove }: {
  activeMods: ActiveModSelection[];
  onAdd: (m: string, t: 1 | 2 | 3) => void;
  onRemove: (m: string) => void;
}) {
  const [selMod, setSelMod] = useState<string>('blood_offering');
  const [selTier, setSelTier] = useState<1 | 2 | 3>(1);
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>附加負面詞綴 (Active Modifiers):</div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <select value={selMod} onChange={e => setSelMod(e.target.value)} style={{ padding: '4px 8px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }}>
          {ULTIMATUM_MODS.map(m => (<option key={m.id} value={m.id}>{m.nameZh}</option>))}
        </select>
        <select value={selTier} onChange={e => setSelTier(Number(e.target.value) as 1 | 2 | 3)} style={{ padding: '4px 8px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }}>
          <option value={1}>T1</option>
          <option value={2}>T2</option>
          <option value={3}>T3</option>
        </select>
        <button type="button" onClick={() => onAdd(selMod, selTier)} style={{ padding: '4px 10px', background: 'var(--gold-gradient)', color: '#000', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>+ 新增</button>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {activeMods.map(m => (
          <div key={m.modId} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.72rem' }}>
            <span>{ULTIMATUM_MODS.find(x => x.id === m.modId)?.nameZh || m.modId} (T{m.tier})</span>
            <button type="button" onClick={() => onRemove(m.modId)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const UltimatumEvCard: React.FC<UltimatumEvCardProps> = ({ divineRate = 150 }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [currentRound, setCurrentRound] = useState<number>(3);
  const [accumulatedReward, setAccumulatedReward] = useState<number>(30);
  const [activeMods, setActiveMods] = useState<ActiveModSelection[]>([{ modId: 'razor_sharp', tier: 1 }]);
  const [weaknesses, setWeaknesses] = useState<PlayerWeaknessConfig>({ noLifeRecovery: false, lowChaosRes: true });

  const analysis = useMemo(() => {
    return calculateUltimatumEv({ currentRound, accumulatedRewardChaos: accumulatedReward, activeMods, playerWeaknesses: weaknesses });
  }, [currentRound, accumulatedReward, activeMods, weaknesses]);

  return (
    <Card variant="default" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#f97316" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>通牒命運試煉期望回報精算 (Ultimatum EV Risk Engine)</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>第 {currentRound} / 10 輪</span>
        </div>
        {isOpen ? <ChevronUp size={16} color="var(--text-dim)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
      </div>
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <EvSummaryHeader evChaos={analysis.expectedNetGainChaos} prob={analysis.nextRoundSuccessProbability} rec={analysis.recommendation} divineRate={divineRate} />
          <WarningsSection warnings={analysis.lethalWarnings} />
          <RoundSelector currentRound={currentRound} onSelectRound={setCurrentRound} />
          <RewardInput reward={accumulatedReward} onChangeReward={setAccumulatedReward} divineRate={divineRate} />
          <WeaknessPicker weaknesses={weaknesses} onToggle={k => setWeaknesses(p => ({ ...p, [k]: !p[k] }))} />
          <ModPickerSection activeMods={activeMods} onAdd={(m, t) => !activeMods.some(x => x.modId === m) && setActiveMods(p => [...p, { modId: m, tier: t }])} onRemove={m => setActiveMods(p => p.filter(x => x.modId !== m))} />
        </div>
      )}
    </Card>
  );
};

export default UltimatumEvCard;
