import type { ParsedItem } from '../item/types';
import type {
  MapDangerConfig,
  MapDangerEvaluation,
  MatchedDangerMod,
  MapDangerModDefinition
} from './types';
import { MAP_DANGER_MODS } from './dangerPresets';

const MAP_TIER_REGEX = /(?:Map Tier|地圖階級|階級):\s*(\d+)/i;

export function isMapItem(item: ParsedItem | string): boolean {
  if (typeof item === 'string') {
    const text = item.toLowerCase();
    return (
      text.includes('item class: maps') ||
      text.includes('物品種類: 地圖') ||
      text.includes('物品類別: 地圖') ||
      text.includes('map tier:') ||
      text.includes('地圖階級:') ||
      text.includes('階級:') ||
      / map\b/i.test(text) ||
      text.includes('地圖')
    );
  }

  const cls = (item.itemClass || '').toLowerCase();
  if (cls.includes('map') || cls.includes('地圖')) return true;

  const base = (item.baseType || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  if (base.includes('map') || base.includes('地圖') || name.includes('map') || name.includes('地圖')) {
    return true;
  }

  return isMapItem(item.rawText || '');
}

export function extractMapTier(rawText: string): number | undefined {
  const match = MAP_TIER_REGEX.exec(rawText);
  if (match?.[1]) {
    const parsed = parseInt(match[1], 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function matchModText(line: string, patterns: string[]): boolean {
  const normalized = line.toLowerCase();
  return patterns.some(pattern => {
    try {
      const reg = new RegExp(pattern, 'i');
      return reg.test(normalized);
    } catch {
      return normalized.includes(pattern.toLowerCase());
    }
  });
}

function findMatchingDangerDef(
  line: string,
  blacklistedDefs: MapDangerModDefinition[],
  isZh: boolean
): MapDangerModDefinition | undefined {
  for (const def of blacklistedDefs) {
    const patterns = isZh ? def.matchPatternsZh : def.matchPatternsEn;
    if (matchModText(line, patterns)) {
      return def;
    }
    // Cross-language fallback
    const altPatterns = isZh ? def.matchPatternsEn : def.matchPatternsZh;
    if (matchModText(line, altPatterns)) {
      return def;
    }
  }
  return undefined;
}

export function evaluateMapDanger(
  item: ParsedItem | string,
  config: MapDangerConfig
): MapDangerEvaluation {
  const isMap = isMapItem(item);
  if (!isMap) {
    return {
      isMap: false,
      hasDanger: false,
      matchedDangerMods: [],
      matchedCustomKeywords: [],
      dangerScore: 0,
      totalModsCount: 0
    };
  }

  const rawText = typeof item === 'string' ? item : item.rawText || '';
  const isZh = typeof item === 'string' ? rawText.includes('稀有度:') || rawText.includes('地圖') : item.language === 'zh';
  const mapTier = extractMapTier(rawText);

  const blacklistedSet = new Set(config.blacklistedModIds || []);
  const activeDefs = MAP_DANGER_MODS.filter(d => blacklistedSet.has(d.id));

  const matchedDangerMods: MatchedDangerMod[] = [];
  const matchedCustomKeywords: string[] = [];
  const linesToScan: Array<{ text: string; modType: 'implicit' | 'explicit' | 'custom' }> = [];

  if (typeof item === 'object' && item !== null) {
    (item.implicits || []).forEach(m => linesToScan.push({ text: m.text, modType: 'implicit' }));
    (item.explicits || []).forEach(m => linesToScan.push({ text: m.text, modType: 'explicit' }));
  } else {
    rawText.split('\n').map(l => l.trim()).filter(Boolean).forEach(l => {
      linesToScan.push({ text: l, modType: 'explicit' });
    });
  }

  linesToScan.forEach(({ text, modType }) => {
    const def = findMatchingDangerDef(text, activeDefs, isZh);
    if (def && !matchedDangerMods.some(m => m.def.id === def.id && m.matchedLine === text)) {
      matchedDangerMods.push({ def, matchedLine: text, modType });
    }

    (config.customKeywords || []).forEach(kw => {
      const trimmed = kw.trim();
      if (trimmed && text.toLowerCase().includes(trimmed.toLowerCase())) {
        if (!matchedCustomKeywords.includes(trimmed)) {
          matchedCustomKeywords.push(trimmed);
        }
      }
    });
  });

  let dangerScore = 0;
  matchedDangerMods.forEach(m => {
    if (m.def.severity === 'deadly') dangerScore += 100;
    else if (m.def.severity === 'dangerous') dangerScore += 50;
    else dangerScore += 20;
  });
  dangerScore += matchedCustomKeywords.length * 40;

  const hasDanger = matchedDangerMods.length > 0 || matchedCustomKeywords.length > 0;

  return {
    isMap: true,
    hasDanger,
    matchedDangerMods,
    matchedCustomKeywords,
    dangerScore,
    totalModsCount: linesToScan.length,
    mapTier
  };
}
