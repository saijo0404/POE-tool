import { useAtlasState } from './atlas/useAtlasState';
import { useAtlasNinjaRates } from './atlas/useAtlasNinjaRates';
import { useAtlasCalculation } from './atlas/useAtlasCalculation';
import { useAtlasStrategyActions } from './atlas/useAtlasStrategyActions';

interface UseAtlasStrategyProps {
  league: string;
  divineRate: number;
  onShowToast: (msg: string) => void;
}

export function useAtlasStrategy({
  league,
  divineRate,
  onShowToast
}: UseAtlasStrategyProps) {
  // 1. State Management
  const state = useAtlasState();

  // 2. Ninja Rates Fetching
  const rates = useAtlasNinjaRates(league);

  // 3. Calculation Memoization
  const calc = useAtlasCalculation({
    strategies: state.strategies,
    currentTier: state.currentTier,
    filterCategory: state.filterCategory,
    searchQuery: state.searchQuery,
    ninjaRates: rates.ninjaRates,
    divineRate,
    batchSize: state.batchSize
  });

  // 4. Action Handlers
  const actions = useAtlasStrategyActions({
    strategies: state.strategies,
    currentStrategy: state.currentStrategy,
    currentTier: state.currentTier,
    calculationSummary: calc.calculationSummary,
    filterCategory: state.filterCategory,
    updateStrategies: state.updateStrategies,
    setSelectedStrategyId: state.setSelectedStrategyId,
    setSelectedTierId: state.setSelectedTierId,
    setFilterCategory: state.setFilterCategory,
    setEditingStrategy: state.setEditingStrategy,
    setIsEditModalOpen: state.setIsEditModalOpen,
    onShowToast
  });

  return {
    strategies: state.strategies,
    currentStrategy: state.currentStrategy,
    currentTier: state.currentTier,
    selectedStrategyId: state.selectedStrategyId,
    setSelectedStrategyId: state.setSelectedStrategyId,
    selectedTierId: state.selectedTierId,
    setSelectedTierId: state.setSelectedTierId,
    filterCategory: state.filterCategory,
    setFilterCategory: state.setFilterCategory,
    searchQuery: state.searchQuery,
    setSearchQuery: state.setSearchQuery,
    filteredStrategies: calc.filteredStrategies,
    batchSize: state.batchSize,
    setBatchSize: state.setBatchSize,
    calculationSummary: calc.calculationSummary,
    ninjaRates: rates.ninjaRates,
    isRatesLoading: rates.isRatesLoading,
    editingStrategy: state.editingStrategy,
    setEditingStrategy: state.setEditingStrategy,
    isEditModalOpen: state.isEditModalOpen,
    setIsEditModalOpen: state.setIsEditModalOpen,
    // Operations
    updateCurrentTier: actions.updateCurrentTier,
    updateAllocatedNodes: actions.updateAllocatedNodes,
    addScarab: actions.addScarab,
    removeScarab: actions.removeScarab,
    updateScarab: actions.updateScarab,
    addExtraItem: actions.addExtraItem,
    removeExtraItem: actions.removeExtraItem,
    updateExtraItem: actions.updateExtraItem,
    addTier: actions.addTier,
    duplicateTier: actions.duplicateTier,
    deleteTier: actions.deleteTier,
    renameTier: actions.renameTier,
    createNewStrategy: actions.createNewStrategy,
    saveStrategyEdit: actions.saveStrategyEdit,
    duplicateStrategy: actions.duplicateStrategy,
    deleteStrategy: actions.deleteStrategy,
    deleteCategory: actions.deleteCategory,
    clearAllStrategies: actions.clearAllStrategies,
    copyShoppingList: actions.copyShoppingList,
    copyTradeKeywords: actions.copyTradeKeywords,
    copyPoeItemFormat: actions.copyPoeItemFormat,
    exportToJson: actions.exportToJson,
    importFromJson: actions.importFromJson
  };
}
