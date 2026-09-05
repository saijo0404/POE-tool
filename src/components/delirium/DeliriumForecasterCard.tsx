import React, { useState, useMemo } from 'react';
import { CloudFog, ChevronDown, ChevronUp, Shield, Sparkles } from 'lucide-react';
import { simulateDeliriumEv } from '../../domain/delirium/deliriumEvEngine';
import type { DeliriumPercent, DeliriumRewardType, DeliriumRecommendation } from '../../domain/delirium/types';

interface DeliriumForecasterCardProps {
  divineRate?: number;
  onShowToast?: (msg: string) => void;
}

const REWARD_TYPES: { type: DeliriumRewardType; label: string }[] = [
  { type: 'scarabs', label: '聖甲蟲 (Scarabs)' },
  { type: 'currency', label: '通貨 (Currency)' },
  { type: 'divination', label: '命運卡 (Divination)' },
  { type: 'essences', label: '精髓 (Essences)' },
  { type: 'fossils', label: '化石 (Fossils)' },
  { type: 'generic', label: '一般機制 (Generic)' }
];

function getRecBadge(rec: DeliriumRecommendation) {
  if (rec === 'HIGHLY_PROFITABLE') {
    return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#6ee7b7', text: '強烈推薦 (High Profit)' };
  }
  if (rec === 'MODERATE_PROFIT') {
    return { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', color: '#fcd34d', text: '穩定累積 (Moderate)' };
  }
  return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#fca5a5', text: '高風險虧損 (Risk Loss)' };
}

function PercentSelector({ value, onChange }: { value: DeliriumPercent; onChange: (val: DeliriumPercent) => void }) {
  const options: DeliriumPercent[] = [0, 20, 40, 60, 80, 100];
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>瞻妄度 (Delirium %):</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {options.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              background: value === p ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.05)',
              color: value === p ? '#000' : 'var(--text-light)',
              fontWeight: value === p ? 700 : 500,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {p === 0 ? '0% (迷霧鏡)' : `${p}% (${p / 20} 顆)`}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfitDisplay({ profit, roi, divineRate }: { profit: number; roi: number; divineRate: number }) {
  const divVal = Math.round((profit / (divineRate || 150)) * 100) / 100;
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>預估淨收益 (Net Profit)</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: profit >= 0 ? '#86efac' : '#fca5a5' }}>
        {profit >= 0 ? `+${profit}` : profit} C <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>({divVal} Div, ROI {roi}%)</span>
      </div>
    </div>
  );
}

function SummaryRow({
  profit,
  roi,
  tiers,
  splinters,
  dmgReduction,
  rec,
  divineRate
}: {
  profit: number;
  roi: number;
  tiers: number;
  splinters: number;
  dmgReduction: number;
  rec: DeliriumRecommendation;
  divineRate: number;
}) {
  const badge = getRecBadge(rec);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px' }}>
      <ProfitDisplay profit={profit} roi={roi} divineRate={divineRate} />
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>獎勵階層 / 裂片</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-light)' }}>{tiers} 階 / ~{splinters} 片</div>
      </div>
      {dmgReduction > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#fca5a5' }}>
          <Shield size={14} /> 怪物減傷: -{dmgReduction}%
        </div>
      )}
      <div style={{ padding: '6px 12px', borderRadius: '16px', background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontWeight: 700, fontSize: '0.85rem' }}>
        {badge.text}
      </div>
    </div>
  );
}

function InputsGrid({
  kills,
  onChangeKills,
  rewardType,
  onChangeRewardType,
  orbCost,
  onChangeOrbCost
}: {
  kills: number;
  onChangeKills: (k: number) => void;
  rewardType: DeliriumRewardType;
  onChangeRewardType: (t: DeliriumRewardType) => void;
  orbCost: number;
  onChangeOrbCost: (c: number) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>獎勵類型 (Reward Pool):</label>
        <select
          value={rewardType}
          onChange={e => onChangeRewardType(e.target.value as DeliriumRewardType)}
          style={{ width: '100%', padding: '5px 8px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
        >
          {REWARD_TYPES.map(r => (<option key={r.type} value={r.type}>{r.label}</option>))}
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>預估擊殺怪物數 ({kills} 隻):</label>
        <input type="range" min="400" max="2000" step="50" value={kills} onChange={e => onChangeKills(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--text-gold)' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>單顆寶珠成本 (Chaos):</label>
        <input type="number" value={orbCost} onChange={e => onChangeOrbCost(Math.max(0, Number(e.target.value) || 0))} style={{ width: '100%', padding: '5px 8px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }} />
      </div>
    </div>
  );
}

function CardHeader({ isOpen, onToggle, percent }: { isOpen: boolean; onToggle: () => void; percent: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CloudFog size={18} color="#c084fc" />
        <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
          迷霧瞻妄階層回報與寶珠精算 (Delirium EV Forecaster)
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{percent}% 瞻妄度</span>
      </div>
      {isOpen ? <ChevronUp size={16} color="var(--text-dim)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
    </div>
  );
}

export const DeliriumForecasterCard: React.FC<DeliriumForecasterCardProps> = ({
  divineRate = 150
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [deliriumPercent, setDeliriumPercent] = useState<DeliriumPercent>(60);
  const [rewardType, setRewardType] = useState<DeliriumRewardType>('scarabs');
  const [kills, setKills] = useState<number>(1000);
  const [orbCost, setOrbCost] = useState<number>(35);

  const sim = useMemo(() => {
    return simulateDeliriumEv({ deliriumPercent, rewardType, monsterPackCount: kills, orbCostChaos: orbCost, divineRate });
  }, [deliriumPercent, rewardType, kills, orbCost, divineRate]);

  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <CardHeader isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} percent={deliriumPercent} />
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SummaryRow profit={sim.netProfitChaos} roi={sim.roiPercent} tiers={sim.achievableTiers} splinters={sim.splinterDropAvg} dmgReduction={sim.monsterDamageReductionPercent} rec={sim.recommendation} divineRate={divineRate} />
          <PercentSelector value={deliriumPercent} onChange={setDeliriumPercent} />
          <InputsGrid kills={kills} onChangeKills={setKills} rewardType={rewardType} onChangeRewardType={setRewardType} orbCost={orbCost} onChangeOrbCost={setOrbCost} />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--text-gold)" />
            <span>{sim.recommendationText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliriumForecasterCard;
