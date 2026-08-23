import React from 'react';
import { useWealthTracker } from '../hooks/useWealthTracker';
import { WealthHeaderCard } from './wealth/WealthHeaderCard';
import { WealthChart } from './WealthChart';
import { TabBreakdown } from './TabBreakdown';

interface WealthTrackerProps {
  league: string;
  onShowToast: (msg: string) => void;
}

export const WealthTracker: React.FC<WealthTrackerProps> = ({ league, onShowToast }) => {
  const {
    snapshots,
    snapshotting,
    progress,
    filterState,
    latestSnapshot,
    filteredData,
    displayTotalChaos,
    displayTotalDivine,
    handleCreateSnapshot,
    handleClearHistory,
    handleToggleIgnoreTab,
    handleChangeMinValueChaos,
    handleChangeCategory,
    handleResetFilters,
    handleExportCSV,
    handleCopyDiscordSummary
  } = useWealthTracker({ league, onShowToast });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <WealthHeaderCard
        latestSnapshot={latestSnapshot}
        displayTotalChaos={displayTotalChaos}
        displayTotalDivine={displayTotalDivine}
        snapshotting={snapshotting}
        progress={progress}
        snapshotsCount={snapshots.length}
        onCreateSnapshot={handleCreateSnapshot}
        onClearHistory={handleClearHistory}
        onExportCSV={handleExportCSV}
        onCopyDiscordSummary={handleCopyDiscordSummary}
      />

      <WealthChart snapshots={snapshots} />

      <TabBreakdown
        tabSummaries={filteredData.tabSummaries}
        topItems={filteredData.topItems}
        divineRate={latestSnapshot?.chaosRate || 150}
        totalChaos={displayTotalChaos}
        totalDivine={displayTotalDivine}
        allItems={filteredData.allItems}
        ignoredTabs={filterState.ignoredTabNames || []}
        onToggleIgnoreTab={handleToggleIgnoreTab}
        minValueChaos={filterState.minValueChaos || 0}
        onChangeMinValueChaos={handleChangeMinValueChaos}
        selectedCategory={filterState.selectedCategory || 'ALL'}
        onChangeCategory={handleChangeCategory}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default WealthTracker;
