import React from 'react';
import { Radio, Zap, Sparkles, Coins, Package, Compass } from 'lucide-react';
import type { TowerSlotConfig, TowerSynergyResult } from '../../domain/waystone/towerBiomeTypes';
import { PRECURSOR_TABLETS } from '../../domain/waystone/precursorTowerCatalog';

interface PrecursorTowerCardProps {
  towers: TowerSlotConfig[];
  synergy: TowerSynergyResult;
  onToggleTower: (towerId: string) => void;
  onUpdateTablet: (towerId: string, tabletId: string) => void;
}

export const PrecursorTowerCard: React.FC<PrecursorTowerCardProps> = ({
  towers,
  synergy,
  onToggleTower,
  onUpdateTablet
}) => {
  return (
    <div className="poe-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={20} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ margin: 0, fontSize: '1.08rem', color: 'var(--text-gold)' }}>
            先祖石塔連線與碑牌插槽 (Precursor Towers)
          </h3>
        </div>
        <span
          className="badge"
          style={{
            backgroundColor: synergy.activeTowerCount >= 3 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(97, 175, 239, 0.15)',
            color: synergy.activeTowerCount >= 3 ? '#f59e0b' : '#61afef',
            padding: '4px 10px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Zap size={14} />
          {synergy.activeTowerCount} 座石塔覆蓋 ({Math.round((synergy.resonanceMultiplier - 1) * 100)}% 共振加乘)
        </span>
      </div>

      {/* Tower Slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {towers.map(tower => (
          <div
            key={tower.id}
            style={{
              padding: '12px 14px',
              backgroundColor: tower.active ? '#161b26' : '#0e121a',
              borderRadius: '6px',
              border: tower.active ? '1px solid rgba(243, 209, 121, 0.25)' : '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600, color: tower.active ? '#fff' : 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={tower.active}
                  onChange={() => onToggleTower(tower.id)}
                  style={{ cursor: 'pointer' }}
                />
                {tower.name}
              </label>
              <span style={{ fontSize: '0.75rem', color: tower.active ? '#98c379' : 'var(--text-muted)' }}>
                {tower.active ? '🟢 輻射連線中' : '⚪ 未啟用'}
              </span>
            </div>

            {tower.active && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>碑牌插槽：</span>
                <select
                  value={tower.socketedTabletIds[0] || ''}
                  onChange={e => onUpdateTablet(tower.id, e.target.value)}
                  className="poe-select"
                  style={{ width: '100%', fontSize: '0.8rem', padding: '4px 8px' }}
                >
                  <option value="">(空插槽 - 點擊選擇先祖碑牌)</option>
                  {PRECURSOR_TABLETS.map(tab => (
                    <option key={tab.id} value={tab.id}>
                      {tab.nameZh} ({tab.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Synergy Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        <MetricBox label="金幣倍率" value={`${synergy.totalGoldMultiplier}x`} icon={<Coins size={14} color="#f3d179" />} color="#f3d179" />
        <MetricBox label="群落大小" value={`+${synergy.totalPackSizeBonus}%`} icon={<Zap size={14} color="#61afef" />} color="#61afef" />
        <MetricBox label="掉落數量" value={`+${synergy.totalQuantityBonus}%`} icon={<Package size={14} color="#98c379" />} color="#98c379" />
        <MetricBox label="銘刻地圖" value={`+${synergy.totalWaystoneChanceBonus}%`} icon={<Compass size={14} color="#c678dd" />} color="#c678dd" />
        <MetricBox label="符文掉落" value={`+${synergy.totalRuneChanceBonus}%`} icon={<Sparkles size={14} color="#56b6c2" />} color="#56b6c2" />
        <MetricBox label="首領獎勵" value={`${synergy.totalBossLootMultiplier}x`} icon={<Zap size={14} color="#e5c07b" />} color="#e5c07b" />
      </div>

      {synergy.activeMechanics.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>啟動遭遇：</span>
          {synergy.activeMechanics.map(m => (
            <span
              key={m.mechanicType}
              className="badge"
              style={{ backgroundColor: 'rgba(198, 120, 221, 0.15)', color: '#c678dd', padding: '2px 8px', borderRadius: '4px' }}
            >
              {m.mechanicType} ({m.totalChance}% 機率)
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const MetricBox: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color
}) => (
  <div style={{ backgroundColor: '#11151f', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
      {icon} <span>{label}</span>
    </div>
    <div style={{ fontSize: '0.98rem', fontWeight: 'bold', color }}>{value}</div>
  </div>
);
