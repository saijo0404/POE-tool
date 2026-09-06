import React from 'react';
import { Mountain, Target, CheckCircle, Sparkles, Star } from 'lucide-react';
import type {
  PoE2BiomeType,
  PoE2FarmingGoal,
  BiomeOptimizationRecommendation
} from '../../domain/waystone/towerBiomeTypes';
import { POE2_BIOMES, getTabletById } from '../../domain/waystone/precursorTowerCatalog';

interface BiomeOptimizerCardProps {
  selectedBiome: PoE2BiomeType;
  selectedGoal: PoE2FarmingGoal;
  recommendation: BiomeOptimizationRecommendation;
  onSelectBiome: (biome: PoE2BiomeType) => void;
  onSelectGoal: (goal: PoE2FarmingGoal) => void;
  onApplyTablets?: (tabletIds: string[]) => void;
}

const GOAL_OPTIONS: Array<{ id: PoE2FarmingGoal; label: string; icon: string }> = [
  { id: 'gold', label: '黃金收益', icon: '💰' },
  { id: 'currency', label: '高階通貨', icon: '🪙' },
  { id: 'waystones', label: '銘刻升階', icon: '🗺️' },
  { id: 'runes', label: '裝備符文', icon: '🪨' },
  { id: 'mechanics', label: '終局機制', icon: '🌀' },
  { id: 'boss', label: '首領雙倍', icon: '👑' }
];

export const BiomeOptimizerCard: React.FC<BiomeOptimizerCardProps> = ({
  selectedBiome,
  selectedGoal,
  recommendation,
  onSelectBiome,
  onSelectGoal,
  onApplyTablets
}) => {
  const biomesList = Object.values(POE2_BIOMES);

  return (
    <div className="poe-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mountain size={20} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ margin: 0, fontSize: '1.08rem', color: 'var(--text-gold)' }}>
            生物群落 (Biome) 策略優化器
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#98c379' }}>
          <Sparkles size={14} /> 契合評分：<strong>{recommendation.expectedSynergyScore} / 100</strong>
        </div>
      </div>

      {/* Biome Select Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>選擇當前地圖所屬生態群落 (Biome)：</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          {biomesList.map(b => {
            const isSelected = b.id === selectedBiome;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBiome(b.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'rgba(243, 209, 121, 0.15)' : '#161b26',
                  border: isSelected ? '1px solid var(--text-gold)' : '1px solid rgba(255,255,255,0.06)',
                  color: isSelected ? 'var(--text-gold)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div style={{ fontWeight: 600 }}>{b.nameZh.split(' ')[0]}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>T{b.recommendedTierRange[0]}~T{b.recommendedTierRange[1]}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#61afef', backgroundColor: 'rgba(97, 175, 239, 0.08)', padding: '6px 10px', borderRadius: '4px' }}>
          🌿 {recommendation.biome.inherentBonusDescZh}
        </div>
      </div>

      {/* Goal Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>選擇本次刷圖目標策略 (Goal)：</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {GOAL_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectGoal(opt.id)}
              className={selectedGoal === opt.id ? 'poe-button' : 'poe-button-secondary'}
              style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tactical Recommendation Box */}
      <div style={{ backgroundColor: '#11151f', borderRadius: '6px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '0.8rem', color: '#e5c07b', lineHeight: 1.5 }}>
          {recommendation.strategicAdviceZh}
        </div>

        {/* Recommended Tablets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={13} /> 推薦碑牌組合 (Recommended Tablets)：
            </span>
            {onApplyTablets && (
              <button
                type="button"
                className="poe-button-secondary"
                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                onClick={() => onApplyTablets(recommendation.recommendedTabletIds)}
              >
                一鍵配置至石塔
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {recommendation.recommendedTabletIds.map(tid => {
              const tab = getTabletById(tid);
              return (
                <div
                  key={tid}
                  style={{
                    backgroundColor: '#1a202c',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(243, 209, 121, 0.2)',
                    fontSize: '0.76rem',
                    color: '#fff'
                  }}
                >
                  <strong style={{ color: 'var(--text-gold)' }}>{tab?.nameZh || tid}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{tab?.nameEn}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Affixes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#98c379', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={13} /> 建議銘刻地圖詞綴偏好 (Affixes to Roll)：
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {recommendation.recommendedWaystoneAffixesZh.map(affix => (
              <span
                key={affix}
                style={{
                  backgroundColor: 'rgba(152, 195, 121, 0.1)',
                  color: '#98c379',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  border: '1px solid rgba(152, 195, 121, 0.2)'
                }}
              >
                {affix}
              </span>
            ))}
          </div>
        </div>

        {/* Star Ratings */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.76rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', flexWrap: 'wrap' }}>
          <RatingItem label="黃金產能" stars={recommendation.estimatedYieldSummary.goldRating} color="#f3d179" />
          <RatingItem label="通貨收益" stars={recommendation.estimatedYieldSummary.currencyRating} color="#61afef" />
          <RatingItem label="階級推展" stars={recommendation.estimatedYieldSummary.progressionRating} color="#c678dd" />
        </div>
      </div>
    </div>
  );
};

const RatingItem: React.FC<{ label: string; stars: number; color: string }> = ({ label, stars, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}：</span>
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          color={i <= stars ? color : '#3e4451'}
          fill={i <= stars ? color : 'none'}
        />
      ))}
    </div>
  </div>
);
