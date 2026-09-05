import React, { useState, useMemo } from 'react';
import { Gem, ChevronDown, ChevronUp, Clipboard, ShieldCheck } from 'lucide-react';
import { TIMELESS_JEWELS } from '../../domain/jewel/timelessData';
import {
  evaluateTimelessJewel,
  parseTimelessJewelText
} from '../../domain/jewel/timelessEvaluator';
import type { TimelessJewelType } from '../../domain/jewel/types';
import { Card, Button } from '../ui';

interface TimelessJewelCardProps {
  divineRate?: number;
  onShowToast?: (msg: string) => void;
}

function getTierBadgeStyle(tier: 'S' | 'A' | 'B' | 'C') {
  if (tier === 'S') return { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', color: '#facc15' };
  if (tier === 'A') return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#6ee7b7' };
  if (tier === 'B') return { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', color: '#93c5fd' };
  return { bg: 'rgba(156, 163, 175, 0.2)', border: '#9ca3af', color: '#d1d5db' };
}

function JewelTypeSelector({
  value,
  onChange
}: {
  value: TimelessJewelType;
  onChange: (t: TimelessJewelType) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>珠寶類別 (Jewel Type):</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value as TimelessJewelType)}
        style={{ width: '100%', padding: '6px 10px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.82rem' }}
      >
        {TIMELESS_JEWELS.map(j => (
          <option key={j.id} value={j.id}>{j.nameZh}</option>
        ))}
      </select>
    </div>
  );
}

function LeaderSelector({
  leaders,
  selectedId,
  onSelect
}: {
  leaders: typeof TIMELESS_JEWELS[0]['leaders'];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>將領/神明 (Leader / Conquered by):</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {leaders.map(l => (
          <Button
            key={l.id}
            size="sm"
            variant={selectedId === l.id ? 'primary' : 'secondary'}
            onClick={() => onSelect(l.id)}
          >
            {l.nameZh}
          </Button>
        ))}
      </div>
    </div>
  );
}

function SeedInput({
  seed,
  onChange,
  min,
  max
}: {
  seed: number;
  onChange: (s: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
        種子碼 (Seed Number, 範圍 {min} ~ {max}):
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="number"
          value={seed}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
          style={{ width: '130px', padding: '6px 10px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '4px' }}
        />
        <button type="button" onClick={() => onChange(Math.max(min, seed - 100))} style={{ padding: '4px 8px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }}>-100</button>
        <button type="button" onClick={() => onChange(Math.min(max, seed + 100))} style={{ padding: '4px 8px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }}>+100</button>
      </div>
    </div>
  );
}

function SynergyTags({ builds }: { builds: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>適配主流流派：</span>
      {builds.map((b, i) => (
        <span key={i} style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(234, 179, 8, 0.1)', color: '#fde047', borderRadius: '3px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
          {b}
        </span>
      ))}
    </div>
  );
}

function KeystoneResultDisplay({
  res,
  divineRate
}: {
  res: ReturnType<typeof evaluateTimelessJewel>;
  divineRate: number;
}) {
  const badge = getTierBadgeStyle(res.ratingTier);
  const minDiv = Math.round((res.estimatedPriceRangeChaos[0] / divineRate) * 10) / 10;
  const maxDiv = Math.round((res.estimatedPriceRangeChaos[1] / divineRate) * 10) / 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--text-gold)" />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-gold)' }}>核心基石：{res.keystoneNameZh}</span>
          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
            評級 {res.ratingTier} 階
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#86efac', fontWeight: 700 }}>
          市價約 {res.estimatedPriceRangeChaos[0]} ~ {res.estimatedPriceRangeChaos[1]} C ({minDiv} ~ {maxDiv} Div)
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px' }}>
        {res.keystoneDescriptionZh}
      </div>
      <SynergyTags builds={res.synergyBuilds} />
    </div>
  );
}

function CardHeader({ isOpen, onToggle, nameZh }: { isOpen: boolean; onToggle: () => void; nameZh: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Gem size={18} color="#f59e0b" />
        <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
          永恆軍團珠寶種子鑑定 (Timeless Jewel Evaluator)
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{nameZh}</span>
      </div>
      {isOpen ? <ChevronUp size={16} color="var(--text-dim)" /> : <ChevronDown size={16} color="var(--text-dim)" />}
    </div>
  );
}

function ClipboardButton({ onPaste }: { onPaste: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        size="sm"
        variant="secondary"
        onClick={onPaste}
        icon={<Clipboard size={13} />}
      >
        讀取剪貼簿 (Ctrl+C 自動解析)
      </Button>
    </div>
  );
}

export const TimelessJewelCard: React.FC<TimelessJewelCardProps> = ({
  divineRate = 150,
  onShowToast
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [jewelType, setJewelType] = useState<TimelessJewelType>('glorious_vanity');
  const [leaderId, setLeaderId] = useState<string>('doryani');
  const [seedNumber, setSeedNumber] = useState<number>(3120);

  const jewelDef = useMemo(() => TIMELESS_JEWELS.find(j => j.id === jewelType) || TIMELESS_JEWELS[0], [jewelType]);
  const result = useMemo(() => evaluateTimelessJewel(jewelType, leaderId, seedNumber), [jewelType, leaderId, seedNumber]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const p = parseTimelessJewelText(text);
      if (p.jewelType) {
        setJewelType(p.jewelType);
        if (p.leaderId) setLeaderId(p.leaderId);
        if (p.seedNumber) setSeedNumber(p.seedNumber);
        onShowToast?.(`已識別剪貼簿珠寶：${p.jewelType} (種子 ${p.seedNumber})`);
      } else {
        onShowToast?.('剪貼簿文字中未偵測到永恆珠寶');
      }
    } catch {
      onShowToast?.('無法讀取剪貼簿');
    }
  };

  return (
    <Card variant="default" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <CardHeader isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} nameZh={jewelDef.nameZh} />
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ClipboardButton onPaste={handlePaste} />
          <KeystoneResultDisplay res={result} divineRate={divineRate} />
          <JewelTypeSelector value={jewelType} onChange={t => { setJewelType(t); setLeaderId(TIMELESS_JEWELS.find(x => x.id === t)!.leaders[0].id); }} />
          <LeaderSelector leaders={jewelDef.leaders} selectedId={leaderId} onSelect={setLeaderId} />
          <SeedInput seed={seedNumber} onChange={setSeedNumber} min={jewelDef.minSeed} max={jewelDef.maxSeed} />
        </div>
      )}
    </Card>
  );
};

export default TimelessJewelCard;
