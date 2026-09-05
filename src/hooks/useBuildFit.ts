import { useState, useMemo, useCallback } from 'react';
import type { ParsedItem } from '../types/poe';
import { evaluateItemFit } from '../domain/buildFit/affixWeightEngine';
import {
  getAllAvailablePresets,
  getStoredSelectedPresetId,
  setStoredSelectedPresetId
} from '../domain/buildFit/buildFitStorage';
import type { BuildFitEvaluation, BuildPreset } from '../domain/buildFit/types';

export function useBuildFit(parsedItem: ParsedItem | null) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(getStoredSelectedPresetId);
  const presets = useMemo(() => getAllAvailablePresets(), []);

  const activePreset = useMemo<BuildPreset>(() => {
    return presets.find(p => p.id === selectedPresetId) || presets[0];
  }, [presets, selectedPresetId]);

  const handleSelectPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId);
    setStoredSelectedPresetId(presetId);
  }, []);

  const evaluation = useMemo<BuildFitEvaluation | null>(() => {
    if (!parsedItem || !activePreset) return null;
    const res = evaluateItemFit(parsedItem, activePreset);
    return res.isOk() ? res.value : null;
  }, [parsedItem, activePreset]);

  return {
    presets,
    selectedPresetId,
    activePreset,
    handleSelectPreset,
    evaluation
  };
}
