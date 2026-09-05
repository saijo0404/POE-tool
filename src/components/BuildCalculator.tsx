import React from 'react';
import { useBuildCalculator } from '../hooks/useBuildCalculator';
import { getItemKey } from '../domain/build/buildHelpers';
import { BuildInputBar } from './build/BuildInputBar';
import { BuildHeaderCard } from './build/BuildHeaderCard';
import { BuildCategoryTabs } from './build/BuildCategoryTabs';
import { BuildItemRow } from './build/BuildItemRow';
import { TimelessJewelCard } from './jewel/TimelessJewelCard';
import { WildwoodCharmsCard } from './wildwood/WildwoodCharmsCard';

interface BuildCalculatorProps {
  league: string;
  onShowToast: (msg: string) => void;
}

export const BuildCalculator: React.FC<BuildCalculatorProps> = ({ league, onShowToast }) => {
  const bc = useBuildCalculator({ league, onShowToast });
  const itemCounts = React.useMemo(() => {
    if (!bc.costResult) return { all: 0, equipment: 0, gems: 0, flasks: 0, jewels: 0 };
    const cats = bc.costResult.categories;
    return {
      all: cats.equipment.items.length + cats.gems.items.length + cats.flasks.items.length + cats.jewels.items.length,
      equipment: cats.equipment.items.length,
      gems: cats.gems.items.length,
      flasks: cats.flasks.items.length,
      jewels: cats.jewels.items.length,
    };
  }, [bc.costResult]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <BuildInputBar
        buildInput={bc.buildInput} setBuildInput={bc.setBuildInput} loading={bc.loading}
        onLoadBuild={() => bc.handleLoadBuild()} history={bc.history}
        onSelectHistory={url => { bc.setBuildInput(url); bc.handleLoadBuild(url); }}
        onDeleteHistory={bc.handleDeleteHistory} onClearHistory={bc.handleClearHistory}
      />
      {bc.error && <ErrorMessage error={bc.error} />}
      {bc.costResult && <CostResultView bc={bc} itemCounts={itemCounts} />}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <TimelessJewelCard onShowToast={onShowToast} />
        <WildwoodCharmsCard />
      </div>
    </div>
  );
};

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.88rem', marginBottom: '16px' }}>
    {error}
  </div>
);

const CostResultView: React.FC<{
  bc: ReturnType<typeof useBuildCalculator>;
  itemCounts: { all: number; equipment: number; gems: number; flasks: number; jewels: number };
}> = ({ bc, itemCounts }) => (
  <>
    {bc.costResult && (
      <BuildHeaderCard
        costResult={bc.costResult} onExportMarkdown={bc.handleExportMarkdown}
        onSyncAll={bc.handleSyncAllLivePrices} syncingAll={bc.syncingAll} syncProgress={bc.syncProgress}
      />
    )}
    <div className="poe-card">
      <BuildCategoryTabs
        activeCategory={bc.activeCategory} setActiveCategory={bc.setActiveCategory}
        searchFilter={bc.searchFilter} setSearchFilter={bc.setSearchFilter}
        sortBy={bc.sortBy} setSortBy={bc.setSortBy} itemCounts={itemCounts}
      />
      <BuildItemList bc={bc} />
    </div>
  </>
);

const BuildItemList: React.FC<{ bc: ReturnType<typeof useBuildCalculator> }> = ({ bc }) => (
  <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
    {bc.displayedItems.length > 0 ? (
      bc.displayedItems.map((item, idx) => {
        const itemKey = getItemKey(item, idx);
        return (
          <BuildItemRow
            key={itemKey} item={item} index={idx}
            isSyncing={bc.syncingKey === itemKey || bc.syncingKey === getItemKey(item)}
            onSyncLivePrice={bc.handleSyncLivePrice} onOpenTrade={bc.handleOpenTrade}
          />
        );
      })
    ) : (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
        沒有符合當前搜尋或分類的物品
      </div>
    )}
  </div>
);

export default BuildCalculator;
