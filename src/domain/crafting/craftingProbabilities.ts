import type { CraftBaseItem, CraftMod, TargetModSelection } from './types';

export function calculateConfidence95(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const num = Math.log(1 - 0.95);
  const denom = Math.log(1 - p);
  return Math.ceil(num / denom);
}

export function filterAvailableMods(
  baseItem: CraftBaseItem,
  ilvl: number,
  allMods: CraftMod[]
): CraftMod[] {
  return allMods.flatMap(mod => {
    if (!mod.applicableClasses.includes(baseItem.itemClass)) return [];
    if (mod.requiresAttribute && !baseAttributeMatches(baseItem.attributeType, mod.requiresAttribute)) {
      return [];
    }
    const validTiers = mod.tiers.filter(t => t.ilvl <= ilvl);
    if (validTiers.length === 0) return [];
    return [{ ...mod, tiers: validTiers }];
  });
}

function baseAttributeMatches(baseAttr: string, requiredAttr: 'str' | 'dex' | 'int'): boolean {
  if (baseAttr === 'none') return true;
  return baseAttr.includes(requiredAttr);
}

export function calculatePoolWeights(mods: CraftMod[]): {
  prefixWeight: number;
  suffixWeight: number;
  modWeights: Record<string, { total: number; targetTiersWeight: (maxTier: number) => number }>;
} {
  let prefixWeight = 0;
  let suffixWeight = 0;
  const modWeights: Record<string, { total: number; targetTiersWeight: (maxTier: number) => number }> = {};

  for (const mod of mods) {
    const total = mod.tiers.reduce((acc, t) => acc + t.weight, 0);
    if (mod.type === 'prefix') prefixWeight += total;
    else suffixWeight += total;

    modWeights[mod.id] = {
      total,
      targetTiersWeight: (maxTier: number) =>
        mod.tiers.filter(t => t.tier <= maxTier).reduce((acc, t) => acc + t.weight, 0),
    };
  }

  return { prefixWeight, suffixWeight, modWeights };
}

export function estimateModHitProbability(
  targetMods: TargetModSelection[],
  availableMods: CraftMod[],
  guaranteedGroup?: string
): number {
  if (targetMods.length === 0) return 1;

  const { prefixWeight, suffixWeight, modWeights } = calculatePoolWeights(availableMods);
  let totalProb = 1;

  for (const target of targetMods) {
    const mod = availableMods.find(m => m.id === target.modId);
    if (!mod) return 0.0001; // Target not possible on this base/ilvl

    // If this mod's group is guaranteed (e.g. by Essence)
    if (guaranteedGroup && mod.group.toLowerCase() === guaranteedGroup.toLowerCase()) {
      continue;
    }

    const weightHelper = modWeights[mod.id];
    if (!weightHelper) return 0.0001;

    const targetWeight = weightHelper.targetTiersWeight(target.maxTier);
    if (targetWeight <= 0) return 0.0001;

    const poolWeight = mod.type === 'prefix' ? prefixWeight : suffixWeight;
    const slots = mod.type === 'prefix' ? 2.5 : 2.5; // Average 2.5 prefix / 2.5 suffix rolls
    const pSingleSlot = targetWeight / Math.max(poolWeight, 1);
    const pModHit = 1 - Math.pow(Math.max(0, 1 - pSingleSlot), slots);

    totalProb *= Math.max(0.00001, pModHit);
  }

  return Math.min(1, Math.max(0.00001, totalProb));
}
