import type { AtlasCalculationSummary, BatchItemRequirement } from './types';

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
  const hasParentheses = item.name.includes('(') && item.name.includes(')');
  const hasEnglish = item.nameEn && !item.name.includes(item.nameEn) && !hasParentheses;
  const displayName = hasEnglish ? `${item.name} (${item.nameEn})` : item.name;
  const divCost = item.totalCostDivine > 0 ? ` / ~${item.totalCostDivine} Div` : '';
  return `  - ${displayName} x ${item.totalCount} (單價 ~${item.unitPriceChaos}c | 總計 ${item.totalCostChaos}c${divCost})`;
}

function formatBulkTradeLine(item: BatchItemRequirement): string {
  const searchName = item.nameEn || item.name;
  return `  ${searchName} x ${item.totalCount}`;
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
  lines.push('【所需物料採購明細】');

  if (summary.batchItems.length === 0) {
    lines.push('  (目前無配置聖甲蟲或額外物料)');
  } else {
    // Group by category sections
    const grouped: Record<string, BatchItemRequirement[]> = {
      scarab: [],
      map_craft: [],
      consumable: [],
      other: []
    };

    summary.batchItems.forEach(item => {
      const sectionKey = categorizeItem(item);
      grouped[sectionKey].push(item);
    });

    Object.keys(grouped).forEach(sectionKey => {
      const items = grouped[sectionKey];
      if (items.length > 0) {
        lines.push(CATEGORY_SECTION_TITLES[sectionKey] || '📦 【其他項目】');
        items.forEach(item => lines.push(formatItemLine(item)));
      }
    });

    // Bulk trade list section
    lines.push('----------------------------------------');
    lines.push('【市集大宗採購快速清單 (Bulk Exchange Format)】');
    summary.batchItems.forEach(item => {
      lines.push(formatBulkTradeLine(item));
    });
  }

  lines.push('----------------------------------------');
  lines.push('產出自 POE_tool 輿圖天賦策略規劃器');
  return lines.join('\n');
}
