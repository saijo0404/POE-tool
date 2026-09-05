import React, { useState, useMemo } from 'react';
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
import { ScarabStockAuditCard } from './scarab/ScarabStockAuditCard';
import { BlightOilCard } from './atlas/BlightOilCard';
import { recommendScarabCombination } from '../domain/atlas/scarabSynergyEngine';

interface AtlasStrategyHubProps {
  league: string;
  divineRate?: number;
  onShowToast: (msg: string) => void;
}

export const AtlasStrategyHub: React.FC<AtlasStrategyHubProps> = ({ league, divineRate = 150, onShowToast }) => {
  const ash = useAtlasStrategy({ league, divineRate, onShowToast });
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  const scarabSynergyRec = useMemo(() => {
    if (!ash.currentTier || !ash.currentStrategy) return null;
    return recommendScarabCombination({
      allocatedNodeIds: ash.currentTier.allocatedNodes, primaryCategory: ash.currentStrategy.category,
      strategyTags: ash.currentStrategy.tags, ninjaRates: ash.ninjaRates
    });
  }, [ash.currentTier, ash.currentStrategy, ash.ninjaRates]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AtlasHubHeader league={league} divineRate={divineRate} isRatesLoading={ash.isRatesLoading} onOpenCommunity={() => setIsCommunityModalOpen(true)} />
      <StrategySelectorSection ash={ash} />
      {ash.strategies.length === 0 && <AtlasEmptyStateCard onCreateStrategy={ash.createNewStrategy} onOpenCommunityHub={() => setIsCommunityModalOpen(true)} />}
      <TierAndDetailsSection ash={ash} onShowToast={onShowToast} />
      {ash.currentTier && ash.calculationSummary && (
        <MainGrid ash={ash} scarabSynergyRec={scarabSynergyRec} divineRate={divineRate} league={league} onShowToast={onShowToast} />
      )}
      <ModalsSection ash={ash} isCommunityOpen={isCommunityModalOpen} onCloseCommunity={() => setIsCommunityModalOpen(false)} />
    </div>
  );
};

const StrategySelectorSection: React.FC<{ ash: ReturnType<typeof useAtlasStrategy> }> = ({ ash }) => (
  <AtlasStrategySelector
    strategies={ash.filteredStrategies} selectedStrategyId={ash.selectedStrategyId} onSelectStrategy={ash.setSelectedStrategyId}
    filterCategory={ash.filterCategory} onFilterCategory={ash.setFilterCategory} searchQuery={ash.searchQuery} onSearchChange={ash.setSearchQuery}
    onNewStrategy={ash.createNewStrategy} onEditStrategy={(s) => { ash.setEditingStrategy(s); ash.setIsEditModalOpen(true); }}
    onDeleteStrategy={ash.deleteStrategy} onDeleteCategory={ash.deleteCategory} onClearAllStrategies={ash.clearAllStrategies}
    onExportJson={ash.exportToJson} onImportJson={ash.importFromJson}
  />
);

const TierAndDetailsSection: React.FC<{ ash: ReturnType<typeof useAtlasStrategy>; onShowToast: (msg: string) => void }> = ({ ash, onShowToast }) => (
  <>
    {ash.currentStrategy && ash.currentStrategy.tiers?.length > 0 && (
      <AtlasTierSelector
        tiers={ash.currentStrategy.tiers} selectedTierId={ash.selectedTierId || ash.currentStrategy.tiers[0].id}
        onSelectTier={ash.setSelectedTierId} onAddTier={ash.addTier} onDuplicateTier={ash.duplicateTier}
        onDeleteTier={ash.deleteTier} onRenameTier={ash.renameTier}
      />
    )}
    {ash.currentStrategy && ash.currentTier && (
      <AtlasStrategyDetails
        strategy={ash.currentStrategy} currentTier={ash.currentTier}
        onEditStrategy={() => { ash.setEditingStrategy(ash.currentStrategy); ash.setIsEditModalOpen(true); }}
        onDuplicateStrategy={() => ash.duplicateStrategy(ash.currentStrategy!.id)}
        onDeleteStrategy={() => ash.deleteStrategy(ash.currentStrategy!.id)}
        onSaveAllocatedNodes={ash.updateAllocatedNodes} onShowToast={onShowToast}
      />
    )}
  </>
);

const MainGrid: React.FC<{
  ash: ReturnType<typeof useAtlasStrategy>;
  scarabSynergyRec: ReturnType<typeof recommendScarabCombination> | null;
  divineRate: number;
  league: string;
  onShowToast: (msg: string) => void;
}> = ({ ash, scarabSynergyRec, divineRate, league, onShowToast }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', gap: '16px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {scarabSynergyRec && (
        <ScarabSynergyCard recommendation={scarabSynergyRec} onApplyToCurrentTier={s => ash.updateCurrentTier(t => ({ ...t, scarabs: s }))} divineRate={divineRate} />
      )}
      <ScarabStockAuditCard divineRate={divineRate} onShowToast={onShowToast} />
      <AtlasScarabConfig scarabs={ash.currentTier!.scarabs} onAddScarab={ash.addScarab} onRemoveScarab={ash.removeScarab} onUpdateScarab={ash.updateScarab} ninjaRates={ash.ninjaRates} divineRate={divineRate} />
      <AtlasExtraItemsConfig extraItems={ash.currentTier!.extraItems} onAddExtraItem={ash.addExtraItem} onRemoveExtraItem={ash.removeExtraItem} onUpdateExtraItem={ash.updateExtraItem} ninjaRates={ash.ninjaRates} divineRate={divineRate} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AtlasCostSummaryCard summary={ash.calculationSummary!} divineRate={divineRate} onUpdateRevenue={v => ash.updateCurrentTier(t => ({ ...t, estimatedRevenuePerMapChaos: v }))} onUpdateMapsPerHour={v => ash.updateCurrentTier(t => ({ ...t, mapsPerHour: v }))} />
      <BlightOilCard divineRate={divineRate} />
      <AtlasBulkShoppingCard tier={ash.currentTier!} strategyName={ash.currentStrategy?.name} divineRate={divineRate} ninjaRates={ash.ninjaRates} onShowToast={onShowToast} />
      <AtlasBatchPlanner summary={ash.calculationSummary!} batchSize={ash.batchSize} onSelectBatchSize={ash.setBatchSize} onCopyShoppingList={ash.copyShoppingList} onCopyTradeKeywords={ash.copyTradeKeywords} onCopyPoeItemFormat={ash.copyPoeItemFormat} league={league} divineRate={divineRate} />
    </div>
  </div>
);

const ModalsSection: React.FC<{
  ash: ReturnType<typeof useAtlasStrategy>;
  isCommunityOpen: boolean;
  onCloseCommunity: () => void;
}> = ({ ash, isCommunityOpen, onCloseCommunity }) => (
  <>
    {ash.isEditModalOpen && (
      <AtlasEditStrategyModal
        isOpen={ash.isEditModalOpen} onClose={() => { ash.setIsEditModalOpen(false); ash.setEditingStrategy(null); }}
        strategy={ash.editingStrategy} onSave={ash.saveStrategyEdit} onDelete={ash.deleteStrategy}
      />
    )}
    {isCommunityOpen && (
      <AtlasCommunityHubModal
        isOpen={isCommunityOpen} onClose={onCloseCommunity}
        onImportStrategy={ash.saveStrategyEdit} currentStrategy={ash.currentStrategy}
      />
    )}
  </>
);

export default AtlasStrategyHub;
