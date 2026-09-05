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

interface MappingTrackerProps {
  league: string;
  divineRate?: number;
  onShowToast: (msg: string) => void;
}

export const MappingTracker: React.FC<MappingTrackerProps> = ({
  league,
  divineRate = 150,
  onShowToast
}) => {
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState<boolean>(false);

  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    timerState,
    snapshotting,
    snapshotA,
    availableTabs,
    stats,
    handleStartMap,
    handlePauseMap,
    handleResumeMap,
    handleResetTimer,
    handleTakeSnapshotA,
    handleFinishAndSettle,
    handleDeleteRun,
    handleClearRuns,
    handleUpdateInvestment,
    handleUpdateSelectedTabs,
    handleCreateSession,
    handleExportDiscord,
    handleExportCsv
  } = useMappingTracker({ league, divineRate, onShowToast });

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Top Header & Session Management */}
      <MappingHeaderBar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onCreateSession={handleCreateSession}
        onExportDiscord={handleExportDiscord}
        onExportCsv={handleExportCsv}
        onClearRuns={handleClearRuns}
        onOpenInvestmentModal={() => setIsInvestmentModalOpen(true)}
      />

      {/* KPI Metrics Summary */}
      <MappingSummaryCard stats={stats} />

      {/* Historical Macro Analytics & Strategy Comparison */}
      <MappingHistoryAnalyticsCard
        sessions={sessions}
        divineRate={divineRate}
        currentLeague={league}
      />

      {/* Map Drop Performance Heatmap (Issue #128) */}
      <MapPerformanceHeatmap
        runs={sessions.flatMap(s => s.runs)}
        divineRate={divineRate}
      />

      {/* Device Craft Break-even Forecaster (Issue #123) */}
      <DeviceBreakEvenCard
        currentCraftCost={activeSession.defaultInvestment?.craftCostChaos}
        onApplyCraftCost={cost => {
          const prev = activeSession.defaultInvestment;
          const totalC = (prev?.mapCostChaos || 0) + (prev?.scarabsCostChaos || 0) + cost + (prev?.otherCostChaos || 0);
          handleUpdateInvestment({
            ...prev,
            craftCostChaos: cost,
            totalCostChaos: totalC,
            totalCostDivine: Math.round((totalC / divineRate) * 100) / 100
          });
          onShowToast(`已套用地圖儀工藝成本：${cost} C`);
        }}
      />

      {/* Ultimatum Trial EV & Risk Engine (Issue #129) */}
      <UltimatumEvCard divineRate={divineRate} onShowToast={onShowToast} />

      {/* Delirium Fog Layer EV & Splinter Forecaster (Issue #134) */}
      <DeliriumForecasterCard divineRate={divineRate} onShowToast={onShowToast} />

      {/* Timer & Live Settle Card */}
      <MappingTimerCard
        timerState={timerState}
        snapshotting={snapshotting}
        snapshotA={snapshotA}
        strategyName={activeSession.strategyName}
        onStartMap={handleStartMap}
        onPauseMap={handlePauseMap}
        onResumeMap={handleResumeMap}
        onResetTimer={handleResetTimer}
        onTakeSnapshotA={handleTakeSnapshotA}
        onFinishAndSettle={handleFinishAndSettle}
      />

      {/* Dump Tab Configuration */}
      <MappingTabSelector
        availableTabs={availableTabs}
        selectedTabs={activeSession.selectedTabNames}
        onUpdateSelectedTabs={handleUpdateSelectedTabs}
      />

      {/* Cumulative Profit Chart */}
      <MappingProfitChart runs={activeSession.runs} />

      {/* Completed Runs History & Drop Items */}
      <MappingRunsTable runs={activeSession.runs} onDeleteRun={handleDeleteRun} />

      {/* Investment Cost Configuration Modal */}
      <MappingInvestmentModal
        isOpen={isInvestmentModalOpen}
        investment={activeSession.defaultInvestment}
        divineRate={divineRate}
        onClose={() => setIsInvestmentModalOpen(false)}
        onSave={handleUpdateInvestment}
      />
    </div>
  );
};

export default MappingTracker;
