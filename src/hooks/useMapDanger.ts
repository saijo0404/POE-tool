import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  MapDangerConfig,
  MapDangerEvaluation,
  MapRegexOptions,
  MapRegexResult
} from '../domain/mapMod/types';
import type { ParsedItem } from '../domain/item/types';
import {
  DEFAULT_MAP_DANGER_CONFIG,
  BUILD_ARCHETYPE_PRESETS
} from '../domain/mapMod/dangerPresets';
import { evaluateMapDanger } from '../domain/mapMod/dangerEvaluator';
import { generateMapRegex } from '../domain/mapMod/regexGenerator';
import { playDangerAlertSound } from '../application/audio/alertSound';
import { useSettings } from './useSettings';

const STORAGE_KEY = 'poe_tool_map_danger_config';

export function useMapDanger() {
  const { settings, updateSettings } = useSettings();

  const [config, setConfig] = useState<MapDangerConfig>(() => {
    if (settings.mapDangerConfig) return settings.mapDangerConfig;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_MAP_DANGER_CONFIG;
  });

  const [regexOptions, setRegexOptions] = useState<MapRegexOptions>({
    minQuantity: 80,
    minPackSize: 25,
    minQuality: 20,
    excludeModIds: config.blacklistedModIds || ['ele_reflect', 'phys_reflect', 'no_regen'],
    language: 'zh'
  });

  const [copiedRegex, setCopiedRegex] = useState<boolean>(false);

  // Synchronize config updates to LocalStorage and settings
  const updateConfig = useCallback((patch: Partial<MapDangerConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      updateSettings({ mapDangerConfig: next });
      return next;
    });
  }, [updateSettings]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = BUILD_ARCHETYPE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    updateConfig({
      activePresetId: preset.id,
      blacklistedModIds: [...preset.defaultBlacklistIds]
    });
    setRegexOptions(prev => ({
      ...prev,
      excludeModIds: [...preset.defaultBlacklistIds]
    }));
  }, [updateConfig]);

  const toggleModBlacklist = useCallback((modId: string) => {
    setConfig(prev => {
      const current = prev.blacklistedModIds || [];
      const nextIds = current.includes(modId)
        ? current.filter(id => id !== modId)
        : [...current, modId];
      const updated = { ...prev, blacklistedModIds: nextIds, activePresetId: undefined };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      updateSettings({ mapDangerConfig: updated });
      return updated;
    });

    setRegexOptions(prev => {
      const current = prev.excludeModIds || [];
      const nextIds = current.includes(modId)
        ? current.filter(id => id !== modId)
        : [...current, modId];
      return { ...prev, excludeModIds: nextIds };
    });
  }, [updateSettings]);

  const addCustomKeyword = useCallback((kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    updateConfig({
      customKeywords: [...(config.customKeywords || []).filter(k => k !== trimmed), trimmed]
    });
  }, [config.customKeywords, updateConfig]);

  const removeCustomKeyword = useCallback((kw: string) => {
    updateConfig({
      customKeywords: (config.customKeywords || []).filter(k => k !== kw)
    });
  }, [config.customKeywords, updateConfig]);

  const testSound = useCallback(() => {
    playDangerAlertSound();
  }, []);

  const lastAlertTimestampRef = useRef<number>(0);

  const evaluateItem = useCallback((
    item: ParsedItem | string,
    triggerAudio = true
  ): MapDangerEvaluation => {
    const result = evaluateMapDanger(item, config);
    if (triggerAudio && result.hasDanger && config.soundAlertEnabled) {
      const now = Date.now();
      // Throttle audio alerts within 800ms to avoid audio stacking
      if (now - lastAlertTimestampRef.current > 800) {
        lastAlertTimestampRef.current = now;
        playDangerAlertSound();
      }
    }
    return result;
  }, [config]);

  const regexResult: MapRegexResult = useMemo(() => {
    return generateMapRegex(regexOptions);
  }, [regexOptions]);

  const copyGeneratedRegex = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(regexResult.regexString);
      setCopiedRegex(true);
      setTimeout(() => setCopiedRegex(false), 2000);
    }
  }, [regexResult.regexString]);

  // Sync settings when loaded from external update
  useEffect(() => {
    if (settings.mapDangerConfig) {
      setConfig(settings.mapDangerConfig);
    }
  }, [settings.mapDangerConfig]);

  return {
    config,
    updateConfig,
    applyPreset,
    toggleModBlacklist,
    addCustomKeyword,
    removeCustomKeyword,
    testSound,
    evaluateItem,
    regexOptions,
    setRegexOptions,
    regexResult,
    copiedRegex,
    copyGeneratedRegex
  };
}
