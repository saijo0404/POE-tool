import type { MappingSession, MapRun } from './types';

export interface MappingHistoryFilter {
  league?: string;
  timeRange?: 'all' | 'today' | '7days' | '30days';
  strategyName?: string;
}

export interface MapRunRankingItem {
  runId: string;
  runNumber: number;
  sessionName: string;
  strategyName?: string;
  durationSeconds: number;
  netProfitChaos: number;
  netProfitDivine: number;
}

export interface StrategyPerformance {
  strategyName: string;
  runCount: number;
  totalDurationSeconds: number;
  totalNetProfitChaos: number;
  totalNetProfitDivine: number;
  divinePerHour: number;
}

export interface MappingHistoryAnalytics {
  totalSessions: number;
  totalRuns: number;
  totalDurationSeconds: number;
  formattedTotalDuration: string;
  avgRunDurationSeconds: number;
  formattedAvgRunDuration: string;
  totalNetProfitChaos: number;
  totalNetProfitDivine: number;
  overallDivPerHour: number;
  overallChaosPerHour: number;
  avgProfitPerRunChaos: number;
  avgProfitPerRunDivine: number;
  topRuns: MapRunRankingItem[];
  lowestRun?: MapRunRankingItem;
  strategyBreakdown: StrategyPerformance[];
}

export function formatDurationZh(seconds: number): string {
  const sec = Math.max(0, Math.round(seconds));
  if (sec < 60) return `${sec} 秒`;
  if (sec < 3600) {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return remainder > 0 ? `${mins} 分 ${remainder} 秒` : `${mins} 分鐘`;
  }
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  return mins > 0 ? `${hours} 小時 ${mins} 分` : `${hours} 小時`;
}

function getTimeRangeThreshold(range?: MappingHistoryFilter['timeRange']): number {
  if (!range || range === 'all') return 0;
  const now = new Date();
  if (range === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  const days = range === '7days' ? 7 : 30;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export function filterMappingSessions(
  sessions: MappingSession[],
  filter?: MappingHistoryFilter
): MappingSession[] {
  if (!filter) return sessions;
  const threshold = getTimeRangeThreshold(filter.timeRange);

  return sessions
    .filter(s => {
      if (filter.league && s.league !== filter.league) return false;
      if (filter.strategyName && s.strategyName !== filter.strategyName) return false;
      return true;
    })
    .map(s => ({
      ...s,
      runs: s.runs.filter(r => (threshold > 0 ? r.startTime >= threshold : true))
    }));
}

type RunPair = { run: MapRun; session: MappingSession };

function collectRunPairs(sessions: MappingSession[]): RunPair[] {
  const pairs: RunPair[] = [];
  for (const session of sessions) {
    for (const run of session.runs) {
      pairs.push({ run, session });
    }
  }
  return pairs;
}

function buildStrategyBreakdown(pairs: RunPair[], rate: number): StrategyPerformance[] {
  const map = new Map<string, { count: number; duration: number; chaos: number }>();
  for (const { run, session } of pairs) {
    const strat = session.strategyName || '未指定策略';
    const entry = map.get(strat) || { count: 0, duration: 0, chaos: 0 };
    entry.count += 1;
    entry.duration += run.durationSeconds;
    entry.chaos += run.netProfitChaos;
    map.set(strat, entry);
  }

  return Array.from(map.entries()).map(([strategyName, data]) => {
    const totalNetProfitChaos = Math.round(data.chaos * 100) / 100;
    const totalNetProfitDivine = Math.round((totalNetProfitChaos / rate) * 100) / 100;
    const hours = data.duration / 3600;
    const divinePerHour = hours > 0 ? Math.round((totalNetProfitDivine / hours) * 100) / 100 : 0;
    return {
      strategyName,
      runCount: data.count,
      totalDurationSeconds: data.duration,
      totalNetProfitChaos,
      totalNetProfitDivine,
      divinePerHour
    };
  }).sort((a, b) => b.totalNetProfitDivine - a.totalNetProfitDivine);
}

function computeMacroTotals(pairs: RunPair[], rate: number) {
  const totalRuns = pairs.length;
  const totalDurationSeconds = pairs.reduce((sum, p) => sum + p.run.durationSeconds, 0);
  const avgRunDurationSeconds = totalRuns > 0 ? Math.round(totalDurationSeconds / totalRuns) : 0;
  const totalNetProfitChaos = Math.round(pairs.reduce((sum, p) => sum + p.run.netProfitChaos, 0) * 100) / 100;
  const totalNetProfitDivine = Math.round((totalNetProfitChaos / rate) * 100) / 100;
  const totalHours = totalDurationSeconds / 3600;

  return {
    totalRuns,
    totalDurationSeconds,
    avgRunDurationSeconds,
    totalNetProfitChaos,
    totalNetProfitDivine,
    overallDivPerHour: totalHours > 0 ? Math.round((totalNetProfitDivine / totalHours) * 100) / 100 : 0,
    overallChaosPerHour: totalHours > 0 ? Math.round((totalNetProfitChaos / totalHours) * 100) / 100 : 0,
    avgProfitPerRunChaos: totalRuns > 0 ? Math.round((totalNetProfitChaos / totalRuns) * 100) / 100 : 0,
    avgProfitPerRunDivine: totalRuns > 0 ? Math.round((totalNetProfitDivine / totalRuns) * 100) / 100 : 0
  };
}

function computeRunRankings(pairs: RunPair[]) {
  const sorted = [...pairs].sort((a, b) => b.run.netProfitChaos - a.run.netProfitChaos);
  const toItem = (p: RunPair): MapRunRankingItem => ({
    runId: p.run.id,
    runNumber: p.run.runNumber,
    sessionName: p.session.name,
    strategyName: p.session.strategyName,
    durationSeconds: p.run.durationSeconds,
    netProfitChaos: p.run.netProfitChaos,
    netProfitDivine: p.run.netProfitDivine
  });

  return {
    topRuns: sorted.slice(0, 3).map(toItem),
    lowestRun: sorted.length > 0 ? toItem(sorted[sorted.length - 1]) : undefined
  };
}

export function analyzeMappingHistory(
  sessions: MappingSession[],
  filter?: MappingHistoryFilter,
  divRate: number = 150
): MappingHistoryAnalytics {
  const rate = divRate > 0 ? divRate : 150;
  const filtered = filterMappingSessions(sessions, filter);
  const pairs = collectRunPairs(filtered);
  const totals = computeMacroTotals(pairs, rate);
  const rankings = computeRunRankings(pairs);

  return {
    totalSessions: filtered.length,
    ...totals,
    formattedTotalDuration: formatDurationZh(totals.totalDurationSeconds),
    formattedAvgRunDuration: formatDurationZh(totals.avgRunDurationSeconds),
    topRuns: rankings.topRuns,
    lowestRun: rankings.lowestRun,
    strategyBreakdown: buildStrategyBreakdown(pairs, rate)
  };
}
