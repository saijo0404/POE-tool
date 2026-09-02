import type { WealthSnapshot } from '../types/poe';

export function getPricingBasisLabel(bulkMultiplier: number = 1.0): string {
  if (bulkMultiplier >= 1.4) return `頂配大宗 (${bulkMultiplier}x 溢價)`;
  if (bulkMultiplier > 1.0) return `大宗批發 (${bulkMultiplier}x 溢價)`;
  return '零售估值 (1.0x)';
}

export function exportWealthHistoryCsv(
  snapshots: WealthSnapshot[],
  league: string,
  onShowToast: (msg: string) => void,
  bulkMultiplier: number = 1.0
) {
  if (snapshots.length === 0) {
    onShowToast('目前尚無快照資料可匯出');
    return;
  }
  const pricingBasis = getPricingBasisLabel(bulkMultiplier);
  const headers = [
    '時間 (Timestamp)',
    '聯盟 (League)',
    '計價基準 (Pricing Basis)',
    '總價值 (Chaos)',
    '總價值 (Divine)',
    'Divine 匯率',
    '時薪變化 (Chaos/hr)',
    '時薪變化 (Divine/hr)'
  ];
  const rows = snapshots.map(s => {
    const multiplier = bulkMultiplier > 0 ? bulkMultiplier : 1.0;
    const scaledChaos = Math.round(s.totalChaos * multiplier * 100) / 100;
    const scaledDivine = Math.round((scaledChaos / (s.chaosRate || 150)) * 100) / 100;
    return [
      `"${new Date(s.timestamp).toLocaleString()}"`,
      `"${s.league}"`,
      `"${pricingBasis}"`,
      scaledChaos,
      scaledDivine,
      s.chaosRate,
      s.hourlyChangeChaos || 0,
      s.hourlyChangeDivine || 0
    ];
  });
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `poe_wealth_history_${league || 'settlers'}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  onShowToast(`已成功匯出資產歷程 CSV 報表 (${pricingBasis})！`);
}

export function copyDiscordWealthSummary(
  latestSnapshot: WealthSnapshot | null,
  filteredTotalDivine: number,
  filteredTotalChaos: number,
  onShowToast: (msg: string) => void,
  bulkMultiplier: number = 1.0
) {
  if (!latestSnapshot) {
    onShowToast('目前尚無快照資料可複製');
    return;
  }
  const pricingBasis = getPricingBasisLabel(bulkMultiplier);
  const topItemsText = (latestSnapshot.topItems || [])
    .slice(0, 3)
    .map(
      (item, idx) =>
        `${idx + 1}. **${item.name || item.typeLine}** x${item.stackSize || 1} ≈ ${item.totalPriceChaos}c (${item.totalPriceDivine} Div)`
    )
    .join('\n');

  const text = `📊 **Path of Exile 資產統計報表 (${latestSnapshot.league})**\n🏷️ 計價基準: **${pricingBasis}**\n💰 總淨資產: **${filteredTotalDivine} Divine** (${filteredTotalChaos} Chaos)\n⚡ 時薪增長率: **${(latestSnapshot.hourlyChangeDivine || 0) >= 0 ? '+' : ''}${latestSnapshot.hourlyChangeDivine ?? 0} div/hr**\n📅 快照時間: ${new Date(latestSnapshot.timestamp).toLocaleString()}\n\n🏆 **前三大高價物品：**\n${topItemsText || '無'}\n\n*由 POE_tool 自動產出*`;

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  onShowToast(`已複製 Discord 格式資產摘要 (${pricingBasis})！可直接在聊天室貼上分享`);
}

