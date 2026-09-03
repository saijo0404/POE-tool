import type { CraftMod, FossilDefinition, TargetModSelection } from './types';
import { FOSSIL_LIST, RESONATOR_PRICES } from './currencyDatabase';
import { estimateModHitProbability } from './craftingProbabilities';

export interface FossilComboResult {
  fossils: FossilDefinition[];
  probability: number;
  costPerAttemptChaos: number;
  expectedCostChaos: number;
}

export function findBestFossilCombo(
  targetMods: TargetModSelection[],
  availableMods: CraftMod[],
  customPrices?: Record<string, number>
): FossilComboResult {
  const candidates: FossilComboResult[] = [];
  const getPrice = (id: string, def: number) => customPrices?.[id] ?? def;

  // Evaluate single fossils
  for (const fossil of FOSSIL_LIST) {
    if (isTargetBlocked([fossil], targetMods, availableMods)) continue;
    const reweighted = applyFossilWeights([fossil], availableMods);
    const prob = estimateModHitProbability(targetMods, reweighted);
    const cost = getPrice(fossil.id, fossil.defaultPriceChaos) + (RESONATOR_PRICES[1] ?? 1);
    candidates.push({ fossils: [fossil], probability: prob, costPerAttemptChaos: cost, expectedCostChaos: (1 / prob) * cost });
  }

  // Evaluate 2-fossil pairs
  for (let i = 0; i < FOSSIL_LIST.length; i++) {
    for (let j = i + 1; j < FOSSIL_LIST.length; j++) {
      const combo = [FOSSIL_LIST[i], FOSSIL_LIST[j]];
      if (isTargetBlocked(combo, targetMods, availableMods)) continue;
      const reweighted = applyFossilWeights(combo, availableMods);
      const prob = estimateModHitProbability(targetMods, reweighted);
      const cost = getPrice(combo[0].id, combo[0].defaultPriceChaos) + getPrice(combo[1].id, combo[1].defaultPriceChaos) + (RESONATOR_PRICES[2] ?? 3);
      candidates.push({ fossils: combo, probability: prob, costPerAttemptChaos: cost, expectedCostChaos: (1 / prob) * cost });
    }
  }

  if (candidates.length === 0) {
    const fallback = FOSSIL_LIST[0];
    const cost = fallback.defaultPriceChaos + 1;
    const prob = estimateModHitProbability(targetMods, availableMods);
    return { fossils: [fallback], probability: prob, costPerAttemptChaos: cost, expectedCostChaos: (1 / prob) * cost };
  }

  candidates.sort((a, b) => a.expectedCostChaos - b.expectedCostChaos);
  return candidates[0];
}

function isTargetBlocked(fossils: FossilDefinition[], targets: TargetModSelection[], availableMods: CraftMod[]): boolean {
  const allBlockedTags = new Set(fossils.flatMap(f => f.blockedTags));
  return targets.some(t => {
    const mod = availableMods.find(m => m.id === t.modId);
    return mod && mod.tags.some(tag => allBlockedTags.has(tag));
  });
}

function applyFossilWeights(fossils: FossilDefinition[], availableMods: CraftMod[]): CraftMod[] {
  const allPosTags = new Set(fossils.flatMap(f => f.positiveTags));
  const allBlockedTags = new Set(fossils.flatMap(f => f.blockedTags));

  return availableMods.flatMap(mod => {
    if (mod.tags.some(t => allBlockedTags.has(t))) return []; // 0 weight, remove from pool
    const multiplier = mod.tags.some(t => allPosTags.has(t)) ? 10 : 1;
    const reweightedTiers = mod.tiers.map(t => ({ ...t, weight: t.weight * multiplier }));
    return [{ ...mod, tiers: reweightedTiers }];
  });
}
