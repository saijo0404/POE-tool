import { EXACT_STAT_TRANSLATIONS } from './atlasExactTranslations';
import { STAT_PATTERN_RULES, translatePhrase } from './atlasStatPatterns';
import allStatsZh from './atlasAllStatsZh.json';

const STATS_ZH_MAP: Record<string, string> = allStatsZh;

/**
 * Clean PoE BBCode tags like [ContainsAbyss|Abysses] -> Abysses
 */
export function cleanPoEBBCode(text: string): string {
  return text.replace(/\[(?:[^|\]]+\|)?([^\]]+)\]/g, '$1').replace(/\s+/g, ' ').trim();
}

/**
 * Main translation dispatcher:
 * 1. Comprehensive pre-compiled official Atlas Tree 585 stats table
 * 2. Exact unique passive/keystone matching
 * 3. High-precision regex pattern template matching
 * 4. Fallback phrase-by-phrase PoE dictionary translation
 */
export function translateStatToZh(statEn: string): string {
  if (!statEn) return '';
  const cleaned = cleanPoEBBCode(statEn);

  // 1. Direct dataset lookup
  if (STATS_ZH_MAP[statEn]) {
    return STATS_ZH_MAP[statEn];
  }
  if (STATS_ZH_MAP[cleaned]) {
    return STATS_ZH_MAP[cleaned];
  }

  // 2. Exact match lookup
  if (EXACT_STAT_TRANSLATIONS[cleaned]) {
    return EXACT_STAT_TRANSLATIONS[cleaned];
  }

  // 3. Regex pattern rules lookup
  for (const item of STAT_PATTERN_RULES) {
    if (item.pattern.test(cleaned)) {
      return cleaned.replace(item.pattern, item.replace);
    }
  }

  // 4. Fallback to dictionary phrase translation
  return translatePhrase(cleaned);
}
