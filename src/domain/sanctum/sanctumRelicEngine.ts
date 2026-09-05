import type {
  SanctumRelic,
  SanctumFloor,
  SanctumRoomType,
  SanctumPlaystyle,
  RoomEVEstimate,
  SanctumStrategyConfig,
  SanctumForecastResult
} from './types';
import { ROOM_BASE_METRICS } from './sanctumData';

export function aggregateRelicStats(relics: SanctumRelic[]): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const r of relics) {
    for (const a of r.affixes) {
      stats[a.statKey] = (stats[a.statKey] || 0) + a.value;
    }
  }
  return stats;
}

export function estimateRoomEV(
  roomType: SanctumRoomType,
  floor: SanctumFloor,
  stats: Record<string, number>
): RoomEVEstimate {
  const base = ROOM_BASE_METRICS[roomType];
  const baseRiskScore = base.baseRisk * floor;
  const mitigation = Math.min(60, stats['resolveMitigation'] || 0);
  const adjustedRiskScore = Math.max(0, Math.round(baseRiskScore * (1 - mitigation / 100)));

  let expectedChaos = base.baseChaos * floor;
  if (roomType === 'merchant') {
    expectedChaos += (stats['merchantDiscount'] || 0) * 0.5 * floor;
  }

  let expectedDivine = Number((base.baseDivine * floor).toFixed(2));
  if (roomType === 'boss') {
    const extraDivine = (stats['additionalDivineDrop'] || 0) * (floor / 4);
    expectedDivine = Number((expectedDivine + extraDivine).toFixed(2));
  }

  return { roomType, floor, baseRiskScore, adjustedRiskScore, expectedChaos, expectedDivine };
}

function calculateSurvivalRate(stats: Record<string, number>, playstyle: SanctumPlaystyle): number {
  let rate = 65;
  rate += (stats['resolveMitigation'] || 0) * 0.6;
  rate += Math.min(15, (stats['maxResolve'] || 0) * 0.1);
  if (playstyle === 'safe_clear') rate += 10;
  if (playstyle === 'high_yield') rate -= 10;
  return Math.min(98, Math.max(15, Math.round(rate)));
}

function computeRecommendedPath(playstyle: SanctumPlaystyle): string[] {
  if (playstyle === 'high_yield') {
    return ['寶藏房 (Treasure)', '商人房 (Merchant)', '戰鬥房間 (Combat)', '神龕泉水 (Fountain)'];
  }
  if (playstyle === 'safe_clear') {
    return ['神龕泉水 (Fountain)', '商人房 (Merchant)', '寶藏房 (Treasure)', '戰鬥房間 (Combat)'];
  }
  return ['商人房 (Merchant)', '神龕泉水 (Fountain)', '寶藏房 (Treasure)', '戰鬥房間 (Combat)'];
}

function buildStrategicNotes(stats: Record<string, number>, playstyle: SanctumPlaystyle, survivalRate: number): string[] {
  const notes: string[] = [];
  if (survivalRate >= 80) {
    notes.push('🛡️ 生存信心極高，建議積極選擇商人與寶藏房獲取神聖石最大化利潤。');
  } else if (survivalRate < 60) {
    notes.push('⚠️ 決心耗損風險偏高，建議在第 2~3 層優先尋找神龕泉水回復決心與激勵。');
  }
  if ((stats['additionalDivineDrop'] || 0) > 0) {
    notes.push(`✨ 當前裝備額外神聖石聖物 (+${stats['additionalDivineDrop']} Div)，請全力挺進並擊敗第 4 層最終頭目。`);
  }
  if (playstyle === 'high_yield' && (stats['resolveMitigation'] || 0) < 20) {
    notes.push('💡 高收益模式下建議補足至少 20% 決心減免聖物以防連續失誤暴斃。');
  }
  return notes;
}

export function forecastSanctumRun(config: SanctumStrategyConfig): SanctumForecastResult {
  const stats = aggregateRelicStats(config.relics);
  const survivalRatePct = calculateSurvivalRate(stats, config.preferredPlaystyle);
  const roomTypes: SanctumRoomType[] = ['combat', 'merchant', 'fountain', 'treasure', 'boss'];

  const roomEstimates: RoomEVEstimate[] = [];
  let totalChaos = 0;
  let totalDivine = 0;

  for (let f = 1; f <= 4; f++) {
    const floor = f as SanctumFloor;
    for (const rt of roomTypes) {
      const est = estimateRoomEV(rt, floor, stats);
      roomEstimates.push(est);
      totalChaos += est.expectedChaos * 0.4;
      totalDivine += est.expectedDivine * 0.3;
    }
  }

  const successFactor = survivalRatePct / 100;
  return {
    aggregatedStats: stats,
    survivalRatePct,
    expectedTotalNetChaos: Math.round(totalChaos * successFactor),
    expectedTotalNetDivine: Number((totalDivine * successFactor).toFixed(1)),
    roomEstimates,
    recommendedPath: computeRecommendedPath(config.preferredPlaystyle),
    strategicNotes: buildStrategicNotes(stats, config.preferredPlaystyle, survivalRatePct)
  };
}
