import { useCallback } from 'react';
import type {
  AtlasStrategy,
  AtlasStrategyTier,
  AtlasMechanicCategory,
  AtlasCalculationSummary
} from '../../domain/atlas/types';
import { useScarabActions } from './actions/useScarabActions';
import { useExtraItemActions } from './actions/useExtraItemActions';
import { useTierActions } from './actions/useTierActions';
import { useStrategyCrudActions } from './actions/useStrategyCrudActions';
import { useAtlasExportImport } from './actions/useAtlasExportImport';

interface UseAtlasStrategyActionsProps {
  strategies: AtlasStrategy[];
  currentStrategy: AtlasStrategy | null;
  currentTier: AtlasStrategyTier | null;
  calculationSummary: AtlasCalculationSummary | null;
  filterCategory: AtlasMechanicCategory;
  updateStrategies: (strats: AtlasStrategy[]) => void;
  setSelectedStrategyId: (id: string) => void;
  setSelectedTierId: (id: string) => void;
  setFilterCategory: (cat: AtlasMechanicCategory) => void;
  setEditingStrategy: (strat: AtlasStrategy | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  onShowToast: (msg: string) => void;
}

export function useAtlasStrategyActions(props: UseAtlasStrategyActionsProps) {
  const {
    strategies,
    currentStrategy,
    currentTier,
    calculationSummary,
    filterCategory,
    updateStrategies,
    setSelectedStrategyId,
    setSelectedTierId,
    setFilterCategory,
    setEditingStrategy,
    setIsEditModalOpen,
    onShowToast
  } = props;

  // Tier updater helper
  const updateCurrentTier = useCallback((updater: (prev: AtlasStrategyTier) => AtlasStrategyTier) => {
    if (!currentStrategy || !currentTier) return;
    const updatedTier = updater(currentTier);
    const updatedTiers = currentStrategy.tiers.map(t => (t.id === currentTier.id ? updatedTier : t));
    const updatedStrategy = { ...currentStrategy, tiers: updatedTiers, updatedAt: Date.now() };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
  }, [currentStrategy, currentTier, strategies, updateStrategies]);

  const updateAllocatedNodes = useCallback((nodes: string[]) => {
    updateCurrentTier(tier => ({ ...tier, allocatedNodes: nodes }));
  }, [updateCurrentTier]);

  const scarabActions = useScarabActions({ updateCurrentTier, onShowToast });
  const extraItemActions = useExtraItemActions({ updateCurrentTier, onShowToast });
  const strategyCrudActions = useStrategyCrudActions({
    strategies,
    filterCategory,
    updateStrategies,
    setSelectedStrategyId,
    setSelectedTierId,
    setFilterCategory,
    setEditingStrategy,
    setIsEditModalOpen,
    onShowToast
  });
  const tierActions = useTierActions({
    strategies,
    currentStrategy,
    updateStrategies,
    setSelectedTierId,
    deleteStrategy: strategyCrudActions.deleteStrategy,
    onShowToast
  });
  const exportImportActions = useAtlasExportImport({
    strategies,
    currentStrategy,
    currentTier,
    calculationSummary,
    updateStrategies,
    setSelectedStrategyId,
    setSelectedTierId,
    onShowToast
  });

  return {
    updateCurrentTier,
    updateAllocatedNodes,
    ...scarabActions,
    ...extraItemActions,
    ...tierActions,
    ...strategyCrudActions,
    ...exportImportActions
  };
}
