import { useCallback } from 'react';
import type { AtlasStrategy, AtlasMechanicCategory } from '../../../domain/atlas/types';

interface UseStrategyCrudActionsProps {
  strategies: AtlasStrategy[];
  filterCategory: AtlasMechanicCategory;
  updateStrategies: (strats: AtlasStrategy[]) => void;
  setSelectedStrategyId: (id: string) => void;
  setSelectedTierId: (id: string) => void;
  setFilterCategory: (cat: AtlasMechanicCategory) => void;
  setEditingStrategy: (strat: AtlasStrategy | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  onShowToast: (msg: string) => void;
}

export function useStrategyCrudActions({
  strategies,
  filterCategory,
  updateStrategies,
  setSelectedStrategyId,
  setSelectedTierId,
  setFilterCategory,
  setEditingStrategy,
  setIsEditModalOpen,
  onShowToast
}: UseStrategyCrudActionsProps) {
  const createNewStrategy = useCallback(() => {
    const newId = `strat_custom_${Date.now()}`;
    const newStrategy: AtlasStrategy = {
      id: newId,
      name: '全新自訂輿圖策略',
      category: 'custom',
      description: '自訂輿圖刷圖天賦與聖甲蟲搭配方案',
      tags: ['自訂', '自製配置'],
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tiers: [
        {
          id: `tier_${Date.now()}_1`,
          name: '入門低配 (Budget)',
          description: '低成本起手配置',
          recommendedMaps: ['T16 地圖'],
          coreKeystones: ['專注單一 (Singular Focus)'],
          scarabs: [],
          extraItems: [
            { id: `ex_${Date.now()}_1`, name: 'T16 地圖 (Tier 16 Map)', nameEn: 'Tier 16 Map', category: 'map', count: 1, unitPriceChaos: 4 }
          ],
          estimatedRevenuePerMapChaos: 60,
          mapsPerHour: 15
        }
      ]
    };
    const nextStrategies = [newStrategy, ...strategies];
    updateStrategies(nextStrategies);
    setSelectedStrategyId(newId);
    setSelectedTierId(newStrategy.tiers[0].id);
    setEditingStrategy(newStrategy);
    setIsEditModalOpen(true);
    onShowToast('已建立新策略，可直接編輯策略詳細資訊！');
  }, [strategies, updateStrategies, setSelectedStrategyId, setSelectedTierId, setEditingStrategy, setIsEditModalOpen, onShowToast]);

  const saveStrategyEdit = useCallback((strategy: AtlasStrategy) => {
    const next = strategies.map(s => (s.id === strategy.id ? { ...strategy, updatedAt: Date.now() } : s));
    updateStrategies(next);
    setIsEditModalOpen(false);
    setEditingStrategy(null);
    onShowToast(`已儲存策略【${strategy.name}】！`);
  }, [strategies, updateStrategies, setIsEditModalOpen, setEditingStrategy, onShowToast]);

  const duplicateStrategy = useCallback((strategyId: string) => {
    const target = strategies.find(s => s.id === strategyId);
    if (!target) return;
    const newId = `strat_copy_${Date.now()}`;
    const cloned: AtlasStrategy = {
      ...target,
      id: newId,
      name: `${target.name} (複製)`,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const next = [cloned, ...strategies];
    updateStrategies(next);
    setSelectedStrategyId(newId);
    setSelectedTierId(cloned.tiers[0]?.id || '');
    onShowToast(`已複製策略【${cloned.name}】！`);
  }, [strategies, updateStrategies, setSelectedStrategyId, setSelectedTierId, onShowToast]);

  const deleteStrategy = useCallback((strategyId: string) => {
    const target = strategies.find(s => s.id === strategyId);
    const targetName = target ? `【${target.name}】` : '';
    const next = strategies.filter(s => s.id !== strategyId);
    updateStrategies(next);
    if (next.length > 0) {
      setSelectedStrategyId(next[0].id);
      setSelectedTierId(next[0].tiers[0]?.id || '');
    } else {
      setSelectedStrategyId('');
      setSelectedTierId('');
    }
    onShowToast(`已刪除策略${targetName}`);
  }, [strategies, updateStrategies, setSelectedStrategyId, setSelectedTierId, onShowToast]);

  const deleteCategory = useCallback((categoryId: AtlasMechanicCategory) => {
    if (categoryId === 'all') return;
    const targetStrats = strategies.filter(s => s.category === categoryId);
    if (targetStrats.length === 0) return;
    if (window.confirm(`確定要刪除「${categoryId}」分類下的所有 ${targetStrats.length} 個策略嗎？`)) {
      const next = strategies.filter(s => s.category !== categoryId);
      updateStrategies(next);
      if (filterCategory === categoryId) setFilterCategory('all');
      if (next.length > 0) {
        setSelectedStrategyId(next[0].id);
        setSelectedTierId(next[0].tiers[0]?.id || '');
      } else {
        setSelectedStrategyId('');
        setSelectedTierId('');
      }
      onShowToast(`🗑️ 已刪除【${categoryId}】分類下的全部策略`);
    }
  }, [strategies, filterCategory, updateStrategies, setFilterCategory, setSelectedStrategyId, setSelectedTierId, onShowToast]);

  const clearAllStrategies = useCallback(() => {
    if (window.confirm('確定要清空所有策略嗎？')) {
      updateStrategies([]);
      setSelectedStrategyId('');
      setSelectedTierId('');
      onShowToast('🗑️ 已清空所有輿圖策略');
    }
  }, [updateStrategies, setSelectedStrategyId, setSelectedTierId, onShowToast]);

  return {
    createNewStrategy,
    saveStrategyEdit,
    duplicateStrategy,
    deleteStrategy,
    deleteCategory,
    clearAllStrategies
  };
}
