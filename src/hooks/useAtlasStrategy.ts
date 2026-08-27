import { useState, useMemo, useEffect, useCallback } from 'react';
import type {
  AtlasStrategy,
  AtlasStrategyTier,
  AtlasTierScarab,
  AtlasTierExtraItem,
  AtlasMechanicCategory
} from '../domain/atlas/types';
import { ATLAS_PRESET_STRATEGIES } from '../domain/atlas/atlasPresets';
import {
  loadStrategiesFromStorage,
  saveStrategiesToStorage,
  computeAtlasSummary,
  generateShoppingListText
} from '../domain/atlas/atlasHelpers';
import { poeApi } from '../services/api';

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
  const [strategies, setStrategies] = useState<AtlasStrategy[]>(() => loadStrategiesFromStorage());
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(() => {
    const list = loadStrategiesFromStorage();
    return list[0]?.id || '';
  });
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<AtlasMechanicCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [batchSize, setBatchSize] = useState<number>(20);
  const [ninjaRates, setNinjaRates] = useState<Record<string, number>>({});
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(false);
  const [editingStrategy, setEditingStrategy] = useState<AtlasStrategy | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Fetch poe.ninja rates for scarabs and currency
  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      try {
        setIsRatesLoading(true);
        const res = await poeApi.getNinjaPrices(league);
        if (isMounted && res && res.rates) {
          setNinjaRates(res.rates);
        }
      } catch {
        // silent fallback to default db rates
      } finally {
        if (isMounted) setIsRatesLoading(false);
      }
    };
    fetchRates();
    return () => {
      isMounted = false;
    };
  }, [league]);

  // Persist strategies on change
  const updateStrategies = useCallback((newStrategies: AtlasStrategy[]) => {
    setStrategies(newStrategies);
    saveStrategiesToStorage(newStrategies);
  }, []);

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

  // Tier updates
  const updateCurrentTier = useCallback((updater: (prev: AtlasStrategyTier) => AtlasStrategyTier) => {
    if (!currentStrategy || !currentTier) return;
    const updatedTier = updater(currentTier);
    const updatedTiers = currentStrategy.tiers.map(t => (t.id === currentTier.id ? updatedTier : t));
    const updatedStrategy = { ...currentStrategy, tiers: updatedTiers, updatedAt: Date.now() };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
  }, [currentStrategy, currentTier, strategies, updateStrategies]);

  // Scarabs Management
  const addScarab = useCallback((scarab: AtlasTierScarab) => {
    updateCurrentTier(tier => {
      const existing = tier.scarabs.find(s => s.name === scarab.name);
      if (existing) {
        return {
          ...tier,
          scarabs: tier.scarabs.map(s => s.name === scarab.name ? { ...s, count: Math.min(s.count + 1, 4) } : s)
        };
      }
      return {
        ...tier,
        scarabs: [...tier.scarabs, scarab]
      };
    });
    onShowToast(`已將【${scarab.name}】加入聖甲蟲配置！`);
  }, [updateCurrentTier, onShowToast]);

  const removeScarab = useCallback((scarabId: string) => {
    updateCurrentTier(tier => ({
      ...tier,
      scarabs: tier.scarabs.filter(s => s.id !== scarabId)
    }));
    onShowToast('已移除聖甲蟲');
  }, [updateCurrentTier, onShowToast]);

  const updateScarab = useCallback((scarabId: string, updates: Partial<AtlasTierScarab>) => {
    updateCurrentTier(tier => ({
      ...tier,
      scarabs: tier.scarabs.map(s => (s.id === scarabId ? { ...s, ...updates } : s))
    }));
  }, [updateCurrentTier]);

  // Extra Items Management
  const addExtraItem = useCallback((item: AtlasTierExtraItem) => {
    updateCurrentTier(tier => ({
      ...tier,
      extraItems: [...tier.extraItems, item]
    }));
    onShowToast(`已新增額外項目【${item.name}】！`);
  }, [updateCurrentTier, onShowToast]);

  const removeExtraItem = useCallback((itemId: string) => {
    updateCurrentTier(tier => ({
      ...tier,
      extraItems: tier.extraItems.filter(i => i.id !== itemId)
    }));
    onShowToast('已移除額外項目');
  }, [updateCurrentTier, onShowToast]);

  const updateExtraItem = useCallback((itemId: string, updates: Partial<AtlasTierExtraItem>) => {
    updateCurrentTier(tier => ({
      ...tier,
      extraItems: tier.extraItems.map(i => (i.id === itemId ? { ...i, ...updates } : i))
    }));
  }, [updateCurrentTier]);

  // Strategy Management
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
          recommendedMaps: ['幽閉墓穴 (Dunes)'],
          coreKeystones: ['專注單一 (Singular Focus)'],
          scarabs: [],
          extraItems: [
            { id: `ex_${Date.now()}_1`, name: 'T16 幽閉墓穴 (Dunes)', category: 'map', count: 1, unitPriceChaos: 4 }
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
  }, [strategies, updateStrategies, onShowToast]);

  const saveStrategyEdit = useCallback((strategy: AtlasStrategy) => {
    const next = strategies.map(s => (s.id === strategy.id ? { ...strategy, updatedAt: Date.now() } : s));
    updateStrategies(next);
    setIsEditModalOpen(false);
    setEditingStrategy(null);
    onShowToast(`已儲存策略【${strategy.name}】！`);
  }, [strategies, updateStrategies, onShowToast]);

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
  }, [strategies, updateStrategies, onShowToast]);

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
  }, [strategies, updateStrategies, onShowToast]);

  const resetToDefaults = useCallback(() => {
    if (strategies.length === 0 || window.confirm('確定要載入系統預設策略嗎？自訂的策略將被覆蓋。')) {
      updateStrategies(ATLAS_PRESET_STRATEGIES);
      setSelectedStrategyId(ATLAS_PRESET_STRATEGIES[0].id);
      setSelectedTierId(ATLAS_PRESET_STRATEGIES[0].tiers[0].id);
      onShowToast('🔄 已成功載入官方預設 7 大輿圖天賦策略！');
    }
  }, [strategies.length, updateStrategies, onShowToast]);

  // Tier Management
  const addTier = useCallback((tierName: string) => {
    if (!currentStrategy) return;
    const newTierId = `tier_${Date.now()}`;
    const newTier: AtlasStrategyTier = {
      id: newTierId,
      name: tierName.trim() || `自訂分級 ${currentStrategy.tiers.length + 1}`,
      description: '自訂輿圖分級設定',
      recommendedMaps: ['幽閉墓穴 (Dunes)'],
      coreKeystones: ['專注單一 (Singular Focus)'],
      scarabs: [],
      extraItems: [
        { id: `ex_${Date.now()}`, name: 'T16 幽閉墓穴 (Dunes)', category: 'map', count: 1, unitPriceChaos: 4 }
      ],
      estimatedRevenuePerMapChaos: 80,
      mapsPerHour: 15
    };
    const updatedStrategy = {
      ...currentStrategy,
      tiers: [...currentStrategy.tiers, newTier],
      updatedAt: Date.now()
    };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
    setSelectedTierId(newTierId);
    onShowToast(`已建立新分級：【${newTier.name}】！`);
  }, [currentStrategy, strategies, updateStrategies, onShowToast]);

  const duplicateTier = useCallback((tierId: string) => {
    if (!currentStrategy) return;
    const target = currentStrategy.tiers.find(t => t.id === tierId);
    if (!target) return;
    const newTierId = `tier_${Date.now()}`;
    const cloned: AtlasStrategyTier = {
      ...target,
      id: newTierId,
      name: `${target.name} (複製)`
    };
    const updatedStrategy = {
      ...currentStrategy,
      tiers: [...currentStrategy.tiers, cloned],
      updatedAt: Date.now()
    };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
    setSelectedTierId(newTierId);
    onShowToast(`已複製分級：【${cloned.name}】！`);
  }, [currentStrategy, strategies, updateStrategies, onShowToast]);

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
  }, [currentStrategy, strategies, updateStrategies, deleteStrategy, onShowToast]);

  const renameTier = useCallback((tierId: string, newName: string) => {
    if (!currentStrategy || !newName.trim()) return;
    const updatedTiers = currentStrategy.tiers.map(t => (t.id === tierId ? { ...t, name: newName.trim() } : t));
    const updatedStrategy = { ...currentStrategy, tiers: updatedTiers, updatedAt: Date.now() };
    const nextStrategies = strategies.map(s => (s.id === currentStrategy.id ? updatedStrategy : s));
    updateStrategies(nextStrategies);
    onShowToast('已更新分級名稱');
  }, [currentStrategy, strategies, updateStrategies, onShowToast]);

  // Copy shopping list
  const copyShoppingList = useCallback(async () => {
    if (!currentStrategy || !currentTier || !calculationSummary) return;
    const text = generateShoppingListText(currentStrategy.name, currentTier.name, calculationSummary);
    try {
      await navigator.clipboard.writeText(text);
      onShowToast(`📋 已複製 ${calculationSummary.batchSize} 場地圖採購清單至剪貼簿！`);
    } catch {
      onShowToast('複製失敗，請手動選取');
    }
  }, [currentStrategy, currentTier, calculationSummary, onShowToast]);

  // Export JSON
  const exportToJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(strategies, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `poe_atlas_strategies_${Date.now()}.json`);
    dlAnchor.click();
    onShowToast('📥 策略 JSON 備份檔已開始下載！');
  }, [strategies, onShowToast]);

  // Import JSON
  const importFromJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].tiers) {
        updateStrategies(parsed);
        setSelectedStrategyId(parsed[0].id);
        setSelectedTierId(parsed[0].tiers[0]?.id || '');
        onShowToast(`🎉 成功匯入 ${parsed.length} 組輿圖策略！`);
        return true;
      }
      throw new Error('格式不正確');
    } catch {
      onShowToast('❌ 匯入失敗：無效的 JSON 策略資料格式');
      return false;
    }
  }, [updateStrategies, onShowToast]);

  const updateAllocatedNodes = useCallback((nodes: string[]) => {
    updateCurrentTier(tier => ({
      ...tier,
      allocatedNodes: nodes
    }));
  }, [updateCurrentTier]);

  return {
    strategies,
    currentStrategy,
    currentTier,
    selectedStrategyId,
    setSelectedStrategyId: (id: string) => {
      setSelectedStrategyId(id);
      const target = strategies.find(s => s.id === id);
      if (target && target.tiers.length > 0) {
        setSelectedTierId(target.tiers[0].id);
      } else {
        setSelectedTierId('');
      }
    },
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
    resetToDefaults,
    copyShoppingList,
    exportToJson,
    importFromJson
  };
}
