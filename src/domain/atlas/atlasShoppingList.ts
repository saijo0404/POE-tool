import type { AtlasCalculationSummary, BatchItemRequirement } from './types';

export interface ItemTradeMeta {
  cleanChineseName: string;
  cleanEnglishName: string;
  tier?: number;
  isCraft: boolean;
  tradeSearchUrl?: string;
}

export function resolveItemTradeMeta(item: BatchItemRequirement, league: string = 'Settlers'): ItemTradeMeta {
  const isCraft = item.category === 'craft' || item.name.includes('工藝');
  const isMap = item.category === 'map' || item.name.includes('地圖') || (item.nameEn && item.nameEn.includes('Map'));
  let cleanChinese = item.name.split(' (')[0].trim();
  let cleanEnglish = (item.nameEn || '').trim();
  let tier: number | undefined;

  // Extract Tier if present (e.g. T16, T17, Tier 16)
  const tierMatch = item.name.match(/T(?:ier\s*)?(\d+)/i) || (item.nameEn && item.nameEn.match(/T(?:ier\s*)?(\d+)/i));
  if (tierMatch) {
    tier = parseInt(tierMatch[1], 10);
  }

  let tradeSearchUrl: string | undefined;

  if (isMap && !isCraft) {
    const mapTier = tier || 16;
    const is8Mod = item.name.includes('8詞') || (item.nameEn && item.nameEn.includes('8-Mod'));
    cleanChinese = is8Mod ? `T${mapTier} 8詞已污染地圖` : `T${mapTier} 地圖`;
    cleanEnglish = is8Mod ? `Tier ${mapTier} 8-Mod Corrupted Map` : `Tier ${mapTier} Map`;

    const mapFilters: Record<string, unknown> = {
      map_tier: { min: mapTier, max: mapTier }
    };
    const filters: Record<string, unknown> = {
      type_filters: {
        filters: {
          category: { option: 'map' }
        }
      },
      map_filters: {
        filters: mapFilters
      }
    };
    if (is8Mod) {
      filters.misc_filters = {
        filters: {
          corrupted: { option: 'true' }
        }
      };
    }
    const query = {
      status: { option: 'online' },
      filters
    };
    const safeLeague = encodeURIComponent(league || 'Settlers');
    const qStr = encodeURIComponent(JSON.stringify({ query }));
    tradeSearchUrl = `https://www.pathofexile.com/trade/search/${safeLeague}?q=${qStr}`;
  } else if (!isCraft && cleanEnglish) {
    cleanChinese = cleanChinese.replace(/^T\d+\s+/i, '').trim();
    cleanEnglish = cleanEnglish.replace(/^T\d+\s+/i, '').trim();
    if (!cleanEnglish) {
      const pMatch = item.name.match(/\((.*?)\)/);
      cleanEnglish = pMatch ? pMatch[1].trim() : cleanChinese;
    }
    const query = {
      status: { option: 'online' },
      type: cleanEnglish
    };
    const safeLeague = encodeURIComponent(league || 'Settlers');
    const qStr = encodeURIComponent(JSON.stringify({ query }));
    tradeSearchUrl = `https://www.pathofexile.com/trade/search/${safeLeague}?q=${qStr}`;
  }

  return {
    cleanChineseName: cleanChinese,
    cleanEnglishName: cleanEnglish,
    tier,
    isCraft,
    tradeSearchUrl
  };
}

const CATEGORY_SECTION_TITLES: Record<string, string> = {
  scarab: '🪲 【聖甲蟲配置 (Scarabs)】',
  map_craft: '🗺️ 【地圖基底與工藝 (Maps & Device Crafts)】',
  consumable: '💎 【通貨、瞻妄玉與碎片 (Currency & Fragments)】',
  other: '📦 【其他備用耗材 (Other Items)】'
};

function categorizeItem(item: BatchItemRequirement): 'scarab' | 'map_craft' | 'consumable' | 'other' {
  if (item.category === 'scarab') return 'scarab';
  if (item.category === 'map' || item.category === 'craft') return 'map_craft';
  if (item.category === 'currency' || item.category === 'delirium' || item.category === 'fragment') {
    return 'consumable';
  }
  return 'other';
}

function formatItemLine(item: BatchItemRequirement): string {
  const meta = resolveItemTradeMeta(item);
  const isMap = item.category === 'map';
  const tierStr = (!isMap && meta.tier) ? ` (T${meta.tier})` : '';
  const enStr = meta.cleanEnglishName && meta.cleanEnglishName !== meta.cleanChineseName
    ? ` (${meta.cleanEnglishName})`
    : '';
  const displayName = `${meta.cleanChineseName}${tierStr}${enStr}`;
  const craftNote = meta.isCraft ? ' ※地圖儀工藝' : '';
  const divCost = item.totalCostDivine > 0 ? ` / ~${item.totalCostDivine} Div` : '';
  return `  - ${displayName} x ${item.totalCount} (單價 ~${item.unitPriceChaos}c | 總計 ${item.totalCostChaos}c${divCost})${craftNote}`;
}

export function generateTradeKeywordsText(summary: AtlasCalculationSummary): string {
  const tradableItems = summary.batchItems.filter(i => i.category !== 'craft' && !i.name.includes('工藝'));
  if (tradableItems.length === 0) return '  (無可於市集交易之物料)';

  const lines: string[] = [];
  lines.push('【市集精確搜尋關鍵字 (Trade Search Keywords)】');
  lines.push('');
  lines.push('[中文市集精確搜尋名稱]');
  tradableItems.forEach(item => {
    const meta = resolveItemTradeMeta(item);
    const isMap = item.category === 'map';
    const tierStr = (!isMap && meta.tier) ? ` (T${meta.tier})` : '';
    lines.push(`  • ${meta.cleanChineseName}${tierStr} x ${item.totalCount}`);
  });

  lines.push('');
  lines.push('[國際服 / 大宗市集英文名稱 (Bulk Exchange)]');
  tradableItems.forEach(item => {
    const meta = resolveItemTradeMeta(item);
    const isMap = item.category === 'map';
    const tierStr = (!isMap && meta.tier) ? ` (T${meta.tier})` : '';
    lines.push(`  • ${meta.cleanEnglishName}${tierStr} x ${item.totalCount}`);
  });

  return lines.join('\n');
}

