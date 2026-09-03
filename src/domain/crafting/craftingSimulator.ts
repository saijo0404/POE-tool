import type {
  CraftBaseItem,
  CraftMod,
  CraftingMethodType,
  RolledAffix,
  SimulatedItem,
  TargetModSelection,
} from './types';
import { CRAFT_MODS } from './modDatabase';
import { ESSENCE_LIST } from './currencyDatabase';
import { filterAvailableMods } from './craftingProbabilities';

export interface SimulateRollParams {
  baseItem: CraftBaseItem;
  ilvl: number;
  method: CraftingMethodType;
  targetMods: TargetModSelection[];
  attemptCount?: number;
  totalSpentChaos?: number;
  costPerAttempt?: number;
}

export function simulateCraftRoll(params: SimulateRollParams): SimulatedItem {
  const {
    baseItem,
    ilvl,
    method,
    targetMods,
    attemptCount = 0,
    totalSpentChaos = 0,
    costPerAttempt = 1,
  } = params;

  const availableMods = filterAvailableMods(baseItem, ilvl, CRAFT_MODS);
  const prefixes: RolledAffix[] = [];
  const suffixes: RolledAffix[] = [];
  const usedGroups = new Set<string>();

  // If Essence method, guarantee essence mod
  if (method === 'essence') {
    applyGuaranteedEssenceMod(availableMods, targetMods, prefixes, suffixes, usedGroups);
  }

  // Roll random affixes up to total 4~6
  const targetTotalAffixes = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6
  const targetPrefixes = Math.min(3, Math.max(prefixes.length, Math.floor(targetTotalAffixes / 2)));
  const targetSuffixes = targetTotalAffixes - targetPrefixes;

  fillAffixes(availableMods, 'prefix', targetPrefixes, prefixes, usedGroups, targetMods);
  fillAffixes(availableMods, 'suffix', targetSuffixes, suffixes, usedGroups, targetMods);

  const hitAllTargets = checkHitTargets(targetMods, [...prefixes, ...suffixes]);

  return {
    baseItem,
    ilvl,
    prefixes,
    suffixes,
    hitAllTargets,
    attemptCount: attemptCount + 1,
    totalSpentChaos: totalSpentChaos + costPerAttempt,
  };
}

export function simulateBatchCraft(
  params: SimulateRollParams,
  maxAttempts: number = 100
): SimulatedItem {
  let item = simulateCraftRoll(params);
  let remaining = maxAttempts - 1;

  while (!item.hitAllTargets && remaining > 0) {
    item = simulateCraftRoll({
      ...params,
      attemptCount: item.attemptCount,
      totalSpentChaos: item.totalSpentChaos,
    });
    remaining--;
  }

  return item;
}

function applyGuaranteedEssenceMod(
  availableMods: CraftMod[],
  targetMods: TargetModSelection[],
  prefixes: RolledAffix[],
  suffixes: RolledAffix[],
  usedGroups: Set<string>
): void {
  // Find essence that matches one of target mods, or default to Greed
  const matchedEssence =
    ESSENCE_LIST.find(e =>
      targetMods.some(t => {
        const m = availableMods.find(mod => mod.id === t.modId);
        return m && m.group.toLowerCase() === e.guaranteedGroup.toLowerCase();
      })
    ) || ESSENCE_LIST[0];

  const mod = availableMods.find(
    m => m.group.toLowerCase() === matchedEssence.guaranteedGroup.toLowerCase()
  );
  if (!mod || mod.tiers.length === 0) return;

  const tier = mod.tiers[0]; // Guaranteed T1
  const isTargetHit = targetMods.some(t => t.modId === mod.id && 1 <= t.maxTier);
  const affix: RolledAffix = {
    modId: mod.id,
    name: mod.name,
    nameZh: mod.nameZh,
    type: mod.type,
    tier: tier.tier,
    text: tier.statTextZh,
    isTargetHit,
  };

  usedGroups.add(mod.group);
  if (mod.type === 'prefix') prefixes.push(affix);
  else suffixes.push(affix);
}

function fillAffixes(
  availableMods: CraftMod[],
  type: 'prefix' | 'suffix',
  desiredCount: number,
  output: RolledAffix[],
  usedGroups: Set<string>,
  targetMods: TargetModSelection[]
): void {
  const pool = availableMods.filter(m => m.type === type && !usedGroups.has(m.group));
  while (output.length < desiredCount && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const mod = pool.splice(idx, 1)[0];
    usedGroups.add(mod.group);

    const tier = mod.tiers[Math.floor(Math.random() * mod.tiers.length)];
    const isTargetHit = targetMods.some(t => t.modId === mod.id && tier.tier <= t.maxTier);

    output.push({
      modId: mod.id,
      name: mod.name,
      nameZh: mod.nameZh,
      type: mod.type,
      tier: tier.tier,
      text: tier.statTextZh,
      isTargetHit,
    });
  }
}

function checkHitTargets(targetMods: TargetModSelection[], rolled: RolledAffix[]): boolean {
  if (targetMods.length === 0) return true;
  return targetMods.every(target =>
    rolled.some(r => r.modId === target.modId && r.tier <= target.maxTier)
  );
}
