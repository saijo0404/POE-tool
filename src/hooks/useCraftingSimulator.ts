import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  CraftActuaryResult,
  CraftBaseItem,
  CraftPreset,
  CraftingMethodType,
  ItemClass,
  SimulatedItem,
  TargetModSelection,
} from '../domain/crafting/types';
import { CRAFT_BASES } from '../domain/crafting/basesDatabase';
import { CRAFT_PRESETS } from '../domain/crafting/craftingPresets';
import { CraftingService } from '../application/crafting/craftingService';
import { CraftingStorage } from '../infrastructure/storage/craftingStorage';
import { simulateCraftRoll, simulateBatchCraft } from '../domain/crafting/craftingSimulator';
import { useAtlasNinjaRates } from './atlas/useAtlasNinjaRates';

interface UseCraftingSimulatorProps {
  league?: string;
  divineRate?: number;
  onShowToast?: (msg: string) => void;
}

export function useCraftingSimulator({
  league = 'Settlers',
  divineRate = 150,
  onShowToast,
}: UseCraftingSimulatorProps = {}) {
  const { ninjaRates } = useAtlasNinjaRates(league);

  const [selectedClass, setSelectedClass] = useState<ItemClass>('body_armour');
  const [selectedBase, setSelectedBase] = useState<CraftBaseItem>(CRAFT_BASES[0]);
  const [ilvl, setIlvl] = useState<number>(86);
  const [targetMods, setTargetMods] = useState<TargetModSelection[]>(CRAFT_PRESETS[0].targetMods);
  const [activePresetId, setActivePresetId] = useState<string>(CRAFT_PRESETS[0].id);
  const [customPresets, setCustomPresets] = useState<CraftPreset[]>([]);

  // Simulation Sandbox State
  const [selectedSimMethod, setSelectedSimMethod] = useState<CraftingMethodType>('essence');
  const [simulatedItem, setSimulatedItem] = useState<SimulatedItem | null>(null);

  // Load custom presets on mount
  useEffect(() => {
    setCustomPresets(CraftingStorage.getCustomPresets());
  }, []);

  // Update bases when class changes
  const availableBases = useMemo(
    () => CRAFT_BASES.filter(b => b.itemClass === selectedClass),
    [selectedClass]
  );

  const handleClassChange = useCallback((itemClass: ItemClass) => {
    setSelectedClass(itemClass);
    const firstBase = CRAFT_BASES.find(b => b.itemClass === itemClass) || CRAFT_BASES[0];
    setSelectedBase(firstBase);
    setIlvl(firstBase.defaultIlvl);
    setTargetMods([]);
    setActivePresetId('');
    setSimulatedItem(null);
  }, []);

  const handleBaseChange = useCallback((baseId: string) => {
    const base = CRAFT_BASES.find(b => b.id === baseId);
    if (base) {
      setSelectedBase(base);
      setIlvl(base.defaultIlvl);
      setSimulatedItem(null);
    }
  }, []);

  const handleToggleTargetMod = useCallback((modId: string, maxTier: number = 1) => {
    setTargetMods(prev => {
      const exists = prev.find(t => t.modId === modId);
      if (exists) {
        return prev.filter(t => t.modId !== modId);
      }
      return [...prev, { modId, maxTier }];
    });
    setActivePresetId('');
    setSimulatedItem(null);
  }, []);

  const handleApplyPreset = useCallback((presetId: string) => {
    const all = [...CRAFT_PRESETS, ...customPresets];
    const preset = all.find(p => p.id === presetId);
    if (!preset) return;

    const base = CRAFT_BASES.find(b => b.id === preset.baseItemId);
    if (base) {
      setSelectedClass(base.itemClass);
      setSelectedBase(base);
    }
    setIlvl(preset.ilvl);
    setTargetMods(preset.targetMods);
    setActivePresetId(preset.id);
    setSimulatedItem(null);
    onShowToast?.(`已套用配方：${preset.nameZh}`);
  }, [customPresets, onShowToast]);

  // Evaluate Actuary calculation
  const actuaryResult: CraftActuaryResult | null = useMemo(() => {
    const res = CraftingService.evaluate({
      baseItem: selectedBase,
      ilvl,
      targetMods,
      divineRate,
      ninjaRates,
    });
    return res.isOk() ? res.unwrap() : null;
  }, [selectedBase, ilvl, targetMods, divineRate, ninjaRates]);

  // Simulation handlers
  const handleRollOnce = useCallback(() => {
    const cost = actuaryResult?.evaluations.find(e => e.method === selectedSimMethod)?.costPerAttemptChaos ?? 1;
    const rolled = simulateCraftRoll({
      baseItem: selectedBase,
      ilvl,
      method: selectedSimMethod,
      targetMods,
      attemptCount: simulatedItem?.attemptCount ?? 0,
      totalSpentChaos: simulatedItem?.totalSpentChaos ?? 0,
      costPerAttempt: cost,
    });
    setSimulatedItem(rolled);
  }, [selectedBase, ilvl, selectedSimMethod, targetMods, simulatedItem, actuaryResult]);

  const handleRollUntilHit = useCallback(() => {
    const cost = actuaryResult?.evaluations.find(e => e.method === selectedSimMethod)?.costPerAttemptChaos ?? 1;
    const rolled = simulateBatchCraft({
      baseItem: selectedBase,
      ilvl,
      method: selectedSimMethod,
      targetMods,
      attemptCount: simulatedItem?.attemptCount ?? 0,
      totalSpentChaos: simulatedItem?.totalSpentChaos ?? 0,
      costPerAttempt: cost,
    }, 100);
    setSimulatedItem(rolled);
    if (rolled.hitAllTargets) {
      onShowToast?.(`🎉 恭喜！耗費 ${rolled.attemptCount} 次成功點出所有目標詞綴！`);
    } else {
      onShowToast?.(`模擬已達 100 次上限，尚未完全命中。`);
    }
  }, [selectedBase, ilvl, selectedSimMethod, targetMods, simulatedItem, actuaryResult, onShowToast]);

  const handleResetSimulation = useCallback(() => {
    setSimulatedItem(null);
  }, []);

  return {
    selectedClass,
    selectedBase,
    availableBases,
    ilvl,
    setIlvl,
    targetMods,
    activePresetId,
    customPresets,
    actuaryResult,
    selectedSimMethod,
    setSelectedSimMethod,
    simulatedItem,
    handleClassChange,
    handleBaseChange,
    handleToggleTargetMod,
    handleApplyPreset,
    handleRollOnce,
    handleRollUntilHit,
    handleResetSimulation,
  };
}
