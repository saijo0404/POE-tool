import { useCallback } from 'react';
import type { AtlasStrategyTier, AtlasTierScarab } from '../../../domain/atlas/types';

interface UseScarabActionsProps {
  updateCurrentTier: (updater: (prev: AtlasStrategyTier) => AtlasStrategyTier) => void;
  onShowToast: (msg: string) => void;
}

export function useScarabActions({
  updateCurrentTier,
  onShowToast
}: UseScarabActionsProps) {
  const addScarab = useCallback((scarab: AtlasTierScarab) => {
    updateCurrentTier(tier => {
      const existing = tier.scarabs.find(s => s.name === scarab.name);
      if (existing) {
        return {
          ...tier,
          scarabs: tier.scarabs.map(s => s.name === scarab.name ? { ...s, count: Math.min(s.count + 1, 4) } : s)
        };
      }
      return { ...tier, scarabs: [...tier.scarabs, scarab] };
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

  return { addScarab, removeScarab, updateScarab };
}
