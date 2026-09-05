import React from 'react';
import { Swords, ShieldAlert, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import type { WeaponSet, BoundSkill } from '../../domain/dualSpec';
import { useWeaponSwap } from '../../hooks/useWeaponSwap';

export interface WeaponSwapIndicatorProps {
  initialSkills?: BoundSkill[];
  enableHotkey?: boolean;
  onSwapSet?: (newSet: WeaponSet) => void;
}

export const WeaponSwapIndicator: React.FC<WeaponSwapIndicatorProps> = ({
  initialSkills,
  enableHotkey = true,
  onSwapSet
}) => {
  const {
    loadout,
    activeSet,
    activeWeapon,
    activeOffHand,
    incompatibleSkills,
    deltaReport,
    isCompact,
    isDeltaExpanded,
    swapWeaponSet,
    toggleCompact,
    toggleDeltaExpanded
  } = useWeaponSwap({ initialSkills, enableHotkey });

  const handleSetClick = (target: WeaponSet) => {
    swapWeaponSet(target);
    onSwapSet?.(target);
  };

  const set1Name = loadout.set1.mainHand?.name || '空手 (Unarmed)';
  const set2Name = loadout.set2.mainHand?.name || '空手 (Unarmed)';

  return (
    <div
      data-testid="weapon-swap-indicator"
      style={{
        background: 'rgba(18, 22, 30, 0.95)',
        borderBottom: '1px solid rgba(200, 170, 110, 0.25)',
        padding: isCompact ? '6px 10px' : '10px 12px',
        fontSize: '0.8rem',
        color: '#e0e0e0',
        userSelect: 'none'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Swords size={16} color="#f59e0b" />
          <span style={{ fontWeight: 'bold', color: 'var(--text-gold, #f39c12)' }}>
            PoE 2 武器組
          </span>
          <span style={{ fontSize: '0.7rem', color: '#888', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '3px' }}>
            [X] 快捷鍵
          </span>
        </div>

        {/* Set 1 & Set 2 Toggle Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            data-testid="set1-button"
            onClick={() => handleSetClick('Set1')}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              border: activeSet === 'Set1' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
              background: activeSet === 'Set1' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0,0,0,0.3)',
              color: activeSet === 'Set1' ? '#fbbf24' : '#aaa',
              fontWeight: activeSet === 'Set1' ? 'bold' : 'normal'
            }}
          >
            組別 1: {set1Name}
          </button>

          <button
            type="button"
            data-testid="set2-button"
            onClick={() => handleSetClick('Set2')}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              border: activeSet === 'Set2' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.15)',
              background: activeSet === 'Set2' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0,0,0,0.3)',
              color: activeSet === 'Set2' ? '#fbbf24' : '#aaa',
              fontWeight: activeSet === 'Set2' ? 'bold' : 'normal'
            }}
          >
            組別 2: {set2Name}
          </button>

          <button
            type="button"
            data-testid="compact-toggle"
            onClick={toggleCompact}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            {isCompact ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Incompatible Skills Warning Banner */}
      {incompatibleSkills.length > 0 && (
        <div
          data-testid="incompatible-skills-alert"
          style={{
            marginTop: '8px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '4px',
            padding: '5px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#fca5a5',
            fontSize: '0.72rem'
          }}
        >
          <ShieldAlert size={14} color="#ef4444" />
          <span>
            ⚠️ 當前武器組無法施放: {incompatibleSkills.map(s => `${s.name} (${s.incompatibilityReason || '武器不符'})`).join(', ')}
          </span>
        </div>
      )}

      {/* Expanded Details Section */}
      {!isCompact && (
        <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
          {/* Active Hand Equipment Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#bbb' }}>
            <span>
              主手: <strong style={{ color: '#fff' }}>{activeWeapon?.name || '無'}</strong> ({activeWeapon?.weaponType || '空手'})
            </span>
            <span>
              副手: <strong style={{ color: '#fff' }}>{activeOffHand?.name || '無'}</strong> ({activeOffHand?.weaponType || '空'})
            </span>
          </div>

          {/* Quick Delta Badges Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {deltaReport.summary.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    background: item.includes('+') ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                    color: item.includes('+') ? '#86efac' : '#fca5a5'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            <button
              type="button"
              data-testid="delta-matrix-toggle"
              onClick={toggleDeltaExpanded}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f39c12',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              <BarChart2 size={12} />
              {isDeltaExpanded ? '收合矩陣' : '差額矩陣'}
            </button>
          </div>

          {/* Full Delta Matrix Table */}
          {isDeltaExpanded && (
            <div
              data-testid="delta-matrix-table"
              style={{
                marginTop: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '0.72rem'
              }}
            >
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ paddingBottom: '3px' }}>屬性項目</th>
                    <th style={{ paddingBottom: '3px' }}>組別 1</th>
                    <th style={{ paddingBottom: '3px' }}>組別 2</th>
                    <th style={{ paddingBottom: '3px' }}>差額 (Delta)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 0' }}>總 DPS</td>
                    <td>{deltaReport.set1Stats.totalDps}</td>
                    <td>{deltaReport.set2Stats.totalDps}</td>
                    <td style={{ color: deltaReport.deltas.totalDps.delta >= 0 ? '#86efac' : '#fca5a5' }}>
                      {deltaReport.deltas.totalDps.delta >= 0 ? '+' : ''}{deltaReport.deltas.totalDps.delta}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0' }}>每秒攻擊 (APS)</td>
                    <td>{deltaReport.set1Stats.attacksPerSecond}/s</td>
                    <td>{deltaReport.set2Stats.attacksPerSecond}/s</td>
                    <td style={{ color: deltaReport.deltas.attacksPerSecond.delta >= 0 ? '#86efac' : '#fca5a5' }}>
                      {deltaReport.deltas.attacksPerSecond.delta >= 0 ? '+' : ''}{deltaReport.deltas.attacksPerSecond.delta}/s
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0' }}>精魂需求/容量</td>
                    <td>{deltaReport.set1Stats.spirit}</td>
                    <td>{deltaReport.set2Stats.spirit}</td>
                    <td style={{ color: deltaReport.deltas.spirit.delta >= 0 ? '#86efac' : '#fca5a5' }}>
                      {deltaReport.deltas.spirit.delta >= 0 ? '+' : ''}{deltaReport.deltas.spirit.delta}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
