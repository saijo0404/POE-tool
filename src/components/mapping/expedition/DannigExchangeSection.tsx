import React from 'react';
import type { DannigArbitrageResult, FactionType } from '../../../domain/expedition/types';
import { EXPEDITION_FACTIONS } from '../../../domain/expedition/expeditionData';

interface DannigExchangeSectionProps {
  sunArtifacts: number;
  onSunArtifactsChange: (v: number) => void;
  targetFaction: FactionType;
  onTargetFactionChange: (f: FactionType) => void;
  sunRate: number;
  onSunRateChange: (v: number) => void;
  targetRate: number;
  onTargetRateChange: (v: number) => void;
  result: DannigArbitrageResult;
}

export const DannigExchangeSection: React.FC<DannigExchangeSectionProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <InputsGrid
      sunArtifacts={props.sunArtifacts}
      onSunArtifactsChange={props.onSunArtifactsChange}
      targetFaction={props.targetFaction}
      onTargetFactionChange={props.onTargetFactionChange}
      sunRate={props.sunRate}
      onSunRateChange={props.onSunRateChange}
      targetRate={props.targetRate}
      onTargetRateChange={props.onTargetRateChange}
    />
    <ExchangeSummaryBanner result={props.result} />
  </div>
);

interface InputsGridProps {
  sunArtifacts: number;
  onSunArtifactsChange: (v: number) => void;
  targetFaction: FactionType;
  onTargetFactionChange: (f: FactionType) => void;
  sunRate: number;
  onSunRateChange: (v: number) => void;
  targetRate: number;
  onTargetRateChange: (v: number) => void;
}

const InputsGrid: React.FC<InputsGridProps> = (props) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#8b949e' }}>丹尼格太陽文物數量</label>
      <input
        type="number"
        value={props.sunArtifacts}
        onChange={(e) => props.onSunArtifactsChange(Number(e.target.value) || 0)}
        style={{ width: '100%', padding: '4px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
      />
    </div>
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#8b949e' }}>目標兌換勢力</label>
      <select
        value={props.targetFaction}
        onChange={(e) => props.onTargetFactionChange(e.target.value as FactionType)}
        style={{ width: '100%', padding: '4px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
      >
        {EXPEDITION_FACTIONS.filter((f) => f.id !== 'sun').map((f) => (
          <option key={f.id} value={f.id}>{f.nameZh} ({f.npcZh})</option>
        ))}
      </select>
    </div>
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#8b949e' }}>太陽文物單價 (C)</label>
      <input
        type="number"
        step="0.01"
        value={props.sunRate}
        onChange={(e) => props.onSunRateChange(Number(e.target.value) || 0)}
        style={{ width: '100%', padding: '4px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
      />
    </div>
    <div>
      <label style={{ display: 'block', fontSize: '11px', color: '#8b949e' }}>目標文物單價 (C)</label>
      <input
        type="number"
        step="0.01"
        value={props.targetRate}
        onChange={(e) => props.onTargetRateChange(Number(e.target.value) || 0)}
        style={{ width: '100%', padding: '4px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
      />
    </div>
  </div>
);

const ExchangeSummaryBanner: React.FC<{ result: DannigArbitrageResult }> = ({ result }) => (
  <div
    style={{
      padding: '8px 12px',
      background: '#0d1117',
      borderRadius: '6px',
      border: '1px solid #30363d',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <div>
      <span style={{ color: '#8b949e', fontSize: '11px' }}>預計折算獲得文物: </span>
      <span style={{ color: '#e3b341', fontWeight: 'bold' }}>{result.convertedCount} 個</span>
    </div>
    <div>
      <span style={{ color: '#8b949e', fontSize: '11px' }}>套利價差盈虧: </span>
      <span style={{ color: result.netProfitChaos >= 0 ? '#3fb950' : '#f85149', fontWeight: 'bold', fontSize: '14px' }}>
        {result.netProfitChaos > 0 ? `+${result.netProfitChaos}` : result.netProfitChaos} C
      </span>
    </div>
  </div>
);
