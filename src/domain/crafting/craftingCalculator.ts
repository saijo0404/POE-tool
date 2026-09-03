import type {
  CraftActuaryResult,
  CraftBaseItem,
  CraftMod,
  MethodEvaluation,
  TargetModSelection,
} from './types';
import { CRAFT_MODS } from './modDatabase';
import {
  CHAOS_SPAM_COST_CHAOS,
  ESSENCE_LIST,
  HARVEST_CRAFT_COST_CHAOS,
} from './currencyDatabase';
import {
  calculateConfidence95,
  estimateModHitProbability,
  filterAvailableMods,
} from './craftingProbabilities';
import { findBestFossilCombo } from './fossilOptimizer';

export { calculateConfidence95, filterAvailableMods };

interface EvaluateActuaryParams {
  baseItem: CraftBaseItem;
  ilvl: number;
  targetMods: TargetModSelection[];
  divineRate?: number;
  customPrices?: Record<string, number>;
}

export function evaluateCraftingActuary(params: EvaluateActuaryParams): CraftActuaryResult {
  const { baseItem, ilvl, targetMods, divineRate = 150, customPrices } = params;
  const availableMods = filterAvailableMods(baseItem, ilvl, CRAFT_MODS);

  const chaosEval = evaluateChaos(targetMods, availableMods, divineRate);
  const essenceEval = evaluateEssence(targetMods, availableMods, divineRate, customPrices);
  const fossilEval = evaluateFossil(targetMods, availableMods, divineRate, customPrices);
  const harvestEval = evaluateHarvest(targetMods, availableMods, divineRate);

  const evaluations: MethodEvaluation[] = [essenceEval, fossilEval, harvestEval, chaosEval];
  evaluations.sort((a, b) => a.totalExpectedCostChaos - b.totalExpectedCostChaos);
  evaluations[0].isRecommended = true;

  return {
    evaluations,
    recommendedMethod: evaluations[0],
    totalPoolModsCount: availableMods.length,
    activeTargetModsCount: targetMods.length,
  };
}

function evaluateChaos(
  targetMods: TargetModSelection[],
  availableMods: CraftMod[],
  divineRate: number
): MethodEvaluation {
  const prob = estimateModHitProbability(targetMods, availableMods);
  return buildEvaluation({
    method: 'chaos',
    title: '混沌石點骰 (Chaos Spam)',
    subtitle: '純機率隨機 Roll 4~6 條稀有詞綴',
    probability: prob,
    costPerAttempt: CHAOS_SPAM_COST_CHAOS,
    divineRate,
  });
}

function evaluateEssence(
  targetMods: TargetModSelection[],
  availableMods: CraftMod[],
  divineRate: number,
  customPrices?: Record<string, number>
): MethodEvaluation {
  let bestEssence = ESSENCE_LIST[0];
  let bestProb = 0;
  let matchedTargetName = '';

  for (const essence of ESSENCE_LIST) {
    const matched = targetMods.find(t => {
      const m = availableMods.find(mod => mod.id === t.modId);
      return m && m.group.toLowerCase() === essence.guaranteedGroup.toLowerCase();
    });

    const prob = estimateModHitProbability(targetMods, availableMods, essence.guaranteedGroup);
    if (matched && prob > bestProb) {
      bestProb = prob;
      bestEssence = essence;
      const mod = availableMods.find(m => m.id === matched.modId);
      matchedTargetName = mod?.nameZh || mod?.name || '';
    }
  }

  if (bestProb === 0) {
    bestProb = estimateModHitProbability(targetMods, availableMods);
  }

  const cost = customPrices?.[bestEssence.id] ?? bestEssence.defaultPriceChaos;
  const subtitle = matchedTargetName
    ? `保底 T1 ${matchedTargetName}，大幅降低骰取難度`
    : `使用 ${bestEssence.nameZh} 保底主要詞綴`;

  return buildEvaluation({
    method: 'essence',
    title: `精髓工藝 (${bestEssence.nameZh})`,
    subtitle,
    probability: bestProb,
    costPerAttempt: cost,
    divineRate,
    essenceUsed: bestEssence.nameZh,
  });
}

function evaluateFossil(
  targetMods: TargetModSelection[],
  availableMods: CraftMod[],
  divineRate: number,
  customPrices?: Record<string, number>
): MethodEvaluation {
  const bestFossil = findBestFossilCombo(targetMods, availableMods, customPrices);
  const names = bestFossil.fossils.map(f => f.nameZh).join(' + ');

  return buildEvaluation({
    method: 'fossil',
    title: `化石配方 (${bestFossil.fossils.length} 顆插槽)`,
    subtitle: `最佳組合：${names}`,
    probability: bestFossil.probability,
    costPerAttempt: bestFossil.costPerAttemptChaos,
    divineRate,
    fossilCombo: bestFossil.fossils.map(f => f.nameZh),
  });
}

function evaluateHarvest(
  targetMods: TargetModSelection[],
  availableMods: CraftMod[],
  divineRate: number
): MethodEvaluation {
  // Harvest guarantees 1 mod of chosen tag, improving odds by ~3x for targeted tag
  const baseProb = estimateModHitProbability(targetMods, availableMods);
  const prob = Math.min(1, baseProb * 3.5);

  return buildEvaluation({
    method: 'harvest',
    title: '莊園收割 (Harvest Reforge)',
    subtitle: '保底包含 1 條指定標籤 (Life / Resist / Defence) 詞綴',
    probability: prob,
    costPerAttempt: HARVEST_CRAFT_COST_CHAOS,
    divineRate,
  });
}

function buildEvaluation(params: {
  method: 'essence' | 'fossil' | 'harvest' | 'chaos';
  title: string;
  subtitle: string;
  probability: number;
  costPerAttempt: number;
  divineRate: number;
  essenceUsed?: string;
  fossilCombo?: string[];
}): MethodEvaluation {
  const p = Math.min(1, Math.max(0.00001, params.probability));
  const avgAttempts = Math.round(1 / p);
  const totalChaos = Math.round(avgAttempts * params.costPerAttempt);
  const conf95Attempts = calculateConfidence95(p);
  const conf95CostChaos = Math.round(conf95Attempts * params.costPerAttempt);

  return {
    method: params.method,
    title: params.title,
    subtitle: params.subtitle,
    successProbability: p,
    averageAttempts: avgAttempts,
    costPerAttemptChaos: params.costPerAttempt,
    totalExpectedCostChaos: totalChaos,
    totalExpectedCostDivine: Number((totalChaos / params.divineRate).toFixed(1)),
    confidence95Attempts: conf95Attempts,
    confidence95CostChaos: conf95CostChaos,
    confidence95CostDivine: Number((conf95CostChaos / params.divineRate).toFixed(1)),
    essenceUsed: params.essenceUsed,
    fossilCombo: params.fossilCombo,
  };
}
