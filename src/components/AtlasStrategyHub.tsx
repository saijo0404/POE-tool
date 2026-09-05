import React from 'react';
import { useAtlasStrategy } from '../hooks/useAtlasStrategy';
import { AtlasStrategySelector } from './atlas/AtlasStrategySelector';
import { AtlasTierSelector } from './atlas/AtlasTierSelector';
import { AtlasStrategyDetails } from './atlas/AtlasStrategyDetails';
import { AtlasScarabConfig } from './atlas/AtlasScarabConfig';
import { AtlasExtraItemsConfig } from './atlas/AtlasExtraItemsConfig';
import { AtlasCostSummaryCard } from './atlas/AtlasCostSummaryCard';
import { AtlasBatchPlanner } from './atlas/AtlasBatchPlanner';
import { AtlasBulkShoppingCard } from './atlas/AtlasBulkShoppingCard';
import { AtlasEditStrategyModal } from './atlas/AtlasEditStrategyModal';
import { AtlasCommunityHubModal } from './atlas/AtlasCommunityHubModal';
import { AtlasEmptyStateCard } from './atlas/AtlasEmptyStateCard';
import { AtlasHubHeader } from './atlas/AtlasHubHeader';
import { ScarabSynergyCard } from './atlas/ScarabSynergyCard';
import { recommendScarabCombination } from '../domain/atlas/scarabSynergyEngine';

interface AtlasStrategyHubProps {
  league: string;
  divineRate?: number;
  onShowToast: (msg: string) => void;
}

