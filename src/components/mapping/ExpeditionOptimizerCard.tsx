import React from 'react';
import { useExpeditionOptimizer } from '../../hooks/useExpeditionOptimizer';
import { TujenHaggleSection } from './expedition/TujenHaggleSection';
import { DannigExchangeSection } from './expedition/DannigExchangeSection';
import { LogbookEvSection } from './expedition/LogbookEvSection';

export const ExpeditionOptimizerCard: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    tujenAskingPrice,
    onTujenAskingPriceChange,
    tujenAdvice,
    sunArtifacts,
    onSunArtifactsChange,
    targetFaction,
    onTargetFactionChange,
    sunRate,
    onSunRateChange,
    targetRate,
    onTargetRateChange,
    dannigResult,
    logbookFaction,
    onLogbookFactionChange,
    areaLevel,
    onAreaLevelChange,
    logbookCost,
    onLogbookCostChange,
    selectedRemnants,
    onToggleRemnant,
    onClearRemnants,
    logbookEv,
  } = useExpeditionOptimizer();

  return (
    <div
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '16px',
        color: '#c9d1d9',
        fontSize: '13px',
      }}
    >
      <ExpeditionHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'tujen' && (
        <TujenHaggleSection
          askingPrice={tujenAskingPrice}
          onAskingPriceChange={onTujenAskingPriceChange}
          advice={tujenAdvice}
        />
      )}
      {activeTab === 'dannig' && (
        <DannigExchangeSection
          sunArtifacts={sunArtifacts}
          onSunArtifactsChange={onSunArtifactsChange}
          targetFaction={targetFaction}
          onTargetFactionChange={onTargetFactionChange}
          sunRate={sunRate}
          onSunRateChange={onSunRateChange}
          targetRate={targetRate}
          onTargetRateChange={onTargetRateChange}
          result={dannigResult}
        />
      )}
      {activeTab === 'logbook' && (
        <LogbookEvSection
          faction={logbookFaction}
          onFactionChange={onLogbookFactionChange}
          areaLevel={areaLevel}
          onAreaLevelChange={onAreaLevelChange}
          logbookCost={logbookCost}
          onLogbookCostChange={onLogbookCostChange}
          selectedRemnants={selectedRemnants}
          onToggleRemnant={onToggleRemnant}
          onClearRemnants={onClearRemnants}
          ev={logbookEv}
        />
      )}
    </div>
  );
};

interface ExpeditionHeaderProps {
  activeTab: 'tujen' | 'dannig' | 'logbook';
  onTabChange: (t: 'tujen' | 'dannig' | 'logbook') => void;
}

const ExpeditionHeader: React.FC<ExpeditionHeaderProps> = ({ activeTab, onTabChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
    <h3 style={{ margin: 0, color: '#f0883e', fontSize: '15px' }}>🧭 探險先祖出價最佳化與日誌收益精算器</h3>
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        onClick={() => onTabChange('tujen')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'tujen' ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        圖貞出價談判
      </button>
      <button
        onClick={() => onTabChange('dannig')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'dannig' ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        丹尼格文物換算
      </button>
      <button
        onClick={() => onTabChange('logbook')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'logbook' ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        探險日誌收益 EV
      </button>
    </div>
  </div>
);

export default ExpeditionOptimizerCard;
