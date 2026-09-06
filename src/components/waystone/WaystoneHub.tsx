import React, { useState, useMemo } from 'react';
import { ShieldAlert, Compass } from 'lucide-react';
import { PlayerDefenseProfileCard } from './PlayerDefenseProfileCard';
import { WaystoneRiskCard } from './WaystoneRiskCard';
import { WaystoneRollingCard } from './WaystoneRollingCard';
import { DEFAULT_PLAYER_PROFILE } from '../../domain/waystone/waystoneModsCatalog';
import { evaluateWaystone } from '../../domain/waystone/waystoneRiskEvaluator';
import { forecastWaystoneRolling } from '../../domain/waystone/waystoneRollingForecaster';
import type {
  PlayerDefensiveProfile,
  WaystoneRollingCriteria,
  WaystoneRollingStrategy
} from '../../domain/waystone/types';

interface WaystoneHubProps {
  onShowToast?: (msg: string) => void;
}

const SAMPLE_WAYSTONE = `Item Class: Waystones
Rarity: Rare
Bramble Waystone (Tier 15)
--------
Waystone Tier: 15
Item Quantity: +72%
Waystone Drop Chance: +50%
--------
Monsters penetrate 14% Elemental Resistances
Monsters deal 30% extra Physical Damage as Chaos
Players have 50% less Recovery Rate of Life and Energy Shield
Patches of Chilled Ground`;

export const WaystoneHub: React.FC<WaystoneHubProps> = ({ onShowToast }) => {
  const [rawText, setRawText] = useState<string>(SAMPLE_WAYSTONE);
  const [profile, setProfile] = useState<PlayerDefensiveProfile>(DEFAULT_PLAYER_PROFILE);
  const [strategy, setStrategy] = useState<WaystoneRollingStrategy>('alch_scour');
  const [criteria, setCriteria] = useState<WaystoneRollingCriteria>({
    maxAcceptableRisk: 'caution',
    minItemQuantity: 65,
    forbiddenModIds: ['ele_penetration', 'cannot_leech']
  });

  const evaluation = useMemo(() => {
    return evaluateWaystone(rawText, profile);
  }, [rawText, profile]);

  const forecast = useMemo(() => {
    return forecastWaystoneRolling(strategy, criteria);
  }, [strategy, criteria]);

  const handleLoadSample = () => {
    setRawText(SAMPLE_WAYSTONE);
    onShowToast?.('已載入範例 T15 稀有銘刻地圖');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'radial-gradient(ellipse at top left, rgba(200, 170, 110, 0.18) 0%, rgba(10, 13, 20, 0.85) 70%)',
        border: '1px solid rgba(200, 170, 110, 0.3)',
        borderRadius: '8px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(245, 158, 11, 0.4)'
          }}>
            <Compass size={24} color="#0d121c" />
          </div>
          <div>
            <h2 className="poe-font" style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-gold)', letterSpacing: '0.5px' }}>
              PoE 2 銘刻地圖 (Waystone) 詞綴評鑑與洗圖精算
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              機體弱點秒殺警示、安全評分檢驗與洗圖通貨期望成本精確預測
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Player Profile + Waystone Tester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PlayerDefenseProfileCard
            profile={profile}
            onChange={patch => setProfile(prev => ({ ...prev, ...patch }))}
          />
          <WaystoneRiskCard
            evaluation={evaluation}
            rawText={rawText}
            onRawTextChange={setRawText}
            onLoadSample={handleLoadSample}
          />
        </div>

        {/* Right Column: Rolling Simulator + Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <WaystoneRollingCard
            criteria={criteria}
            forecast={forecast}
            onCriteriaChange={patch => setCriteria(prev => ({ ...prev, ...patch }))}
            onStrategyChange={setStrategy}
          />
          <WaystoneGuideCard />
        </div>
      </div>
    </div>
  );
};

const WaystoneGuideCard: React.FC = () => (
  <div className="poe-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <ShieldAlert size={16} /> 💡 PoE 2 銘刻地圖機制小指南：
    </div>
    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
      <li><strong>掉落機率 (Drop Chance)</strong>：PoE 2 終局地圖掉落率主要依賴 Waystone Drop Chance 屬性，建議 T14+ 優先保留該詞綴。</li>
      <li><strong>致命詞綴 (Fatal Mods)</strong>：怪物元素穿透 (Penetration) 會直接扣減抗性上限，對於剛好 75% 抗性的機體相當於承受 200% 以上增幅傷害。</li>
      <li><strong>洗圖策略 (Rolling Strategy)</strong>：若預算有限，先以點金石開出高數量，若遇致命詞綴則以重鑄石清理；切勿盲目以混沌石硬洗。</li>
    </ul>
  </div>
);

export default WaystoneHub;
