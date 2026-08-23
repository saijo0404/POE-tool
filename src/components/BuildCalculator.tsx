import React from 'react';
import { useBuildCalculator } from '../hooks/useBuildCalculator';
import { getItemKey } from '../domain/build/buildHelpers';
import { BuildInputBar } from './build/BuildInputBar';
import { BuildHeaderCard } from './build/BuildHeaderCard';
import { BuildCategoryTabs } from './build/BuildCategoryTabs';
import { BuildItemRow } from './build/BuildItemRow';

interface BuildCalculatorProps {
  league: string;
  onShowToast: (msg: string) => void;
}

export const BuildCalculator: React.FC<BuildCalculatorProps> = ({ league, onShowToast }) => {
  const {
    buildInput, setBuildInput,
    loading, error, costResult, history,
    activeCategory, setActiveCategory,
    sortBy, setSortBy, searchFilter, setSearchFilter,
    syncingKey, syncingAll, syncProgress, displayedItems,
    handleLoadBuild, handleDeleteHistory, handleClearHistory,
    handleSyncLivePrice, handleSyncAllLivePrices, handleOpenTrade, handleExportMarkdown
  } = useBuildCalculator({ league, onShowToast });

  const itemCounts = React.useMemo(() => {
    if (!costResult) return { all: 0, equipment: 0, gems: 0, flasks: 0, jewels: 0 };
    const cats = costResult.categories;
    return {
      all: cats.equipment.items.length + cats.gems.items.length + cats.flasks.items.length + cats.jewels.items.length,
      equipment: cats.equipment.items.length,
      gems: cats.gems.items.length,
      flasks: cats.flasks.items.length,
      jewels: cats.jewels.items.length,
    };
  }, [costResult]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <BuildInputBar
        buildInput={buildInput}
        setBuildInput={setBuildInput}
        loading={loading}
        onLoadBuild={() => handleLoadBuild()}
        history={history}
        onSelectHistory={url => { setBuildInput(url); handleLoadBuild(url); }}
        onDeleteHistory={handleDeleteHistory}
        onClearHistory={handleClearHistory}
      />

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.88rem', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {costResult && (
        <>
          <BuildHeaderCard
            costResult={costResult}
            onExportMarkdown={handleExportMarkdown}
            onSyncAll={handleSyncAllLivePrices}
            syncingAll={syncingAll}
            syncProgress={syncProgress}
          />

          <div className="poe-card">
            <BuildCategoryTabs
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              itemCounts={itemCounts}
            />

            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {displayedItems.length > 0 ? (
                displayedItems.map((item, idx) => {
                  const itemKey = getItemKey(item, idx);
                  return (
                    <BuildItemRow
                      key={itemKey}
                      item={item}
                      index={idx}
                      isSyncing={syncingKey === itemKey || syncingKey === getItemKey(item)}
                      onSyncLivePrice={handleSyncLivePrice}
                      onOpenTrade={handleOpenTrade}
                    />
                  );
                })
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                  沒有符合當前搜尋或分類的物品
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuildCalculator;
