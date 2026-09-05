import React, { useState, useMemo } from 'react';
import { TreePine, ShieldCheck, Sparkles, AlertCircle, Award } from 'lucide-react';
import type { WildwoodAscendancyClass, CharmSlotInput, WildwoodConfig, WildwoodEvaluationResult } from '../../domain/wildwood/types';
import { WILDWOOD_NODES, CHARM_AFFIXES } from '../../domain/wildwood/wildwoodData';
import { evaluateWildwoodBuild } from '../../domain/wildwood/charmEvaluator';

export const WildwoodCharmsCard: React.FC = () => {
  const [ascendancy, setAscendancy] = useState<WildwoodAscendancyClass>('primalist');
  const [allocatedNodes, setAllocatedNodes] = useState<string[]>(['primalist_charms_1', 'primalist_charms_2', 'primalist_charms_3']);
  const [charms, setCharms] = useState<CharmSlotInput[]>([
    { slotIndex: 0, affix1Id: 'charm_all_res', affix1Roll: 15, affix2Id: 'charm_max_life', affix2Roll: 50 },
    { slotIndex: 1, affix1Id: 'charm_suppress', affix1Roll: 12 },
    { slotIndex: 2, affix1Id: 'charm_flask_effect', affix1Roll: 18 }
  ]);

  const config: WildwoodConfig = useMemo(() => ({
    ascendancy, allocatedNodeIds: allocatedNodes, charms: ascendancy === 'primalist' ? charms : []
  }), [ascendancy, allocatedNodes, charms]);

  const evaluation = useMemo(() => evaluateWildwoodBuild(config), [config]);
  const handleToggleNode = (id: string) => setAllocatedNodes(p => p.includes(id) ? p.filter(n => n !== id) : [...p, id]);
  const handleUpdateCharm = (idx: number, patch: Partial<CharmSlotInput>) => setCharms(p => p.map((c, i) => i === idx ? { ...c, ...patch } : c));

  return (
    <div className="poe-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <CardHeader tier={evaluation.fitTier} score={evaluation.fitScore} />
      <AscendancyTabs active={ascendancy} onChange={(asc) => { setAscendancy(asc); setAllocatedNodes([]); }} />
      <MajorNodesSelector ascendancy={ascendancy} allocated={allocatedNodes} onToggle={handleToggleNode} />
      {ascendancy === 'primalist' && <CharmSlotsList charms={charms} onUpdate={handleUpdateCharm} />}
      <EvaluationSummaryPanel evaluation={evaluation} />
    </div>
  );
};

const CardHeader: React.FC<{ tier: string; score: number }> = ({ tier, score }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2ecc71', fontWeight: 'bold' }}>
      <TreePine size={18} />
      <span>荒野野靈昇華與符咒精算 (Wildwood Ascendancy & Charms)</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(46, 204, 113, 0.15)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(46, 204, 113, 0.4)' }}>
      <Award size={14} color="#2ecc71" />
      <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '0.85rem' }}>Tier {tier} ({score}分)</span>
    </div>
  </div>
);

const AscendancyTabs: React.FC<{
  active: WildwoodAscendancyClass;
  onChange: (asc: WildwoodAscendancyClass) => void;
}> = ({ active, onChange }) => (
  <div style={{ display: 'flex', gap: '8px' }}>
    <button type="button" className={`btn-filter ${active === 'warden' ? 'active' : ''}`} onClick={() => onChange('warden')}>
      典獄長 (Warden)
    </button>
    <button type="button" className={`btn-filter ${active === 'warlock' ? 'active' : ''}`} onClick={() => onChange('warlock')}>
      咒術師 (Warlock)
    </button>
    <button type="button" className={`btn-filter ${active === 'primalist' ? 'active' : ''}`} onClick={() => onChange('primalist')}>
      荒野追獵者 (Primalist)
    </button>
  </div>
);

