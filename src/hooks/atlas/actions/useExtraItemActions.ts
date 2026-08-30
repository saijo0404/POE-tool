import { useCallback } from 'react';
import type { AtlasStrategyTier, AtlasTierExtraItem } from '../../../domain/atlas/types';
import { addOrReplaceExtraItem, isCraftItem } from '../../../domain/atlas/atlasHelpers';

interface UseExtraItemActionsProps {
  updateCurrentTier: (updater: (prev: AtlasStrategyTier) => AtlasStrategyTier) => void;
  onShowToast: (msg: string) => void;
}

export function useExtraItemActions({
  updateCurrentTier,
  onShowToast
}: UseExtraItemActionsProps) {
  const addExtraItem = useCallback((item: AtlasTierExtraItem) => {
    let isReplaced = false;
    let replacedName: string | undefined;

    updateCurrentTier(tier => {
      const result = addOrReplaceExtraItem(tier.extraItems, item);
      isReplaced = result.isReplaced;
      replacedName = result.replacedCraftName;
      return { ...tier, extraItems: result.items };
    });

    if (isReplaced && replacedName) {
      onShowToast(`已將地圖工藝替換為【${item.name}】！`);
    } else if (item.category === 'craft') {
      onShowToast(`已選取地圖工藝【${item.name}】！`);
    } else {
      onShowToast(`已新增額外項目【${item.name}】！`);
    }
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
      extraItems: tier.extraItems.map(i => {
        if (i.id !== itemId) return i;
        const updated = { ...i, ...updates };
        if (isCraftItem(updated)) updated.count = 1;
        return updated;
      })
    }));
  }, [updateCurrentTier]);

  return { addExtraItem, removeExtraItem, updateExtraItem };
}
