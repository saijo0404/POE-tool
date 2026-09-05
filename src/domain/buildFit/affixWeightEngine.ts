import { Ok, type Result } from '../errors/Result';
import type { DomainError } from '../errors/DomainError';
import type { ParsedItem } from '../../types/poe';
import type {
  AffixWeightRule,
  BuildFitEvaluation,
  BuildFitRank,
  BuildPreset,
  BuildScoreThresholds,
  AffixMatchResult
} from './types';

export function extractStatValue(modText: string): number {
  const matches = modText.match(/\d+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) {
    return 1;
  }
  if (matches.length >= 2 && /(?:to|至)/i.test(modText)) {
    const val1 = parseFloat(matches[0]);
    const val2 = parseFloat(matches[1]);
    return Math.round(((val1 + val2) / 2) * 10) / 10;
  }
  return parseFloat(matches[0]);
}

export function getRankFromScore(score: number, thresholds: BuildScoreThresholds): BuildFitRank {
  if (score >= thresholds.s) return 'S';
  if (score >= thresholds.a) return 'A';
  if (score >= thresholds.b) return 'B';
  if (score >= thresholds.c) return 'C';
  return 'D';
}

function evaluateModWithRule(modText: string, rule: AffixWeightRule): AffixMatchResult | null {
  if (!rule.pattern.test(modText)) return null;
  const value = extractStatValue(modText);
  const effectiveValue = rule.maxCap ? Math.min(value, rule.maxCap) : value;
  const score = Math.round(effectiveValue * rule.weight);
  return {
    modText,
    ruleId: rule.id,
    ruleName: rule.name,
    extractedValue: value,
    score
  };
}

function collectAllItemMods(item: ParsedItem): string[] {
  const mods: string[] = [];
  const addMods = (list?: typeof item.implicits) => {
    if (!list) return;
    for (const m of list) {
      if (m.text) mods.push(m.text);
      if (m.englishText && m.englishText !== m.text) mods.push(m.englishText);
    }
  };
  addMods(item.implicits);
  addMods(item.explicits);
  return mods;
}

function generateAdvice(rank: BuildFitRank, presetName: string, highlights: string[]): string {
  const hl = highlights.length > 0 ? ` (${highlights.join(', ')})` : '';
  if (rank === 'S') return `💎 極品契合！完美符合 ${presetName} 核心需求${hl}。`;
  if (rank === 'A') return `✨ 高度契合：具備重要流派屬性${hl}，強烈推薦保留使用。`;
  if (rank === 'B') return `👍 中度契合：部分符合配置需求${hl}，可作為拓荒過渡備選。`;
  if (rank === 'C') return `⚠️ 契合度偏低：僅少數次要屬性相符，建議替換。`;
  return `❌ 不匹配：與當前 ${presetName} 核心需求無關。`;
}

export function evaluateItemFit(
  item: ParsedItem,
  preset: BuildPreset
): Result<BuildFitEvaluation, DomainError> {
  const mods = collectAllItemMods(item);
  const matches: AffixMatchResult[] = [];
  let totalScore = 0;

  for (const mod of mods) {
    for (const rule of preset.rules) {
      const match = evaluateModWithRule(mod, rule);
      if (match) {
        matches.push(match);
        totalScore += match.score;
        break;
      }
    }
  }

  matches.sort((a, b) => b.score - a.score);
  const primaryHighlights = matches.slice(0, 3).map(m => `${m.ruleName} (+${m.extractedValue})`);
  const rank = getRankFromScore(totalScore, preset.scoreThresholds);
  const advice = generateAdvice(rank, preset.name, primaryHighlights);

  return new Ok({
    presetId: preset.id,
    presetName: preset.name,
    totalScore,
    rank,
    matches,
    primaryHighlights,
    advice
  });
}