const MajorNodesSelector: React.FC<{
  ascendancy: WildwoodAscendancyClass;
  allocated: string[];
  onToggle: (id: string) => void;
}> = ({ ascendancy, allocated, onToggle }) => {
  const nodes = WILDWOOD_NODES.filter(n => n.ascendancy === ascendancy);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '0.8rem', color: '#888' }}>主要昇華節點 (Major Nodes):</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
        {nodes.map(n => (
          <NodeItem key={n.id} id={n.id} name={n.nameZh} desc={n.descriptionZh} isAlloc={allocated.includes(n.id)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
};

const NodeItem: React.FC<{ id: string; name: string; desc: string; isAlloc: boolean; onToggle: (id: string) => void }> = ({ id, name, desc, isAlloc, onToggle }) => (
  <div
    onClick={() => onToggle(id)}
    style={{
      padding: '8px 10px',
      borderRadius: '4px',
      background: isAlloc ? 'rgba(46, 204, 113, 0.12)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isAlloc ? 'rgba(46, 204, 113, 0.5)' : 'rgba(255,255,255,0.06)'}`,
      cursor: 'pointer'
    }}
  >
    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isAlloc ? '#2ecc71' : '#ccc' }}>{name}</div>
    <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '2px' }}>{desc}</div>
  </div>
);

const CharmSlotsList: React.FC<{
  charms: CharmSlotInput[];
  onUpdate: (idx: number, patch: Partial<CharmSlotInput>) => void;
}> = ({ charms, onUpdate }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <span style={{ fontSize: '0.8rem', color: '#888' }}>符咒插槽配置 (Charm Sockets):</span>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
      {charms.map((c, i) => (
        <CharmSlotRow key={i} slotIndex={i} charm={c} onUpdate={(patch) => onUpdate(i, patch)} />
      ))}
    </div>
  </div>
);

const CharmSlotRow: React.FC<{
  slotIndex: number;
  charm: CharmSlotInput;
  onUpdate: (patch: Partial<CharmSlotInput>) => void;
}> = ({ slotIndex, charm, onUpdate }) => (
  <div style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <span style={{ fontSize: '0.78rem', color: '#ffd700', fontWeight: 600 }}>插槽 {slotIndex + 1}</span>
    <select
      aria-label={`插槽 ${slotIndex + 1} 詞綴`}
      value={charm.affix1Id || ''}
      onChange={(e) => {
        const affix = CHARM_AFFIXES.find(a => a.id === e.target.value);
        onUpdate({ affix1Id: e.target.value, affix1Roll: affix?.maxRoll || 0 });
      }}
      style={{ padding: '4px 6px', fontSize: '0.75rem', background: '#1e1e1e', color: '#eee', border: '1px solid #444', borderRadius: '3px' }}
    >
      <option value="">-- 選擇詞綴 1 --</option>
      {CHARM_AFFIXES.map(a => <option key={a.id} value={a.id}>[{a.archetypeZh}] {a.nameZh}</option>)}
    </select>
    {charm.affix1Id && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
        <span style={{ color: '#888' }}>數值:</span>
        <input
          aria-label={`插槽 ${slotIndex + 1} 詞綴數值`}
          type="number"
          value={charm.affix1Roll ?? 0}
          onChange={(e) => onUpdate({ affix1Roll: Number(e.target.value) })}
          style={{ width: '60px', padding: '2px 4px', fontSize: '0.75rem', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '3px' }}
        />
      </div>
    )}
  </div>
);

const EvaluationSummaryPanel: React.FC<{ evaluation: WildwoodEvaluationResult }> = ({ evaluation }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {Object.entries(evaluation.aggregateStats).map(([k, v]) => (
        <span key={k} style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', padding: '2px 8px', borderRadius: '3px', fontSize: '0.75rem', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
          <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} />
          {k}: +{v}
        </span>
      ))}
      {evaluation.specialFlags.map((flag, idx) => (
        <span key={idx} style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', padding: '2px 8px', borderRadius: '3px', fontSize: '0.75rem', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
          <ShieldCheck size={11} style={{ display: 'inline', marginRight: '4px' }} />
          {flag}
        </span>
      ))}
    </div>
    {evaluation.recommendations.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
        {evaluation.recommendations.map((rec, i) => (
          <div key={i} style={{ fontSize: '0.73rem', color: '#e67e22', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} />
            <span>{rec}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);
