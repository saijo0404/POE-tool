import React from 'react';
import { useAtlasStrategy } from '../hooks/useAtlasStrategy';
import { AtlasStrategySelector } from './atlas/AtlasStrategySelector';
import { AtlasTierSelector } from './atlas/AtlasTierSelector';
import { AtlasStrategyDetails } from './atlas/AtlasStrategyDetails';
import { AtlasScarabConfig } from './atlas/AtlasScarabConfig';
import { AtlasExtraItemsConfig } from './atlas/AtlasExtraItemsConfig';
import { AtlasCostSummaryCard } from './atlas/AtlasCostSummaryCard';
import { AtlasBatchPlanner } from './atlas/AtlasBatchPlanner';
import { AtlasEditStrategyModal } from './atlas/AtlasEditStrategyModal';
import { AtlasCommunityHubModal } from './atlas/AtlasCommunityHubModal';
import { AtlasEmptyStateCard } from './atlas/AtlasEmptyStateCard';
import { Compass, RefreshCw, Share2 } from 'lucide-react';

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

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #f3d179 0%, #8c7849 70%, #2a2216 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(243, 209, 121, 0.35)'
            }}>
              <Compass size={22} color="#0d121c" />
            </div>
            <h1 className="poe-font" style={{ fontSize: '1.45rem', color: 'var(--text-gold)', margin: 0, letterSpacing: '0.5px' }}>
              POE 1 輿圖天賦策略與成本精算 (Atlas Strategy Hub)
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            自訂輿圖天賦策略分級（入門/進階/頂配）、聖甲蟲與自訂額外工藝配置、poe.ninja 即時物價連動、單場與批次利潤時薪精算
          </p>
        </div>

        {/* Actions & Live Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="poe-button-secondary"
            onClick={() => setIsCommunityModalOpen(true)}
            style={{
              height: '34px',
              padding: '0 14px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(243, 209, 121, 0.4)'
            }}
          >
            <Share2 size={15} color="var(--text-gold)" /> 社群策略中心
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(200, 170, 110, 0.25)',
            fontSize: '0.82rem'
          }}>
            <span style={{ color: 'var(--text-dim)' }}>當前聯盟：</span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>{league || 'Settlers'}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ color: 'var(--text-dim)' }}>神聖石匯率：</span>
            <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>1 Div = {divineRate} C</span>
            {isRatesLoading && <RefreshCw size={13} className="spin" color="var(--text-gold)" style={{ marginLeft: '4px' }} />}
          </div>
        </div>
      </div>

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
