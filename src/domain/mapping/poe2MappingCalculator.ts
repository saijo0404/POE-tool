import type { MapRun, MappingSessionStats } from './types';

export function calculateGoldPerHour(totalGold: number, durationSeconds: number): number {
  if (durationSeconds <= 0 || totalGold <= 0) return 0;
  return Math.round((totalGold / durationSeconds) * 3600);
}

export function formatGold(amount: number): string {
  const safe = Math.max(0, Math.round(amount));
  if (safe >= 1_000_000) {
    return `${(safe / 1_000_000).toFixed(2)}M`;
  }
  if (safe >= 10_000) {
    return `${(safe / 1_000).toFixed(1)}k`;
  }
  return safe.toLocaleString();
}

export function formatGoldPerHour(rate: number): string {
  return `${formatGold(rate)} /hr`;
}

export function computePoe2SessionStats(
  runs: MapRun[],
  sessionDurationSeconds: number
): Pick<
  MappingSessionStats,
  | 'totalGoldEarned'
  | 'avgGoldPerRun'
  | 'activeMappingGoldPerHour'
  | 'sessionTotalGoldPerHour'
  | 'totalBossSlain'
  | 'bossSlainRate'
  | 'totalDeaths'
  | 'totalWaystonesFound'
  | 'totalRunesFound'
> {
  const totalRuns = runs.length;
  const totalGoldEarned = runs.reduce((sum, r) => sum + (r.goldEarned || 0), 0);
  const avgGoldPerRun = totalRuns > 0 ? Math.round(totalGoldEarned / totalRuns) : 0;

  const totalDurationSeconds = runs.reduce((sum, r) => sum + r.durationSeconds, 0);
  const activeHours = totalDurationSeconds / 3600;
  const sessionHours = Math.max(sessionDurationSeconds, totalDurationSeconds) / 3600;

  const activeMappingGoldPerHour =
    activeHours > 0 ? Math.round(totalGoldEarned / activeHours) : 0;
  const sessionTotalGoldPerHour =
    sessionHours > 0 ? Math.round(totalGoldEarned / sessionHours) : 0;

  const totalBossSlain = runs.filter(r => r.bossSlain === true).length;
  const bossSlainRate =
    totalRuns > 0 ? Math.round((totalBossSlain / totalRuns) * 100) : 0;

  const totalDeaths = runs.reduce((sum, r) => sum + (r.deathCount || 0), 0);
  const totalWaystonesFound = runs.reduce(
    (sum, r) => sum + (r.waystonesFound || 0),
    0
  );
  const totalRunesFound = runs.reduce((sum, r) => sum + (r.runesFound || 0), 0);

  return {
    totalGoldEarned,
    avgGoldPerRun,
    activeMappingGoldPerHour,
    sessionTotalGoldPerHour,
    totalBossSlain,
    bossSlainRate,
    totalDeaths,
    totalWaystonesFound,
    totalRunesFound
  };
}
