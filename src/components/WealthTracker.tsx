import React, { useState } from 'react';
import { useWealthTracker } from '../hooks/useWealthTracker';
import { WealthHeaderCard } from './wealth/WealthHeaderCard';
import { WealthChart } from './WealthChart';
import { TabBreakdown } from './TabBreakdown';
import { PortfolioAnalysisHub } from './portfolio/PortfolioAnalysisHub';
import { PieChart, TrendingUp } from 'lucide-react';

interface WealthTrackerProps {
  league: string;
  onShowToast: (msg: string) => void;
}

export const WealthTracker: React.FC<WealthTrackerProps> = ({ league, onShowToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'hourly' | 'portfolio'>('hourly');
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
    handleChangeBulkMultiplier,
    handleResetFilters,
    handleExportCSV,
    handleCopyDiscordSummary
  } = useWealthTracker({ league, onShowToast });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('hourly')}
          className={activeSubTab === 'hourly' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '6px 14px' }}
        >
          <TrendingUp size={15} /> 每小時資產與倉庫分頁
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('portfolio')}
          className={activeSubTab === 'portfolio' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', padding: '6px 14px' }}
        >
          <PieChart size={15} /> 資產組合結構與賽季淨值成長
        </button>
      </div>

      {activeSubTab === 'portfolio' ? (
        <PortfolioAnalysisHub
          snapshots={snapshots}
          latestSnapshot={latestSnapshot}
          divineRate={latestSnapshot?.chaosRate || 150}
          league={league}
          onShowToast={onShowToast}
        />
      ) : (
        <>
          <WealthHeaderCard
        latestSnapshot={latestSnapshot}
        displayTotalChaos={displayTotalChaos}
        displayTotalDivine={displayTotalDivine}
        snapshotting={snapshotting}
        progress={progress}
        snapshotsCount={snapshots.length}
        bulkMultiplier={filterState.bulkMultiplier || 1.0}
        onChangeBulkMultiplier={handleChangeBulkMultiplier}
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
        bulkMultiplier={filterState.bulkMultiplier || 1.0}
        onChangeBulkMultiplier={handleChangeBulkMultiplier}
        onResetFilters={handleResetFilters}
      />
        </>
      )}
    </div>
  );
};

export default WealthTracker;
