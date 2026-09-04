import type { AtlasCalculationSummary, BatchItemRequirement } from './types';
import { resolveItemTradeMeta, type ItemTradeMeta } from './atlasTradeMeta';

export { resolveItemTradeMeta, type ItemTradeMeta };

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

  const lines: string[] = [
    '【市集精確搜尋關鍵字 (Trade Search Keywords)】',
    '',
    '[中文市集精確搜尋名稱]'
  ];
  tradableItems.forEach(item => {
    const meta = resolveItemTradeMeta(item);
    const isMap = item.category === 'map';
    const tierStr = (!isMap && meta.tier) ? ` (T${meta.tier})` : '';
    lines.push(`  • ${meta.cleanChineseName}${tierStr} x ${item.totalCount}`);
  });

  lines.push('', '[國際服 / 大宗市集英文名稱 (Bulk Exchange)]');
  tradableItems.forEach(item => {
    const meta = resolveItemTradeMeta(item);
    const isMap = item.category === 'map';
    const tierStr = (!isMap && meta.tier) ? ` (T${meta.tier})` : '';
    lines.push(`  • ${meta.cleanEnglishName}${tierStr} x ${item.totalCount}`);
  });

  return lines.join('\n');
}

function formatCraftClipboard(meta: ItemTradeMeta, lang: 'zh' | 'en'): string {
  return lang === 'zh'
    ? `物品種類: 地圖儀工藝\n稀有度: 普通\n${meta.cleanChineseName}\n--------`
    : `Item Class: Map Device Crafts\nRarity: Normal\n${meta.cleanEnglishName}\n--------`;
}

function formatScarabClipboard(meta: ItemTradeMeta, totalCount: number, lang: 'zh' | 'en'): string {
  return lang === 'zh'
    ? `物品種類: 聖甲蟲\n稀有度: 通貨\n${meta.cleanChineseName}\n--------\n堆疊數量: ${totalCount}\n--------`
    : `Item Class: Scarabs\nRarity: Currency\n${meta.cleanEnglishName}\n--------\nStack Size: ${totalCount}\n--------`;
}

function formatMapClipboard(item: BatchItemRequirement, meta: ItemTradeMeta, lang: 'zh' | 'en'): string {
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

function formatStackableClipboard(item: BatchItemRequirement, meta: ItemTradeMeta, lang: 'zh' | 'en'): string {
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

export function formatItemAsPoeClipboard(item: BatchItemRequirement, lang: 'zh' | 'en' = 'zh'): string {
  const meta = resolveItemTradeMeta(item);
  if (meta.isCraft) return formatCraftClipboard(meta, lang);
  if (item.category === 'scarab') return formatScarabClipboard(meta, item.totalCount, lang);
  if (item.category === 'map' || item.name.includes('地圖')) return formatMapClipboard(item, meta, lang);
  return formatStackableClipboard(item, meta, lang);
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
  const lines: string[] = [
    '📋 【POE 1 刷圖備料清單】',
    `策略：${strategyName} - 分級：${tierName}`,
    `批次目標：${summary.batchSize} 場地圖`,
    `預估總成本：${summary.batchTotalCostChaos} Chaos (~ ${summary.batchTotalCostDivine} Divine)`,
    `預估總利潤：${summary.batchTotalProfitChaos} Chaos (~ ${summary.batchTotalProfitDivine} Divine)`,
    '----------------------------------------',
    '【所需物料採購明細 (總覽與單價)】'
  ];

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

  lines.push('----------------------------------------', '產出自 POE_tool 輿圖天賦策略規劃器');
  return lines.join('\n');
}
