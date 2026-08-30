import { useState, useMemo, useEffect, useCallback } from 'react';
import type {
  AtlasStrategy,
  AtlasStrategyTier,
  AtlasMechanicCategory
} from '../../domain/atlas/types';
import {
  loadStrategiesFromStorage,
  saveStrategiesToStorage
} from '../../domain/atlas/atlasStorage';

export function useAtlasState() {
  const [strategies, setStrategies] = useState<AtlasStrategy[]>(() => loadStrategiesFromStorage());
  const [selectedStrategyId, setSelectedStrategyIdState] = useState<string>(() => {
    const list = loadStrategiesFromStorage();
    return list[0]?.id || '';
  });
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<AtlasMechanicCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [batchSize, setBatchSize] = useState<number>(20);
  const [editingStrategy, setEditingStrategy] = useState<AtlasStrategy | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Persist strategies on change
  const updateStrategies = useCallback((newStrategies: AtlasStrategy[]) => {
    setStrategies(newStrategies);
    saveStrategiesToStorage(newStrategies);
  }, []);

  // Fallback to 'all' if active filterCategory no longer exists in any strategy
  useEffect(() => {
    if (filterCategory !== 'all') {
      const exists = strategies.some(s => s.category === filterCategory);
      if (!exists) {
        setFilterCategory('all');
      }
    }
  }, [strategies, filterCategory]);

  // Current active strategy
  const currentStrategy = useMemo<AtlasStrategy | null>(() => {
    if (strategies.length === 0) return null;
    return strategies.find(s => s.id === selectedStrategyId) || strategies[0] || null;
  }, [strategies, selectedStrategyId]);

  // Current active tier
  const currentTier = useMemo<AtlasStrategyTier | null>(() => {
    if (!currentStrategy || !currentStrategy.tiers || currentStrategy.tiers.length === 0) {
      return null;
    }
    const found = currentStrategy.tiers.find(t => t.id === selectedTierId);
    return found || currentStrategy.tiers[0] || null;
  }, [currentStrategy, selectedTierId]);

  const setSelectedStrategyId = useCallback((id: string) => {
    setSelectedStrategyIdState(id);
    const target = strategies.find(s => s.id === id);
    if (target && target.tiers.length > 0) {
      setSelectedTierId(target.tiers[0].id);
    } else {
      setSelectedTierId('');
    }
  }, [strategies]);

  return {
    strategies,
    setStrategies,
    updateStrategies,
    selectedStrategyId,
    setSelectedStrategyId,
    selectedTierId,
    setSelectedTierId,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    batchSize,
    setBatchSize,
    editingStrategy,
    setEditingStrategy,
    isEditModalOpen,
    setIsEditModalOpen,
    currentStrategy,
    currentTier
  };
}
