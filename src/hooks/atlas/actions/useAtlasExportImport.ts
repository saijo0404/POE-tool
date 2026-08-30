import { useCallback } from 'react';
import type {
  AtlasStrategy,
  AtlasStrategyTier,
  AtlasCalculationSummary
} from '../../../domain/atlas/types';
import {
  generateShoppingListText,
  generateTradeKeywordsText,
  generatePoeItemFormatListText,
  sanitizeExtraItems
} from '../../../domain/atlas/atlasHelpers';

interface UseAtlasExportImportProps {
  strategies: AtlasStrategy[];
  currentStrategy: AtlasStrategy | null;
  currentTier: AtlasStrategyTier | null;
  calculationSummary: AtlasCalculationSummary | null;
  updateStrategies: (strats: AtlasStrategy[]) => void;
  setSelectedStrategyId: (id: string) => void;
  setSelectedTierId: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export function useAtlasExportImport({
  strategies,
  currentStrategy,
  currentTier,
  calculationSummary,
  updateStrategies,
  setSelectedStrategyId,
  setSelectedTierId,
  onShowToast
}: UseAtlasExportImportProps) {
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

  const copyTradeKeywords = useCallback(async () => {
    if (!calculationSummary) return;
    const text = generateTradeKeywordsText(calculationSummary);
    try {
      await navigator.clipboard.writeText(text);
      onShowToast(`🔍 已複製 ${calculationSummary.batchSize} 場地圖市集搜尋關鍵字！`);
    } catch {
      onShowToast('複製失敗，請手動選取');
    }
  }, [calculationSummary, onShowToast]);

  const copyPoeItemFormat = useCallback(async () => {
    if (!calculationSummary) return;
    const text = generatePoeItemFormatListText(calculationSummary, 'zh');
    try {
      await navigator.clipboard.writeText(text);
      onShowToast(`📋 已複製 ${calculationSummary.batchSize} 場地圖裝備查詢格式至剪貼簿！`);
    } catch {
      onShowToast('複製失敗，請手動選取');
    }
  }, [calculationSummary, onShowToast]);

  const exportToJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(strategies, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `poe_atlas_strategies_${Date.now()}.json`);
    dlAnchor.click();
    onShowToast('📥 策略 JSON 備份檔已開始下載！');
  }, [strategies, onShowToast]);

  const importFromJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].tiers) {
        const sanitized = parsed.map((strat: AtlasStrategy) => ({
          ...strat,
          tiers: (strat.tiers || []).map(tier => ({
            ...tier,
            extraItems: sanitizeExtraItems(tier.extraItems)
          }))
        }));
        updateStrategies(sanitized);
        setSelectedStrategyId(sanitized[0].id);
        setSelectedTierId(sanitized[0].tiers[0]?.id || '');
        onShowToast(`🎉 成功匯入 ${sanitized.length} 組輿圖策略！`);
        return true;
      }
      throw new Error('格式不正確');
    } catch {
      onShowToast('❌ 匯入失敗：無效的 JSON 策略資料格式');
      return false;
    }
  }, [updateStrategies, setSelectedStrategyId, setSelectedTierId, onShowToast]);

  return {
    copyShoppingList,
    copyTradeKeywords,
    copyPoeItemFormat,
    exportToJson,
    importFromJson
  };
}
