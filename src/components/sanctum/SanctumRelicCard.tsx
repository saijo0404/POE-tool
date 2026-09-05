import React, { useState, useMemo } from 'react';
import { Compass, ShieldCheck, Coins, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import type { SanctumPlaystyle, SanctumRelic, SanctumRelicAffix } from '../../domain/sanctum/types';
import { COMMON_RELIC_AFFIXES } from '../../domain/sanctum/sanctumData';
import { forecastSanctumRun } from '../../domain/sanctum/sanctumRelicEngine';
import { Card, Button } from '../ui';

export const SanctumRelicCard: React.FC = () => {
  const [playstyle, setPlaystyle] = useState<SanctumPlaystyle>('balanced');
  const [activeAffixIds, setActiveAffixIds] = useState<string[]>([
    'relic_mitigation_high', 'relic_discount_high', 'relic_divine_drop_2'
  ]);

  const relics: SanctumRelic[] = useMemo(() => {
    const selectedAffixes = COMMON_RELIC_AFFIXES.filter(a => activeAffixIds.includes(a.id));
    return [{ id: 'relic_board_1', name: '配置中的聖物群', affixes: selectedAffixes }];
  }, [activeAffixIds]);

  const forecast = useMemo(() => forecastSanctumRun({ relics, preferredPlaystyle: playstyle }), [relics, playstyle]);
  const handleToggleAffix = (id: string) => setActiveAffixIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f39c12', fontWeight: 'bold' }}>
          <Compass size={18} />
          <span>禁忌聖所聖物詞綴與 4 層收益預估 (Sanctum Relic & Floor EV)</span>
        </div>
        <SurvivalBadge rate={forecast.survivalRatePct} />
      </div>

      <PlaystyleSelector active={playstyle} onChange={setPlaystyle} />
      <RelicAffixList activeIds={activeAffixIds} onToggle={handleToggleAffix} />
      <ForecastMetricsMeter forecast={forecast} />
      <StrategicNotesPanel path={forecast.recommendedPath} notes={forecast.strategicNotes} />
    </Card>
  );
};

const SurvivalBadge: React.FC<{ rate: number }> = ({ rate }) => {
  const color = rate >= 80 ? '#2ecc71' : rate >= 60 ? '#f39c12' : '#e74c3c';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${color}22`, padding: '3px 10px', borderRadius: '4px', border: `1px solid ${color}66` }}>
      <ShieldCheck size={14} color={color} />
      <span style={{ color, fontWeight: 'bold', fontSize: '0.85rem' }}>預期通關率 {rate}%</span>
    </div>
  );
};

const PlaystyleSelector: React.FC<{
  active: SanctumPlaystyle;
  onChange: (p: SanctumPlaystyle) => void;
}> = ({ active, onChange }) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <span style={{ fontSize: '0.8rem', color: '#888' }}>偏好風格:</span>
    <Button
      size="sm"
      variant={active === 'high_yield' ? 'primary' : 'secondary'}
      onClick={() => onChange('high_yield')}
    >
      高收益冒險 (High Yield)
    </Button>
    <Button
      size="sm"
      variant={active === 'balanced' ? 'primary' : 'secondary'}
      onClick={() => onChange('balanced')}
    >
      平衡推進 (Balanced)
    </Button>
    <Button
      size="sm"
      variant={active === 'safe_clear' ? 'primary' : 'secondary'}
      onClick={() => onChange('safe_clear')}
    >
      穩健通關 (Safe Clear)
    </Button>
  </div>
);

const RelicAffixList: React.FC<{
  activeIds: string[];
  onToggle: (id: string) => void;
}> = ({ activeIds, onToggle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <span style={{ fontSize: '0.8rem', color: '#888' }}>聖物詞綴配置 (已啟用 {activeIds.length} 個詞綴):</span>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {COMMON_RELIC_AFFIXES.map((affix) => {
        const isSelected = activeIds.includes(affix.id);
        return (
          <AffixBadge key={affix.id} affix={affix} isSelected={isSelected} onToggle={() => onToggle(affix.id)} />
        );
      })}
    </div>
  </div>
);

const AffixBadge: React.FC<{ affix: SanctumRelicAffix; isSelected: boolean; onToggle: () => void }> = ({ affix, isSelected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    style={{
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '0.78rem',
      cursor: 'pointer',
      background: isSelected ? 'rgba(243, 156, 18, 0.2)' : 'rgba(255, 255, 255, 0.04)',
      color: isSelected ? '#f39c12' : '#888',
      border: `1px solid ${isSelected ? 'rgba(243, 156, 18, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}
  >
    <span>{affix.nameZh}</span>
  </button>
);

const ForecastMetricsMeter: React.FC<{ forecast: ReturnType<typeof forecastSanctumRun> }> = ({ forecast }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '4px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><Coins size={12} color="#f39c12" />預估淨利 (Chaos)</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f39c12' }}>~{forecast.expectedTotalNetChaos} c</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} color="#3498db" />預估淨利 (Divine)</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3498db' }}>~{forecast.expectedTotalNetDivine} Div</span>
    </div>
  </div>
);

const StrategicNotesPanel: React.FC<{ path: string[]; notes: string[] }> = ({ path, notes }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ccc' }}>
      <Sparkles size={13} color="#2ecc71" />
      <span>優先路徑推薦: <strong>{path.join(' ➔ ')}</strong></span>
    </div>
    {notes.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {notes.map((note, idx) => (
          <div key={idx} style={{ fontSize: '0.74rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} color="#888" />
            <span>{note}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);
