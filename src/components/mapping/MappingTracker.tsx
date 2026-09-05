import React, { useState } from 'react';
import { useMappingTracker } from '../../hooks/useMappingTracker';
import { MappingHeaderBar } from './MappingHeaderBar';
import { MappingSummaryCard } from './MappingSummaryCard';
import { MappingTimerCard } from './MappingTimerCard';
import { MappingTabSelector } from './MappingTabSelector';
import { MappingProfitChart } from './MappingProfitChart';
import { MappingRunsTable } from './MappingRunsTable';
import { MappingInvestmentModal } from './MappingInvestmentModal';
import { MappingHistoryAnalyticsCard } from './MappingHistoryAnalyticsCard';
import { DeviceBreakEvenCard } from './DeviceBreakEvenCard';
import { MapPerformanceHeatmap } from './MapPerformanceHeatmap';
import { UltimatumEvCard } from '../ultimatum/UltimatumEvCard';
import { DeliriumForecasterCard } from '../delirium/DeliriumForecasterCard';
import { SanctumRelicCard } from '../sanctum/SanctumRelicCard';

interface MappingTrackerProps {
  league: string;
  divineRate?: number;
  onShowToast: (msg: string) => void;
}

export const MappingTracker: React.FC<MappingTrackerProps> = ({ league, divineRate = 150, onShowToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mt = useMappingTracker({ league, divineRate, onShowToast });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <MappingHeaderBar
        sessions={mt.sessions} activeSessionId={mt.activeSessionId} onSelectSession={mt.setActiveSessionId}
        onCreateSession={mt.handleCreateSession} onExportDiscord={mt.handleExportDiscord} onExportCsv={mt.handleExportCsv}
        onClearRuns={mt.handleClearRuns} onOpenInvestmentModal={() => setIsModalOpen(true)}
      />
      <AnalyticsSection mt={mt} league={league} divineRate={divineRate} />
      <EndgameMechanicsSection mt={mt} divineRate={divineRate} onShowToast={onShowToast} />
      <RunsTrackerSection mt={mt} />
      <MappingInvestmentModal
        isOpen={isModalOpen} investment={mt.activeSession.defaultInvestment} divineRate={divineRate}
        onClose={() => setIsModalOpen(false)} onSave={mt.handleUpdateInvestment}
      />
    </div>
  );
};

const AnalyticsSection: React.FC<{ mt: ReturnType<typeof useMappingTracker>; league: string; divineRate: number }> = ({ mt, league, divineRate }) => (
  <>
    <MappingSummaryCard stats={mt.stats} />
    <MappingHistoryAnalyticsCard sessions={mt.sessions} divineRate={divineRate} currentLeague={league} />
    <MapPerformanceHeatmap runs={mt.sessions.flatMap(s => s.runs)} divineRate={divineRate} />
  </>
);

const EndgameMechanicsSection: React.FC<{
  mt: ReturnType<typeof useMappingTracker>;
  divineRate: number;
  onShowToast: (msg: string) => void;
}> = ({ mt, divineRate, onShowToast }) => {
  const handleApplyCraft = (cost: number) => {
    const prev = mt.activeSession.defaultInvestment;
    const totalC = (prev?.mapCostChaos || 0) + (prev?.scarabsCostChaos || 0) + cost + (prev?.otherCostChaos || 0);
    mt.handleUpdateInvestment({
      ...prev, craftCostChaos: cost, totalCostChaos: totalC, totalCostDivine: Math.round((totalC / divineRate) * 100) / 100
    });
    onShowToast(`已套用地圖儀工藝成本：${cost} C`);
  };

  return (
    <>
      <DeviceBreakEvenCard currentCraftCost={mt.activeSession.defaultInvestment?.craftCostChaos} onApplyCraftCost={handleApplyCraft} />
      <UltimatumEvCard divineRate={divineRate} onShowToast={onShowToast} />
      <DeliriumForecasterCard divineRate={divineRate} onShowToast={onShowToast} />
      <SanctumRelicCard />
    </>
  );
};

const RunsTrackerSection: React.FC<{ mt: ReturnType<typeof useMappingTracker> }> = ({ mt }) => (
  <>
    <MappingTimerCard
      timerState={mt.timerState} snapshotting={mt.snapshotting} snapshotA={mt.snapshotA}
      strategyName={mt.activeSession.strategyName} onStartMap={mt.handleStartMap} onPauseMap={mt.handlePauseMap}
      onResumeMap={mt.handleResumeMap} onResetTimer={mt.handleResetTimer} onTakeSnapshotA={mt.handleTakeSnapshotA}
      onFinishAndSettle={mt.handleFinishAndSettle}
    />
    <MappingTabSelector availableTabs={mt.availableTabs} selectedTabs={mt.activeSession.selectedTabNames} onUpdateSelectedTabs={mt.handleUpdateSelectedTabs} />
    <MappingProfitChart runs={mt.activeSession.runs} />
    <MappingRunsTable runs={mt.activeSession.runs} onDeleteRun={mt.handleDeleteRun} />
  </>
);

export default MappingTracker;
