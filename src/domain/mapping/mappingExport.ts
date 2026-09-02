import type { MappingSession, MappingSessionStats } from './types';

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m ${secs}s`;
  }
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

export function generateDiscordMappingReport(
  session: MappingSession,
  stats: MappingSessionStats
): string {
  const topDropsText = stats.topDrops
    .slice(0, 5)
    .map(
      (d, i) =>
        `${i + 1}. **${d.name}** x${d.deltaCount} ≈ ${d.totalPriceChaos}c (${d.totalPriceDivine} Div)`
    )
    .join('\n');

  const strategyLine = session.strategyName ? `🎯 輿圖策略: **${session.strategyName}**\n` : '';

  return (
    `⚔️ **Path of Exile 刷圖收益統計結算報表 (${session.league})**\n` +
    `📋 Session: **${session.name}**\n` +
    strategyLine +
    `🏁 總刷圖場次: **${stats.totalRuns} 場** | 平均每場耗時: **${formatDuration(stats.avgDurationSeconds)}**\n` +
    `⏱️ 累積純刷圖時間: **${formatDuration(stats.totalDurationSeconds)}**\n` +
    `💸 單場平均成本: **${stats.totalRuns > 0 ? (stats.totalCostChaos / stats.totalRuns).toFixed(1) : 0}c** | 總投入: **${stats.totalCostDivine} Div**\n` +
    `💎 累積淨利潤: **${stats.totalNetProfitDivine} Divine** (${stats.totalNetProfitChaos} Chaos)\n` +
    `⚡ 純刷圖淨時薪: **${stats.activeMappingDivPerHour} Div/hr** (${stats.activeMappingChaosPerHour} c/hr)\n` +
    `🕒 含整備總時薪: **${stats.sessionTotalDivPerHour} Div/hr**\n\n` +
    `🏆 **本次 Session 最具價值掉落物 Top 5：**\n` +
    `${topDropsText || '無顯著高價掉落紀錄'}\n\n` +
    `*由 POE_tool 自動產出*`
  );
}

export function exportMappingSessionCsv(
  session: MappingSession,
  _stats: MappingSessionStats,
  onShowToast: (msg: string) => void
): void {
  if (session.runs.length === 0) {
    onShowToast('目前尚無已完成的刷圖場次資料可匯出');
    return;
  }

  const headers = [
    '場次 (Run #)',
    '耗時 (秒)',
    '耗時格式化',
    '地圖成本 (Chaos)',
    '聖甲蟲成本 (Chaos)',
    '工藝成本 (Chaos)',
    '雜項成本 (Chaos)',
    '總門票成本 (Chaos)',
    '總毛收入 (Chaos)',
    '總毛收入 (Divine)',
    '淨利潤 (Chaos)',
    '淨利潤 (Divine)',
    '掉落物清單明細',
    '完成時間'
  ];

  const rows = session.runs.map(run => {
    const dropsSummary = run.drops
      .map(d => `${d.name} x${d.deltaCount} (${d.totalPriceChaos}c)`)
      .join('; ');

    return [
      run.runNumber,
      run.durationSeconds,
      `"${formatDuration(run.durationSeconds)}"`,
      run.investment.mapCostChaos,
      run.investment.scarabsCostChaos,
      run.investment.craftCostChaos,
      run.investment.otherCostChaos,
      run.investment.totalCostChaos,
      run.grossRevenueChaos,
      run.grossRevenueDivine,
      run.netProfitChaos,
      run.netProfitDivine,
      `"${dropsSummary.replace(/"/g, '""')}"`,
      `"${new Date(run.endTime).toLocaleString()}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `poe_mapping_session_${session.name.replace(/\s+/g, '_')}_${Date.now()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  onShowToast(`已成功匯出「${session.name}」刷圖歷程 CSV 報表！`);
}
