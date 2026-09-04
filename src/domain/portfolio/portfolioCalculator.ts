import type { StashItem, StashItemCategory, WealthSnapshot } from '../wealth/types';
import type { CategoryAllocation, NetWorthPoint, PortfolioAnalysisResult } from './types';
import { CATEGORY_META } from './types';

export function calculateCategoryAllocations(items: StashItem[], divineRate: number): CategoryAllocation[] {
  if (!items || items.length === 0) return [];

  const grouped = new Map<StashItemCategory, { totalChaos: number; items: StashItem[] }>();

  items.forEach(item => {
    const cat = item.category || 'Currency';
    const entry = grouped.get(cat) || { totalChaos: 0, items: [] };
    entry.totalChaos += item.totalPriceChaos || 0;
    entry.items.push(item);
    grouped.set(cat, entry);
  });

  const totalPortfolioChaos = Array.from(grouped.values()).reduce((sum, g) => sum + g.totalChaos, 0);
  if (totalPortfolioChaos <= 0) return [];

  const result: CategoryAllocation[] = [];
  grouped.forEach((data, category) => {
    const meta = CATEGORY_META[category] || { label: category, color: '#94a3b8' };
    const percentage = Math.round((data.totalChaos / totalPortfolioChaos) * 1000) / 10;
    const totalDivine = Math.round((data.totalChaos / (divineRate || 150)) * 10) / 10;
    const sortedItems = [...data.items].sort((a, b) => (b.totalPriceChaos || 0) - (a.totalPriceChaos || 0));

    result.push({
      category,
      label: meta.label,
      totalChaos: Math.round(data.totalChaos),
      totalDivine,
      percentage,
      itemCount: data.items.length,
      topItems: sortedItems.slice(0, 10),
      color: meta.color
    });
  });

  return result.sort((a, b) => b.totalChaos - a.totalChaos);
}

export function calculateNetWorthTimeline(snapshots: WealthSnapshot[]): NetWorthPoint[] {
  return (snapshots || []).map(snap => {
    const d = new Date(snap.timestamp);
    const dateLabel = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return {
      timestamp: snap.timestamp,
      dateLabel,
      totalChaos: snap.totalChaos,
      totalDivine: snap.totalDivine,
      isLeapPoint: false
    };
  });
}

export function detectWealthLeapPoints(points: NetWorthPoint[], thresholdPercent: number = 20.0): NetWorthPoint[] {
  return points.map((p, idx) => {
    if (idx === 0) return p;
    const prev = points[idx - 1];
    if (prev.totalChaos <= 0) return p;

    const changePct = ((p.totalChaos - prev.totalChaos) / prev.totalChaos) * 100;
    const diffDivine = p.totalDivine - prev.totalDivine;

    if (changePct >= thresholdPercent && diffDivine >= 5) {
      return {
        ...p,
        isLeapPoint: true,
        leapNote: `🚀 淨值大幅飛躍：+${diffDivine.toFixed(1)}D (+${Math.round(changePct)}%)`
      };
    }
    return p;
  });
}

export function generateDonutChartPaths(
  categories: CategoryAllocation[],
  radius: number,
  innerRadius: number
): Array<{ path: string; category: CategoryAllocation }> {
  if (!categories || categories.length === 0) return [];

  let startAngle = 0;
  return categories.map(cat => {
    const rawAngle = (cat.percentage / 100) * (2 * Math.PI);
    const angle = Math.min(rawAngle, 2 * Math.PI - 0.001);
    const endAngle = startAngle + angle;

    const x1 = radius + radius * Math.sin(startAngle);
    const y1 = radius - radius * Math.cos(startAngle);
    const x2 = radius + radius * Math.sin(endAngle);
    const y2 = radius - radius * Math.cos(endAngle);

    const ix1 = radius + innerRadius * Math.sin(endAngle);
    const iy1 = radius - innerRadius * Math.cos(endAngle);
    const ix2 = radius + innerRadius * Math.sin(startAngle);
    const iy2 = radius - innerRadius * Math.cos(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

    startAngle = endAngle;
    return { path: d, category: cat };
  });
}

export function exportPortfolioToMarkdown(analysis: PortfolioAnalysisResult, league: string): string {
  const lines: string[] = [
    `# 💼 POE_tool 玩家資產組合分析總結 (${league})`,
    `> 統計時間：${new Date().toLocaleString('zh-TW')} | 基準匯率：1D = ${analysis.divineRate}C`,
    '',
    `### 💰 總資產估值：${analysis.totalChaos.toLocaleString()} Chaos (~ ${analysis.totalDivine} Divine)`,
    '',
    '| 品類 | 總價值 (Chaos) | 總價值 (Divine) | 佔比 (%) | 項目數 | 頂級資產 |',
    '| :--- | :--- | :--- | :--- | :--- | :--- |'
  ];

  analysis.categories.forEach(c => {
    const topItemName = c.topItems[0]?.name || '-';
    lines.push(`| ${c.label} | ${c.totalChaos.toLocaleString()} C | ${c.totalDivine} D | ${c.percentage}% | ${c.itemCount} | ${topItemName} |`);
  });

  return lines.join('\n');
}

export function exportPortfolioToCSV(categories: CategoryAllocation[]): string {
  const rows = ['Category,ChaosValue,DivineValue,Percentage,ItemCount,TopItem'];
  categories.forEach(c => {
    const top = (c.topItems[0]?.name || '').replace(/,/g, ' ');
    rows.push(`${c.category},${c.totalChaos},${c.totalDivine},${c.percentage},${c.itemCount},"${top}"`);
  });
  return rows.join('\n');
}

export function exportPortfolioToDiscord(analysis: PortfolioAnalysisResult, league: string): string {
  const topCat = analysis.categories[0]?.label || '未分類';
  return [
    '```yaml',
    `【POE_tool 賽季資產結構報表 - ${league}】`,
    `總淨值估算: ${analysis.totalChaos.toLocaleString()} Chaos (${analysis.totalDivine} Divine)`,
    `主要資產類別: ${topCat} (${analysis.categories[0]?.percentage || 0}%)`,
    `資產類別數: ${analysis.categories.length} 大類`,
    '----------------------------------------',
    ...analysis.categories.map(c => `• ${c.category}: ${c.totalDivine}D (${c.percentage}%)`),
    '```'
  ].join('\n');
}
