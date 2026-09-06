import React from 'react';
import { Shield, Heart, Zap, Sparkles } from 'lucide-react';
import type { PlayerDefensiveProfile } from '../../domain/waystone/types';

interface PlayerDefenseProfileCardProps {
  profile: PlayerDefensiveProfile;
  onChange: (patch: Partial<PlayerDefensiveProfile>) => void;
}

const PRESETS: Array<{ name: string; profile: Partial<PlayerDefensiveProfile> }> = [
  {
    name: '一般標準流派',
    profile: { fireRes: 75, coldRes: 75, lightningRes: 75, chaosRes: 20, lifePool: 4200, energyShield: 500, recoveryMechanism: 'leech' }
  },
  {
    name: '秒回坦克流派',
    profile: { fireRes: 80, coldRes: 80, lightningRes: 80, chaosRes: 60, lifePool: 6500, energyShield: 0, recoveryMechanism: 'regen' }
  },
  {
    name: '脆弱玻璃大砲',
    profile: { fireRes: 70, coldRes: 70, lightningRes: 70, chaosRes: -40, lifePool: 3200, energyShield: 200, recoveryMechanism: 'leech' }
  }
];

export const PlayerDefenseProfileCard: React.FC<PlayerDefenseProfileCardProps> = ({
  profile,
  onChange
}) => {
  return (
    <div className="poe-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} /> 機體防禦屬性與弱點配置 (Defense Profile)
        </h3>
        <div style={{ display: 'flex', gap: '6px' }}>
          {PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              className="poe-button-secondary"
              style={{ fontSize: '0.74rem', padding: '3px 8px' }}
              onClick={() => onChange(p.profile)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        設定您的主要抗性與回復機制，評估引擎將自動為您校準銘刻地圖詞綴的實際致死危險度。
      </div>

      {/* Resistances Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <ResInput label="火抗" value={profile.fireRes} color="#f87171" onChange={v => onChange({ fireRes: v })} />
        <ResInput label="冰抗" value={profile.coldRes} color="#60a5fa" onChange={v => onChange({ coldRes: v })} />
        <ResInput label="電抗" value={profile.lightningRes} color="#facc15" onChange={v => onChange({ lightningRes: v })} />
        <ResInput label="混抗" value={profile.chaosRes} color="#c084fc" onChange={v => onChange({ chaosRes: v })} />
      </div>

      {/* Pools & Recovery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            <Heart size={14} color="#f87171" /> 生命池 (Life)
          </label>
          <input
            type="number"
            className="poe-input"
            value={profile.lifePool}
            onChange={e => onChange({ lifePool: Number(e.target.value) || 0 })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            <Zap size={14} color="#38bdf8" /> 能量護盾 (ES)
          </label>
          <input
            type="number"
            className="poe-input"
            value={profile.energyShield}
            onChange={e => onChange({ energyShield: Number(e.target.value) || 0 })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
            <Sparkles size={14} color="#34d399" /> 主要續航機制
          </label>
          <select
            className="poe-select"
            value={profile.recoveryMechanism}
            onChange={e => onChange({ recoveryMechanism: e.target.value as PlayerDefensiveProfile['recoveryMechanism'] })}
            style={{ width: '100%' }}
          >
            <option value="leech">攻擊/法術偷取 (Leech)</option>
            <option value="regen">秒回/再生 (Regen)</option>
            <option value="recharge">能量護盾充能 (Recharge)</option>
            <option value="none">其他 / 藥劑續航</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const ResInput: React.FC<{ label: string; value: number; color: string; onChange: (v: number) => void }> = ({
  label,
  value,
  color,
  onChange
}) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ fontSize: '0.74rem', color, fontWeight: 600, marginBottom: '3px' }}>{label}</div>
    <input
      type="number"
      className="poe-input"
      value={value}
      onChange={e => onChange(Number(e.target.value) || 0)}
      style={{ width: '100%', padding: '4px 6px', fontSize: '0.85rem' }}
    />
  </div>
);