export function formatItemAsPoeClipboard(item: BatchItemRequirement, lang: 'zh' | 'en' = 'zh'): string {
  const meta = resolveItemTradeMeta(item);
  if (meta.isCraft) {
    return lang === 'zh'
      ? `物品種類: 地圖儀工藝\n稀有度: 普通\n${meta.cleanChineseName}\n--------`
      : `Item Class: Map Device Crafts\nRarity: Normal\n${meta.cleanEnglishName}\n--------`;
  }
  if (item.category === 'scarab') {
    return lang === 'zh'
      ? `物品種類: 聖甲蟲\n稀有度: 通貨\n${meta.cleanChineseName}\n--------\n堆疊數量: ${item.totalCount}\n--------`
      : `Item Class: Scarabs\nRarity: Currency\n${meta.cleanEnglishName}\n--------\nStack Size: ${item.totalCount}\n--------`;
  }
  if (item.category === 'map' || item.name.includes('地圖')) {
    const tier = meta.tier || 16;
    const ilvl = tier >= 16 ? 83 : 70 + tier;
    const is8Mod = item.name.includes('8詞') || (item.nameEn && item.nameEn.includes('8-Mod'));
    const corruptedSection = is8Mod ? '\n已污染\n--------' : '';
    const rarity = is8Mod ? '稀有' : '普通';
    const enRarity = is8Mod ? 'Rare' : 'Normal';
    const enCorruptedSection = is8Mod ? '\nCorrupted\n--------' : '';
    return lang === 'zh'
      ? `物品種類: 地圖\n稀有度: ${rarity}\n地圖\n--------\n地圖階級: ${tier}\n--------\n物品等級: ${ilvl}\n--------${corruptedSection}`
      : `Item Class: Maps\nRarity: ${enRarity}\nMap\n--------\nMap Tier: ${tier}\n--------\nItem Level: ${ilvl}\n--------${enCorruptedSection}`;
  }
  if (item.category === 'delirium') {
    return lang === 'zh'
      ? `物品種類: 瞻妄玉\n稀有度: 通貨\n${meta.cleanChineseName}\n--------\n堆疊數量: ${item.totalCount}\n--------`
      : `Item Class: Delirium Orbs\nRarity: Currency\n${meta.cleanEnglishName}\n--------\nStack Size: ${item.totalCount}\n--------`;
  }
  const isFrag = item.category === 'fragment';
  const zhClass = isFrag ? '地圖碎片' : '堆疊通貨';
  const enClass = isFrag ? 'Map Fragments' : 'Stackable Currency';
  return lang === 'zh'
    ? `物品種類: ${zhClass}\n稀有度: 通貨\n${meta.cleanChineseName}\n--------\n堆疊數量: ${item.totalCount}\n--------`
    : `Item Class: ${enClass}\nRarity: Currency\n${meta.cleanEnglishName}\n--------\nStack Size: ${item.totalCount}\n--------`;
}

export function generatePoeItemFormatListText(summary: AtlasCalculationSummary, lang: 'zh' | 'en' = 'zh'): string {
  const tradable = summary.batchItems.filter(i => i.category !== 'craft' && !i.name.includes('工藝'));
  if (tradable.length === 0) return '  (無可查詢物料)';
  return tradable.map(item => formatItemAsPoeClipboard(item, lang)).join('\n\n');
}

export function generateShoppingListText(
  strategyName: string,
  tierName: string,
  summary: AtlasCalculationSummary
): string {
  const lines: string[] = [];
  lines.push('📋 【POE 1 刷圖備料清單】');
  lines.push(`策略：${strategyName} - 分級：${tierName}`);
  lines.push(`批次目標：${summary.batchSize} 場地圖`);
  lines.push(`預估總成本：${summary.batchTotalCostChaos} Chaos (~ ${summary.batchTotalCostDivine} Divine)`);
  lines.push(`預估總利潤：${summary.batchTotalProfitChaos} Chaos (~ ${summary.batchTotalProfitDivine} Divine)`);
  lines.push('----------------------------------------');
  lines.push('【所需物料採購明細 (總覽與單價)】');

  if (summary.batchItems.length === 0) {
    lines.push('  (目前無配置聖甲蟲或額外物料)');
  } else {
    const grouped: Record<string, BatchItemRequirement[]> = { scarab: [], map_craft: [], consumable: [], other: [] };
    summary.batchItems.forEach(item => grouped[categorizeItem(item)].push(item));

    Object.keys(grouped).forEach(sectionKey => {
      const items = grouped[sectionKey];
      if (items.length > 0) {
        lines.push(CATEGORY_SECTION_TITLES[sectionKey] || '📦 【其他項目】');
        items.forEach(item => lines.push(formatItemLine(item)));
      }
    });

    lines.push('----------------------------------------');
    lines.push(generateTradeKeywordsText(summary));
    lines.push('----------------------------------------');
    lines.push('【裝備查詢格式清單 (PoE Item Format - 可直接貼上查價)】');
    lines.push(generatePoeItemFormatListText(summary, 'zh'));
  }

  lines.push('----------------------------------------');
  lines.push('產出自 POE_tool 輿圖天賦策略規劃器');
  return lines.join('\n');
}
