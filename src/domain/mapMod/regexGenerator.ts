import type { MapRegexOptions, MapRegexResult } from './types';
import { MAP_DANGER_MODS } from './dangerPresets';

const MAX_POE_SEARCH_LENGTH = 50;

function buildQuantityRegex(minQty: number, isZh: boolean): string {
  if (minQty >= 100) {
    return isZh ? '量.*(\\d{3})' : 'm q.*(\\d{3})';
  }
  const tens = Math.floor(minQty / 10);
  const units = minQty % 10;
  let pattern = '';
  if (units === 0) {
    pattern = tens === 9 ? '(9\\d|\\d{3})' : `([${tens}-9]\\d|\\d{3})`;
  } else {
    const nextTens = tens + 1;
    const tensPart = nextTens <= 9 ? (nextTens === 9 ? '9\\d' : `[${nextTens}-9]\\d`) : '';
    const unitPart = units === 9 ? `${tens}9` : `${tens}[${units}-9]`;
    pattern = tensPart ? `(${unitPart}|${tensPart}|\\d{3})` : `(${unitPart}|\\d{3})`;
  }
  return isZh ? `量.*${pattern}` : `m q.*${pattern}`;
}

function buildPackSizeRegex(minPack: number, isZh: boolean): string {
  const tens = Math.floor(minPack / 10);
  const units = minPack % 10;
  let pattern = '';
  if (units === 0) {
    pattern = tens === 9 ? '9\\d' : `([${tens}-9]\\d)`;
  } else {
    const nextTens = tens + 1;
    const tensPart = nextTens <= 9 ? (nextTens === 9 ? '9\\d' : `[${nextTens}-9]\\d`) : '';
    const unitPart = units === 9 ? `${tens}9` : `${tens}[${units}-9]`;
    pattern = tensPart ? `(${unitPart}|${tensPart})` : `(${unitPart})`;
  }
  return isZh ? `群.*${pattern}` : `m s.*${pattern}`;
}

function buildQualityRegex(minQuality: number, isZh: boolean): string {
  if (minQuality <= 0) return '';
  return isZh ? `質.*${minQuality}` : `quality:.*${minQuality}`;
}

function buildExcludeTokens(excludeModIds: string[], isZh: boolean, customRegex?: string): string[] {
  const tokens: string[] = [];
  const mapDefs = new Map(MAP_DANGER_MODS.map(d => [d.id, d]));

  excludeModIds.forEach(id => {
    const def = mapDefs.get(id);
    if (def) {
      const token = isZh ? def.regexTokenZh : def.regexTokenEn;
      if (token && !tokens.includes(token)) {
        tokens.push(token);
      }
    }
  });

  if (customRegex && customRegex.trim()) {
    tokens.push(customRegex.trim());
  }

  return tokens;
}

export function generateMapRegex(options: MapRegexOptions): MapRegexResult {
  const isZh = options.language === 'zh';
  const parts: string[] = [];

  if (options.minQuantity && options.minQuantity > 0) {
    parts.push(buildQuantityRegex(options.minQuantity, isZh));
  }

  if (options.minPackSize && options.minPackSize > 0) {
    parts.push(buildPackSizeRegex(options.minPackSize, isZh));
  }

  if (options.minQuality && options.minQuality > 0) {
    const qStr = buildQualityRegex(options.minQuality, isZh);
    if (qStr) parts.push(qStr);
  }

  const excludeTokens = buildExcludeTokens(
    options.excludeModIds || [],
    isZh,
    options.customExcludeRegex
  );

  if (excludeTokens.length > 0) {
    const combinedExclude = `!"${excludeTokens.join('|')}"`;
    parts.push(combinedExclude);
  }

  const regexString = parts.join(' ').trim();
  const length = regexString.length;
  const isWithinLimit = length <= MAX_POE_SEARCH_LENGTH;

  const subRegexes: string[] = [];
  if (!isWithinLimit && parts.length > 1) {
    // Break down into smaller regex strings that fit in 50 chars each
    let current = '';
    parts.forEach(p => {
      if ((current + ' ' + p).trim().length <= MAX_POE_SEARCH_LENGTH) {
        current = (current + ' ' + p).trim();
      } else {
        if (current) subRegexes.push(current);
        current = p;
      }
    });
    if (current) subRegexes.push(current);
  }

  return {
    regexString,
    length,
    isWithinLimit,
    subRegexes: subRegexes.length > 0 ? subRegexes : undefined
  };
}
