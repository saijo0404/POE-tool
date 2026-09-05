import React from 'react';
import { useExpeditionOptimizer } from '../../hooks/useExpeditionOptimizer';
import { TujenHaggleSection } from './expedition/TujenHaggleSection';
import { DannigExchangeSection } from './expedition/DannigExchangeSection';
import { LogbookEvSection } from './expedition/LogbookEvSection';
import { Card, Button } from '../ui';

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
    <Card
      variant="bordered"
      style={{
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
    </Card>
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
      <Button
        size="sm"
        variant={activeTab === 'tujen' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('tujen')}
      >
        圖貞出價談判
      </Button>
      <Button
        size="sm"
        variant={activeTab === 'dannig' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('dannig')}
      >
        丹尼格文物換算
      </Button>
      <Button
        size="sm"
        variant={activeTab === 'logbook' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('logbook')}
      >
        探險日誌收益 EV
      </Button>
    </div>
  </div>
);

export default ExpeditionOptimizerCard;
