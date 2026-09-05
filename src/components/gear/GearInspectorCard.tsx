import React, { useMemo } from 'react';
import type { ParsedItem } from '../../types/poe';
import { evaluateGearPotential } from '../../domain/gear/gearInspector';
import { Sparkles, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { Card } from '../ui';

interface GearInspectorCardProps {
  item: ParsedItem;
}

export const GearInspectorCard: React.FC<GearInspectorCardProps> = ({ item }) => {
  const report = useMemo(() => evaluateGearPotential(item), [item]);
  const { score, grade, isHighValueBase, spaces, prefixes, suffixes, recommendations } = report;

  const gradeColor = grade === 'S' ? '#fbbf24' : grade === 'A' ? '#38bdf8' : grade === 'B' ? '#a3e635' : '#94a3b8';

  return (
    <Card
      variant="default"
      padding="sm"
      style={{
        padding: '14px',
        border: isHighValueBase ? '1.5px solid #fbbf24' : '1px solid var(--border-gold)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-gold)' }}>
            {item.name || item.baseType}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{item.baseType} {item.itemLevel ? `(iLvl ${item.itemLevel})` : ''}</span>
            {item.spirit !== undefined && (
              <span style={{ color: '#c084fc', fontWeight: 600 }}>[精魂: {item.spirit}]</span>
            )}
            {item.engine === 'poe2' && (
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>[PoE 2]</span>
            )}
          </div>
        </div>

        {/* Grade Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(0, 0, 0, 0.4)', padding: '4px 10px',
          borderRadius: '4px', border: `1px solid ${gradeColor}`
        }}>
          {isHighValueBase && <Sparkles size={14} color="#fbbf24" />}
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: gradeColor }}>
            評級 {grade} ({score}分)
          </span>
        </div>
      </div>

      {isHighValueBase && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)',
          padding: '6px 10px', borderRadius: '4px', fontSize: '0.78rem', color: '#fef08a',
          marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Sparkles size={13} /> 🌟 頂級工藝胚子！具備極高的高階詞綴潛力與保值度。
        </div>
      )}

      {/* Affix Slots */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        {/* Prefixes */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>前綴 (Prefixes)</span>
            <span style={{ color: 'var(--text-muted)' }}>{prefixes.length} / {spaces.maxPrefixes}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {prefixes.map((p, idx) => (
              <div key={idx} style={{ fontSize: '0.74rem', display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.text}</span>
                {p.tierLabel && <span style={{ color: '#fbbf24', marginLeft: '4px', fontWeight: 600 }}>{p.tierLabel}</span>}
              </div>
            ))}
            {Array.from({ length: spaces.openPrefixes }).map((_, i) => (
              <div key={`open-p-${i}`} style={{ fontSize: '0.72rem', color: '#4ade80', fontStyle: 'italic' }}>
                + 空前綴 (Open Slot)
              </div>
            ))}
          </div>
        </div>

        {/* Suffixes */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>後綴 (Suffixes)</span>
            <span style={{ color: 'var(--text-muted)' }}>{suffixes.length} / {spaces.maxSuffixes}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {suffixes.map((s, idx) => (
              <div key={idx} style={{ fontSize: '0.74rem', display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.text}</span>
                {s.tierLabel && <span style={{ color: '#38bdf8', marginLeft: '4px', fontWeight: 600 }}>{s.tierLabel}</span>}
              </div>
            ))}
            {Array.from({ length: spaces.openSuffixes }).map((_, i) => (
              <div key={`open-s-${i}`} style={{ fontSize: '0.72rem', color: '#4ade80', fontStyle: 'italic' }}>
                + 空後綴 (Open Slot)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crafting Options Badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <span style={{
          fontSize: '0.72rem', padding: '2px 8px', borderRadius: '3px',
          background: spaces.canCraftBenchMod ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.12)',
          color: spaces.canCraftBenchMod ? '#4ade80' : '#f87171',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          {spaces.canCraftBenchMod ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
          {spaces.canCraftBenchMod ? '可上工藝台附魔' : spaces.hasCraftedMod ? '已有工藝附魔' : '詞綴已滿無空間'}
        </span>

        {spaces.canPrefixesCannotBeChanged && (
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            可保前洗後 (2 Div)
          </span>
        )}
        {spaces.canSuffixesCannotBeChanged && (
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            可保後洗前 (2 Div)
          </span>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-gold)', fontWeight: 600, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wrench size={12} /> 工藝建議策略：
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {recommendations.map((r, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
