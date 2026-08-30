import { useMemo } from 'react';
import type {
  AtlasStrategy,
  AtlasStrategyTier,
  AtlasMechanicCategory
} from '../../domain/atlas/types';
import { computeAtlasSummary } from '../../domain/atlas/atlasHelpers';

interface UseAtlasCalculationProps {
  strategies: AtlasStrategy[];
  currentTier: AtlasStrategyTier | null;
  filterCategory: AtlasMechanicCategory;
  searchQuery: string;
  ninjaRates: Record<string, number>;
  divineRate: number;
  batchSize: number;
}

export function useAtlasCalculation({
  strategies,
  currentTier,
  filterCategory,
  searchQuery,
  ninjaRates,
  divineRate,
  batchSize
}: UseAtlasCalculationProps) {
  // Filtered strategies list
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strat => {
      const matchCategory = filterCategory === 'all' || strat.category === filterCategory;
      if (!matchCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchName = strat.name.toLowerCase().includes(q);
      const matchDesc = strat.description.toLowerCase().includes(q);
      const matchTags = strat.tags.some(t => t.toLowerCase().includes(q));
      const matchTiers = strat.tiers.some(t =>
        t.name.toLowerCase().includes(q) ||
        t.recommendedMaps.some(m => m.toLowerCase().includes(q)) ||
        t.coreKeystones.some(k => k.toLowerCase().includes(q))
      );
      return matchName || matchDesc || matchTags || matchTiers;
    });
  }, [strategies, filterCategory, searchQuery]);

  // Summary calculation for current tier
  const calculationSummary = useMemo(() => {
    if (!currentTier) return null;
    return computeAtlasSummary(currentTier, ninjaRates, divineRate, batchSize);
  }, [currentTier, ninjaRates, divineRate, batchSize]);

  return {
    filteredStrategies,
    calculationSummary
  };
}
