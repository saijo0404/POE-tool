import React from 'react';
import type { BestiaryMissionResult, MissionTier } from '../../domain/bestiary/types';

interface BestiaryMissionSectionProps {
  missionTier: MissionTier;
  onTierChange: (t: MissionTier) => void;
  missionCost: number;
  onCostChange: (c: number) => void;
  missionEv: BestiaryMissionResult;
}

export const BestiaryMissionSection: React.FC<BestiaryMissionSectionProps> = ({
  missionTier,
  onTierChange,
  missionCost,
  onCostChange,
  missionEv,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <TierCostControl
      missionTier={missionTier}
      onTierChange={onTierChange}
      missionCost={missionCost}
      onCostChange={onCostChange}
    />
    <MissionStatsGrid missionEv={missionEv} />
    <ValuableBeastsList beasts={missionEv.topValuedBeasts.slice(0, 4)} />
  </div>
);

interface TierCostControlProps {
  missionTier: MissionTier;
  onTierChange: (t: MissionTier) => void;
  missionCost: number;
  onCostChange: (c: number) => void;
}

const TierCostControl: React.FC<TierCostControlProps> = ({
  missionTier,
  onTierChange,
  missionCost,
  onCostChange,
}) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <span>地圖階級:</span>
    {(['white', 'yellow', 'red'] as MissionTier[]).map((t) => (
      <button
        key={t}
        onClick={() => onTierChange(t)}
        style={{
          padding: '3px 10px',
          borderRadius: '4px',
          border: 'none',
          background: missionTier === t ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {t.toUpperCase()}
      </button>
    ))}
    <span style={{ marginLeft: 'auto' }}>門票成本 (C):</span>
    <input
      type="number"
      value={missionCost}
      onChange={(e) => onCostChange(Number(e.target.value) || 0)}
      style={{
        width: '60px',
        padding: '3px',
        background: '#0d1117',
        border: '1px solid #30363d',
        color: '#fff',
        borderRadius: '4px',
      }}
    />
  </div>
);

const MissionStatsGrid: React.FC<{ missionEv: BestiaryMissionResult }> = ({ missionEv }) => (
  <div
    style={{
      padding: '8px',
      background: '#0d1117',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'space-around',
    }}
  >
    <div>預估紅野獸: <span style={{ color: '#f85149' }}>{missionEv.redBeastsExpected} 隻</span></div>
    <div>預估黃野獸: <span style={{ color: '#e3b341' }}>{missionEv.yellowBeastsExpected} 隻</span></div>
    <div>期望總產值: <span style={{ color: '#3fb950' }}>{missionEv.expectedGrossChaos} C</span></div>
    <div>
      淨利潤: <span style={{ color: missionEv.netProfitChaos >= 0 ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>
        {missionEv.netProfitChaos} C
      </span>
    </div>
  </div>
);

const ValuableBeastsList: React.FC<{
  beasts: BestiaryMissionResult['topValuedBeasts'];
}> = ({ beasts }) => (
  <div>
    <div style={{ color: '#8b949e', fontSize: '11px', marginBottom: '4px' }}>主要高價值紅獸捕獲機率:</div>
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {beasts.map((b) => (
        <span
          key={b.nameZh}
          style={{ background: '#21262d', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}
        >
          {b.nameZh}: {b.captureChancePercent}% ({b.valueChaos}C)
        </span>
      ))}
    </div>
  </div>
);