export const AtlasStrategyHub: React.FC<AtlasStrategyHubProps> = ({
  league,
  divineRate = 150,
  onShowToast
}) => {
  const {
    strategies,
    currentStrategy,
    currentTier,
    selectedStrategyId,
    setSelectedStrategyId,
    selectedTierId,
    setSelectedTierId,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    filteredStrategies,
    batchSize,
    setBatchSize,
    calculationSummary,
    ninjaRates,
    isRatesLoading,
    editingStrategy,
    setEditingStrategy,
    isEditModalOpen,
    setIsEditModalOpen,
    // Operations
    updateCurrentTier,
    updateAllocatedNodes,
    addScarab,
    removeScarab,
    updateScarab,
    addExtraItem,
    removeExtraItem,
    updateExtraItem,
    addTier,
    duplicateTier,
    deleteTier,
    renameTier,
    createNewStrategy,
    saveStrategyEdit,
    duplicateStrategy,
    deleteStrategy,
    deleteCategory,
    clearAllStrategies,
    copyShoppingList,
    copyTradeKeywords,
    copyPoeItemFormat,
    exportToJson,
    importFromJson
  } = useAtlasStrategy({
    league,
    divineRate,
    onShowToast
  });

  const [isCommunityModalOpen, setIsCommunityModalOpen] = React.useState(false);

  const scarabSynergyRec = React.useMemo(() => {
    if (!currentTier || !currentStrategy) return null;
    return recommendScarabCombination({
      allocatedNodeIds: currentTier.allocatedNodes,
      primaryCategory: currentStrategy.category,
      strategyTags: currentStrategy.tags,
      ninjaRates
    });
  }, [currentTier, currentStrategy, ninjaRates]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AtlasHubHeader
        league={league}
        divineRate={divineRate}
        isRatesLoading={isRatesLoading}
        onOpenCommunity={() => setIsCommunityModalOpen(true)}
      />

      {/* 1. Strategy Selector & Category Filter Carousel */}
      <AtlasStrategySelector
        strategies={filteredStrategies}
        selectedStrategyId={selectedStrategyId}
        onSelectStrategy={setSelectedStrategyId}
        filterCategory={filterCategory}
        onFilterCategory={setFilterCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewStrategy={createNewStrategy}
        onEditStrategy={(strat) => {
          setEditingStrategy(strat);
          setIsEditModalOpen(true);
        }}
        onDeleteStrategy={deleteStrategy}
        onDeleteCategory={deleteCategory}
        onClearAllStrategies={clearAllStrategies}
        onExportJson={exportToJson}
        onImportJson={importFromJson}
      />

      {/* Global Empty State Hero Card */}
      {strategies.length === 0 && (
        <AtlasEmptyStateCard
          onCreateStrategy={createNewStrategy}
          onOpenCommunityHub={() => setIsCommunityModalOpen(true)}
        />
      )}

      {/* 2. Multi-Tier Selector */}
      {currentStrategy && currentStrategy.tiers && currentStrategy.tiers.length > 0 && (
        <AtlasTierSelector
          tiers={currentStrategy.tiers}
          selectedTierId={selectedTierId || currentStrategy.tiers[0].id}
          onSelectTier={setSelectedTierId}
          onAddTier={addTier}
          onDuplicateTier={duplicateTier}
          onDeleteTier={deleteTier}
          onRenameTier={renameTier}
        />
      )}

      {/* 3. Strategy Header Details */}
      {currentStrategy && currentTier && (
        <AtlasStrategyDetails
          strategy={currentStrategy}
          currentTier={currentTier}
          onEditStrategy={() => {
            setEditingStrategy(currentStrategy);
            setIsEditModalOpen(true);
          }}
          onDuplicateStrategy={() => duplicateStrategy(currentStrategy.id)}
          onDeleteStrategy={() => deleteStrategy(currentStrategy.id)}
          onSaveAllocatedNodes={updateAllocatedNodes}
          onShowToast={onShowToast}
        />
      )}

      {/* 4. Main Configuration & Calculator Grid */}
      {currentTier && calculationSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', gap: '16px' }}>
          {/* Left Column: Scarabs & Extra Items Configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Scarab Synergy Recommender Card (Issue #122) */}
            {scarabSynergyRec && (
              <ScarabSynergyCard
                recommendation={scarabSynergyRec}
                onApplyToCurrentTier={newScarabs => updateCurrentTier(t => ({ ...t, scarabs: newScarabs }))}
                divineRate={divineRate}
              />
            )}

            {/* Scarabs Config */}
            <AtlasScarabConfig
              scarabs={currentTier.scarabs}
              onAddScarab={addScarab}
              onRemoveScarab={removeScarab}
              onUpdateScarab={updateScarab}
              ninjaRates={ninjaRates}
              divineRate={divineRate}
            />

            {/* Extra Items & Craft Config */}
            <AtlasExtraItemsConfig
              extraItems={currentTier.extraItems}
              onAddExtraItem={addExtraItem}
              onRemoveExtraItem={removeExtraItem}
              onUpdateExtraItem={updateExtraItem}
              ninjaRates={ninjaRates}
              divineRate={divineRate}
            />
          </div>

          {/* Right Column: Cost & Profit Hub + Batch Planner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Single Map Cost & Profit Estimator */}
            <AtlasCostSummaryCard
              summary={calculationSummary}
              divineRate={divineRate}
              onUpdateRevenue={val => updateCurrentTier(t => ({ ...t, estimatedRevenuePerMapChaos: val }))}
              onUpdateMapsPerHour={val => updateCurrentTier(t => ({ ...t, mapsPerHour: val }))}
            />

            {/* Bulk Materials Shopping & Faustus Gold Fee Card (Issue #108) */}
            <AtlasBulkShoppingCard
              tier={currentTier}
              strategyName={currentStrategy?.name}
              divineRate={divineRate}
              ninjaRates={ninjaRates}
              onShowToast={onShowToast}
            />

            {/* Batch Materials & Shopping List Planner */}
            <AtlasBatchPlanner
              summary={calculationSummary}
              batchSize={batchSize}
              onSelectBatchSize={setBatchSize}
              onCopyShoppingList={copyShoppingList}
              onCopyTradeKeywords={copyTradeKeywords}
              onCopyPoeItemFormat={copyPoeItemFormat}
              league={league}
              divineRate={divineRate}
            />
          </div>
        </div>
      )}

      {/* 5. Edit Strategy Modal */}
      {isEditModalOpen && (
        <AtlasEditStrategyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStrategy(null);
          }}
          strategy={editingStrategy}
          onSave={saveStrategyEdit}
          onDelete={deleteStrategy}
        />
      )}

      {/* 6. Community Hub Modal */}
      {isCommunityModalOpen && (
        <AtlasCommunityHubModal
          isOpen={isCommunityModalOpen}
          onClose={() => setIsCommunityModalOpen(false)}
          onImportStrategy={saveStrategyEdit}
          currentStrategy={currentStrategy}
        />
      )}
    </div>
  );
};

export default AtlasStrategyHub;
