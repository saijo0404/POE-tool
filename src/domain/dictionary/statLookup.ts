import { POE2_STAT_ENTRIES } from './poe2Stats';
import { getPoe2CanonicalBaseMappings, getPoe2ItemMap } from './poe2Bases';
import type { StatDictionaryEntry, StatMatchResult } from './types';

// Precomputed Base Type Maps
const poe2ItemMap = getPoe2ItemMap();
const reverseBaseMap = new Map<string, string>();

for (const { zh, en } of getPoe2CanonicalBaseMappings()) {
  reverseBaseMap.set(en.toLowerCase(), zh);
}

export function lookupEnglishBaseType(zhBaseType: string): string | undefined {
  if (!zhBaseType) return undefined;
  const clean = zhBaseType.trim();
  return poe2ItemMap.get(clean);
}

export function lookupChineseBaseType(enBaseType: string): string | undefined {
  if (!enBaseType) return undefined;
  const clean = enBaseType.trim().toLowerCase();
  return reverseBaseMap.get(clean);
}

export function normalizePattern(text: string): string {
  const protectedText = text
    .replace(/武器配置\s*1/gi, '武器配置_SETONE_')
    .replace(/武器配置\s*2/gi, '武器配置_SETTWO_')
    .replace(/weapon set\s*1/gi, 'weapon_set_SETONE_')
    .replace(/weapon set\s*2/gi, 'weapon_set_SETTWO_');

  const s = protectedText.replace(/[+-]?\d+(?:\.\d+)?|[+-]?#/g, '#');

  const restored = s
    .replace(/武器配置_SETONE_/g, '武器配置 1')
    .replace(/武器配置_SETTWO_/g, '武器配置 2')
    .replace(/weapon_set_SETONE_/g, 'weapon set 1')
    .replace(/weapon_set_SETTWO_/g, 'weapon set 2');

  return restored
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function extractPrimaryValue(text: string): number | undefined {
  const clean = text.replace(/^(?:武器配置\s*[12]:?|weapon set\s*[12]:?)\s*/i, '');
  const match = clean.match(/[+-]?\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const val = parseFloat(match[0]);
  return Number.isNaN(val) ? undefined : val;
}

function buildMatchResult(entry: StatDictionaryEntry, val?: number): StatMatchResult {
  return {
    id: entry.id,
    enText: entry.enText || entry.zhText,
    value: val,
    minValue: val !== undefined && val > 0 ? Math.floor(val * 0.85) : val,
    maxValue: val !== undefined && val > 0 ? Math.ceil(val * 1.15) : val,
  };
}

// Map from normalized pattern -> StatDictionaryEntry
const patternMap = new Map<string, StatDictionaryEntry>();

for (const entry of POE2_STAT_ENTRIES) {
  if (entry.zhText) {
    patternMap.set(normalizePattern(entry.zhText), entry);
  }
  if (entry.enText) {
    patternMap.set(normalizePattern(entry.enText), entry);
  }
}

export function lookupPoe2Stat(rawLine: string): StatMatchResult | null {
  if (!rawLine) return null;
  const clean = rawLine.trim();
  if (!clean) return null;

  const normalized = normalizePattern(clean);
  const primaryVal = extractPrimaryValue(clean);

  // 1. Exact pattern lookup
  const exact = patternMap.get(normalized);
  if (exact) {
    return buildMatchResult(exact, primaryVal);
  }

  // 2. Substring fallback lookup
  let bestMatch: { entry: StatDictionaryEntry; length: number } | null = null;
  for (const entry of POE2_STAT_ENTRIES) {
    const zhCore = entry.zhText.replace(/[#+%]/g, '').trim();
    if (zhCore.length >= 2 && clean.includes(zhCore)) {
      if (!bestMatch || zhCore.length > bestMatch.length) {
        bestMatch = { entry, length: zhCore.length };
      }
    }
    const enCore = entry.enText.replace(/[#+%]/g, '').trim();
    if (enCore.length >= 3 && clean.toLowerCase().includes(enCore.toLowerCase())) {
      if (!bestMatch || enCore.length > bestMatch.length) {
        bestMatch = { entry, length: enCore.length };
      }
    }
  }

  if (bestMatch) {
    return buildMatchResult(bestMatch.entry, primaryVal);
  }

  return null;
}

export const lookupStatByText = lookupPoe2Stat;
