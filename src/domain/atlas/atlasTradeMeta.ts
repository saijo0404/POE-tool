import type { BatchItemRequirement } from './types';

export interface ItemTradeMeta {
  cleanChineseName: string;
  cleanEnglishName: string;
  tier?: number;
  isCraft: boolean;
  tradeSearchUrl?: string;
}

function extractTier(name: string, nameEn?: string): number | undefined {
  const match = name.match(/T(?:ier\s*)?(\d+)/i) || (nameEn && nameEn.match(/T(?:ier\s*)?(\d+)/i));
  return match ? parseInt(match[1], 10) : undefined;
}

function buildMapTradeUrl(mapTier: number, is8Mod: boolean, league: string): string {
  const mapFilters = { map_tier: { min: mapTier, max: mapTier } };
  const filters: Record<string, unknown> = {
    type_filters: { filters: { category: { option: 'map' } } },
    map_filters: { filters: mapFilters }
  };
  if (is8Mod) {
    filters.misc_filters = { filters: { corrupted: { option: 'true' } } };
  }
  const query = { status: { option: 'online' }, filters };
  const safeLeague = encodeURIComponent(league || 'Settlers');
  const qStr = encodeURIComponent(JSON.stringify({ query }));
  return `https://www.pathofexile.com/trade/search/${safeLeague}?q=${qStr}`;
}

function buildTypeTradeUrl(cleanType: string, league: string): string {
  const query = {
    status: { option: 'online' },
    type: cleanType
  };
  const safeLeague = encodeURIComponent(league || 'Settlers');
  const qStr = encodeURIComponent(JSON.stringify({ query }));
  return `https://www.pathofexile.com/trade/search/${safeLeague}?q=${qStr}`;
}

function resolveMapTradeMeta(
  item: BatchItemRequirement,
  tier: number | undefined,
  league: string
): { cleanChinese: string; cleanEnglish: string; tradeSearchUrl: string } {
  const mapTier = tier || 16;
  const is8Mod = item.name.includes('8詞') || (item.nameEn && item.nameEn.includes('8-Mod'));
  const cleanChinese = is8Mod ? `T${mapTier} 8詞已污染地圖` : `T${mapTier} 地圖`;
  const cleanEnglish = is8Mod ? `Tier ${mapTier} 8-Mod Corrupted Map` : `Tier ${mapTier} Map`;
  const tradeSearchUrl = buildMapTradeUrl(mapTier, Boolean(is8Mod), league);
  return { cleanChinese, cleanEnglish, tradeSearchUrl };
}

export function resolveItemTradeMeta(item: BatchItemRequirement, league: string = 'Settlers'): ItemTradeMeta {
  const isCraft = item.category === 'craft' || item.name.includes('工藝');
  const isMap = item.category === 'map' || item.name.includes('地圖') || (item.nameEn && item.nameEn.includes('Map'));
  let cleanChinese = item.name.split(' (')[0].trim();
  let cleanEnglish = (item.nameEn || '').trim();
  const tier = extractTier(item.name, item.nameEn);
  let tradeSearchUrl: string | undefined;

  if (isMap && !isCraft) {
    const res = resolveMapTradeMeta(item, tier, league);
    cleanChinese = res.cleanChinese;
    cleanEnglish = res.cleanEnglish;
    tradeSearchUrl = res.tradeSearchUrl;
  } else if (!isCraft && cleanEnglish) {
    cleanChinese = cleanChinese.replace(/^T\d+\s+/i, '').trim();
    cleanEnglish = cleanEnglish.replace(/^T\d+\s+/i, '').trim();
    if (!cleanEnglish) {
      const pMatch = item.name.match(/\((.*?)\)/);
      cleanEnglish = pMatch ? pMatch[1].trim() : cleanChinese;
    }
    tradeSearchUrl = buildTypeTradeUrl(cleanEnglish, league);
  }

  return { cleanChineseName: cleanChinese, cleanEnglishName: cleanEnglish, tier, isCraft, tradeSearchUrl };
}
