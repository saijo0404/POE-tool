import React from 'react';
import type { FactionType, LogbookCalculation } from '../../../domain/expedition/types';
import { EXPEDITION_FACTIONS, EXPEDITION_REMNANTS } from '../../../domain/expedition/expeditionData';

interface LogbookEvSectionProps {
  faction: FactionType;
  onFactionChange: (f: FactionType) => void;
  areaLevel: number;
  onAreaLevelChange: (v: number) => void;
  logbookCost: number;
  onLogbookCostChange: (v: number) => void;
  selectedRemnants: string[];
  onToggleRemnant: (id: string) => void;
  onClearRemnants: () => void;
  ev: LogbookCalculation;
}

export const LogbookEvSection: React.FC<LogbookEvSectionProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <LogbookConfigBar
      faction={props.faction}
      onFactionChange={props.onFactionChange}
      areaLevel={props.areaLevel}
      onAreaLevelChange={props.onAreaLevelChange}
      cost={props.logbookCost}
      onCostChange={props.onLogbookCostChange}
    />
    <RemnantsChipsGrid
      selected={props.selectedRemnants}
      onToggle={props.onToggleRemnant}
      onClear={props.onClearRemnants}
    />
    {props.ev.hasDeadlyAffixes && (
      <DeadlyWarningBanner names={props.ev.deadlyRemnantNames} />
    )}
    <LogbookEvSummary ev={props.ev} />
  </div>
);

interface LogbookConfigBarProps {
  faction: FactionType;
  onFactionChange: (f: FactionType) => void;
  areaLevel: number;
  onAreaLevelChange: (v: number) => void;
  cost: number;
  onCostChange: (v: number) => void;
}

const LogbookConfigBar: React.FC<LogbookConfigBarProps> = (props) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
    <span style={{ fontSize: '11px', color: '#8b949e' }}>勢力:</span>
    {EXPEDITION_FACTIONS.map((f) => (
      <button
        key={f.id}
        onClick={() => props.onFactionChange(f.id)}
        style={{
          padding: '3px 8px',
          borderRadius: '4px',
          border: 'none',
          background: props.faction === f.id ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        {f.nameZh}
      </button>
    ))}
    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#8b949e' }}>區域物等:</span>
    <input
      type="number"
      value={props.areaLevel}
      onChange={(e) => props.onAreaLevelChange(Number(e.target.value) || 0)}
      style={{ width: '45px', padding: '2px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '3px' }}
    />
    <span style={{ fontSize: '11px', color: '#8b949e' }}>成本 (C):</span>
    <input
      type="number"
      value={props.cost}
      onChange={(e) => props.onCostChange(Number(e.target.value) || 0)}
      style={{ width: '50px', padding: '2px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '3px' }}
    />
  </div>
);

const RemnantsChipsGrid: React.FC<{
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}> = ({ selected, onToggle, onClear }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: '#8b949e' }}>勾選串聯殘骸詞綴:</span>
      {selected.length > 0 && (
        <button onClick={onClear} style={{ padding: '1px 6px', background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '10px' }}>
          全部清除
        </button>
      )}
    </div>
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {EXPEDITION_REMNANTS.map((r) => {
        const isSel = selected.includes(r.id);
        const bg = isSel ? (r.isDeadly ? '#4d1e1c' : '#1b4725') : '#161b22';
        const border = isSel ? (r.isDeadly ? '#f85149' : '#2ea043') : '#30363d';
        return (
          <button
            key={r.id}
            onClick={() => onToggle(r.id)}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: `1px solid ${border}`,
              background: bg,
              color: '#c9d1d9',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            {r.isDeadly ? '⚠️ ' : ''}{r.nameZh}
          </button>
        );
      })}
    </div>
  </div>
);

const DeadlyWarningBanner: React.FC<{ names: string[] }> = ({ names }) => (
  <div style={{ padding: '6px 10px', background: '#3b1212', border: '1px solid #f85149', borderRadius: '4px', color: '#f85149', fontSize: '11px' }}>
    🚨 <strong>偵測到致命詞綴：</strong> {names.join('、')}，請務必確認機體傷害類型能否通關！
  </div>
);

const LogbookEvSummary: React.FC<{ ev: LogbookCalculation }> = ({ ev }) => (
  <div style={{ padding: '8px 12px', background: '#0d1117', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <div style={{ fontSize: '11px', color: '#8b949e' }}>
        符文怪加成: +{ev.totalRunicMonsterBonus}% | 掉落數量: +{ev.totalQuantityBonus}% | 預估文物: ~{ev.estimatedArtifactsTotal}
      </div>
      <div>
        預期淨利: <span style={{ color: ev.netProfitChaos >= 0 ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>
          {ev.netProfitChaos > 0 ? `+${ev.netProfitChaos}` : ev.netProfitChaos} C
        </span>
        <span style={{ color: '#8b949e', fontSize: '11px', marginLeft: '6px' }}>(總產出: {ev.estimatedGrossChaos}C)</span>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '4px',
          background: ev.recommendation === 'run' ? '#1b4725' : ev.recommendation === 'warning_deadly' ? '#4d1e1c' : '#3b2300',
          color: ev.recommendation === 'run' ? '#3fb950' : ev.recommendation === 'warning_deadly' ? '#f85149' : '#d29922',
          fontSize: '11px',
          fontWeight: 'bold',
        }}
      >
        {ev.recommendation === 'run' ? '強烈推薦' : ev.recommendation === 'warning_deadly' ? '致命風險' : '建議重調'}
      </span>
    </div>
  </div>
);
