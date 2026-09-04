import type { ParsedItem, ParsedItemMod } from '../item/types';
import type { CraftingSpaces, EvaluatedAffix, GearPotentialReport, PotentialGrade } from './types';
import { classifyAffix } from './affixClassifier';

function evaluateSingleMod(mod: ParsedItemMod): EvaluatedAffix {
  const classification = classifyAffix(mod);
  const tier = mod.tier;
  const tierLabel = mod.type === 'fractured'
    ? `T${tier || 1} (破碎)`
    : mod.type === 'crafted'
      ? '工藝'
      : tier ? `T${tier}` : undefined;

  let score = 0;
  if (tier === 1) score = 28;
  else if (tier === 2) score = 18;
  else if (tier === 3) score = 10;
  else score = 4;
  if (mod.type === 'fractured') score += 15;

  return {
    id: mod.id,
    text: mod.text,
    englishText: mod.englishText,
    classification,
    type: mod.type,
    tier,
    tierLabel,
    score
  };
}

function getMaxAffixes(rarity: string): { maxPrefixes: number; maxSuffixes: number } {
  if (rarity === 'Magic') return { maxPrefixes: 1, maxSuffixes: 1 };
  if (rarity === 'Rare') return { maxPrefixes: 3, maxSuffixes: 3 };
  return { maxPrefixes: 0, maxSuffixes: 0 };
}

export function calculateCraftingSpaces(
  rarity: string,
  prefixes: EvaluatedAffix[],
  suffixes: EvaluatedAffix[],
  corrupted: boolean = false
): CraftingSpaces {
  const { maxPrefixes, maxSuffixes } = getMaxAffixes(rarity);
  const totalPrefixes = prefixes.length;
  const totalSuffixes = suffixes.length;
  const openPrefixes = Math.max(0, maxPrefixes - totalPrefixes);
  const openSuffixes = Math.max(0, maxSuffixes - totalSuffixes);
  const hasCraftedMod = [...prefixes, ...suffixes].some(m => m.type === 'crafted');
  const hasFracturedMod = [...prefixes, ...suffixes].some(m => m.type === 'fractured');
  const canCraft = !corrupted && !hasCraftedMod;

  return {
    totalPrefixes,
    totalSuffixes,
    maxPrefixes,
    maxSuffixes,
    openPrefixes,
    openSuffixes,
    hasCraftedMod,
    hasFracturedMod,
    canCraftBenchMod: canCraft && (openPrefixes > 0 || openSuffixes > 0),
    canMultiMod: canCraft && openSuffixes >= 1 && (openPrefixes + openSuffixes >= 2),
    canPrefixesCannotBeChanged: canCraft && openSuffixes >= 1,
    canSuffixesCannotBeChanged: canCraft && openPrefixes >= 1
  };
}

function calculateScoreAndGrade(
  rarity: string,
  prefixes: EvaluatedAffix[],
  suffixes: EvaluatedAffix[],
  spaces: CraftingSpaces
): { score: number; grade: PotentialGrade } {
  if (rarity !== 'Rare' && rarity !== 'Magic') {
    return { score: 0, grade: 'C' };
  }

  const rawScore = [...prefixes, ...suffixes].reduce((sum, m) => sum + m.score, 0);
  const openBonus = spaces.canCraftBenchMod ? 10 : 0;
  const score = Math.min(100, rawScore + openBonus);

  let grade: PotentialGrade = 'C';
  if (score >= 80) grade = 'S';
  else if (score >= 65) grade = 'A';
  else if (score >= 45) grade = 'B';

  return { score, grade };
}

export function generateCraftingRecommendations(
  spaces: CraftingSpaces,
  prefixes: EvaluatedAffix[],
  suffixes: EvaluatedAffix[],
  score: number,
  corrupted: boolean = false
): string[] {
  if (corrupted) {
    return ['⚠️ 裝備已污染 (Corrupted)，無法使用工藝台或常規通貨進行後續加工'];
  }
  const recs: string[] = [];
  if (score >= 80) recs.push('🌟 頂級工藝胚子！高階詞綴豐富，具備極高的後續打造價值');

  if (spaces.hasCraftedMod) {
    recs.push('此裝備已有工藝大師附魔，可至工藝台「移除工藝」以重新調整');
  } else if (spaces.openPrefixes > 0 && spaces.openSuffixes > 0) {
    recs.push('前後綴皆有空位，可直接於藏身處工藝台附加關鍵生命或抗性');
  } else if (spaces.openPrefixes > 0) {
    recs.push('後綴已滿但前綴尚有空位，推薦工藝台附加最大生命或防禦屬性');
  } else if (spaces.openSuffixes > 0) {
    recs.push('前綴已滿但後綴尚有空位，推薦工藝台附加抗性或屬性');
  }

  if (spaces.canPrefixesCannotBeChanged && prefixes.filter(p => p.tier === 1).length >= 2) {
    recs.push('前綴具備 2 條以上 T1 詞綴，可使用「前綴無法變更」保護並以隱匿混沌石重洗後綴');
  }
  if (spaces.canSuffixesCannotBeChanged && suffixes.filter(s => s.tier === 1).length >= 2) {
    recs.push('後綴具備 2 條以上 T1 詞綴，可使用「後綴無法變更」保護並以隱匿混沌石重洗前綴');
  }

  return recs;
}

export function evaluateGearPotential(item: ParsedItem): GearPotentialReport {
  const evaluatedExplicits = (item.explicits || []).map(evaluateSingleMod);
  const prefixes = evaluatedExplicits.filter(m => m.classification === 'prefix');
  const suffixes = evaluatedExplicits.filter(m => m.classification === 'suffix');
  const implicits = (item.implicits || []).map(evaluateSingleMod);

  const isCorrupted = Boolean(item.corrupted);
  const spaces = calculateCraftingSpaces(item.rarity, prefixes, suffixes, isCorrupted);
  const { score, grade } = calculateScoreAndGrade(item.rarity, prefixes, suffixes, spaces);
  const recommendations = generateCraftingRecommendations(spaces, prefixes, suffixes, score, isCorrupted);

  return {
    score,
    grade,
    isHighValueBase: score >= 80,
    recommendations,
    spaces,
    prefixes,
    suffixes,
    implicits
  };
}
