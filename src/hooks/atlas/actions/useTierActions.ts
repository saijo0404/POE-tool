import { useCallback } from 'react';
import type { AtlasStrategy, AtlasStrategyTier } from '../../../domain/atlas/types';

interface UseTierActionsProps {
  strategies: AtlasStrategy[];
  currentStrategy: AtlasStrategy | null;
  updateStrategies: (strats: AtlasStrategy[]) => void;
  setSelectedTierId: (id: string) => void;
  deleteStrategy: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export function useTierActions({
  strategies,
  currentStrategy,
  updateStrategies,
  setSelectedTierId,
  deleteStrategy,
  onShowToast
}: UseTierActionsProps) {
  const addTier = useCallback((tierName: string) => {
    if (!currentStrategy) return;
    const newTierId = `tier_${Date.now()}`;
    const newTier: AtlasStrategyTier = {
      id: newTierId,
      name: tierName.trim() || `自訂分級 ${currentStrategy.tiers.length + 1}`,
      description: '自訂輿圖分級設定',
      recommendedMaps: ['T16 地圖'],
      coreKeystones: ['專注單一 (Singular Focus)'],
      scarabs: [],
      extraItems: [
        { id: `ex_${Date.now()}`, name: 'T16 地圖 (Tier 16 Map)', nameEn: 'Tier 16 Map', category: 'map', count: 1, unitPriceChaos: 4 }
      ],
      estimatedRevenuePerMapChaos: 80,
      mapsPerHour: 15
    };
    const updatedStrategy = { ...currentStrategy, tiers: [...currentStrategy.tiers, newTier], updatedAt: Date.now() };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
    setSelectedTierId(newTierId);
    onShowToast(`已建立新分級：【${newTier.name}】！`);
  }, [currentStrategy, strategies, updateStrategies, setSelectedTierId, onShowToast]);

  const duplicateTier = useCallback((tierId: string) => {
    if (!currentStrategy) return;
    const target = currentStrategy.tiers.find(t => t.id === tierId);
    if (!target) return;
    const newTierId = `tier_${Date.now()}`;
    const cloned: AtlasStrategyTier = { ...target, id: newTierId, name: `${target.name} (複製)` };
    const updatedStrategy = { ...currentStrategy, tiers: [...currentStrategy.tiers, cloned], updatedAt: Date.now() };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
    setSelectedTierId(newTierId);
    onShowToast(`已複製分級：【${cloned.name}】！`);
  }, [currentStrategy, strategies, updateStrategies, setSelectedTierId, onShowToast]);

  const deleteTier = useCallback((tierId: string) => {
    if (!currentStrategy) return;
    if (currentStrategy.tiers.length <= 1) {
      deleteStrategy(currentStrategy.id);
      return;
    }
    const updatedTiers = currentStrategy.tiers.filter(t => t.id !== tierId);
    const updatedStrategy = { ...currentStrategy, tiers: updatedTiers, updatedAt: Date.now() };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
    setSelectedTierId(updatedTiers[0].id);
    onShowToast('已刪除分級');
  }, [currentStrategy, strategies, updateStrategies, deleteStrategy, setSelectedTierId, onShowToast]);

  const renameTier = useCallback((tierId: string, newName: string) => {
    if (!currentStrategy || !newName.trim()) return;
    const updatedTiers = currentStrategy.tiers.map(t => (t.id === tierId ? { ...t, name: newName.trim() } : t));
    const updatedStrategy = { ...currentStrategy, tiers: updatedTiers, updatedAt: Date.now() };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
    onShowToast('已更新分級名稱');
  }, [currentStrategy, strategies, updateStrategies, onShowToast]);

  return { addTier, duplicateTier, deleteTier, renameTier };
}
