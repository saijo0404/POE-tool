import type {
  ActiveModSelection,
  PlayerWeaknessConfig,
  UltimatumEvAnalysis,
  UltimatumRecommendation,
  RoundProjection,
  UltimatumMod
} from './types';
import { ULTIMATUM_ROUND_BASE_REWARDS, getModById } from './ultimatumMods';

export interface UltimatumEvInput {
  currentRound: number; // 1 to 10
  accumulatedRewardChaos: number;
  activeMods: ActiveModSelection[];
  playerWeaknesses: PlayerWeaknessConfig;
  characterPowerScore?: number; // 1 to 100, default 75
}

function getTierMultiplier(tier: 1 | 2 | 3): number {
  if (tier === 3) return 2.4;
  if (tier === 2) return 1.6;
  return 1.0;
}

function checkConflict(mod: UltimatumMod, cfg: PlayerWeaknessConfig): string | null {
  if (cfg.noLifeRecovery && mod.tags.includes('recovery')) return '缺乏生命回復/吸血能力';
  if (cfg.lowChaosRes && mod.tags.includes('chaos_res')) return '低混沌抗性';
  if (cfg.slowMovement && mod.tags.includes('movement')) return '低機動性/位移緩慢';
  if (cfg.noBleedImmunity && mod.tags.includes('bleed')) return '無流血與腐血免疫';
  if (cfg.lowPhysMitigation && mod.tags.includes('phys')) return '低物理傷害減免';
  if (cfg.reliantOnFlasks && mod.tags.includes('flask')) return '過度依賴藥劑回復';
  if (cfg.reliantOnCooldowns && mod.tags.includes('cooldown')) return '依賴技能冷卻回復';
  return null;
}

function calculateModRisks(mods: ActiveModSelection[], cfg: PlayerWeaknessConfig) {
  let totalRisk = 0;
  const warnings: string[] = [];
  for (const m of mods) {
    const def = getModById(m.modId);
    if (!def) continue;
    const tierMult = getTierMultiplier(m.tier);
    const conflict = checkConflict(def, cfg);
    if (conflict) {
      totalRisk += def.baseRisk * tierMult * 2.2;
      warnings.push(`⚠️ 致命衝突：【${def.nameZh}】嚴重克制弱點（${conflict}）！`);
    } else {
      totalRisk += def.baseRisk * tierMult;
    }
  }
  return { totalRisk: Math.round(totalRisk * 10) / 10, warnings };
}

function calculateSuccessProb(round: number, riskScore: number, powerScore: number): number {
  const normPower = Math.min(100, Math.max(20, powerScore));
  const baseProb = 0.75 + (normPower / 100) * 0.23;
  const roundPenalty = (round - 1) * 0.025;
  const riskPenalty = riskScore * 0.009;
  const rawProb = baseProb - roundPenalty - riskPenalty;
  return Math.round(Math.min(0.98, Math.max(0.08, rawProb)) * 100) / 100;
}

function determineRecommendation(
  ev: number,
  prob: number,
  accumulated: number
): { rec: UltimatumRecommendation; text: string } {
  if (prob >= 0.75 && (ev > 0 || accumulated < 30)) {
    return { rec: 'STRONG_CONTINUE', text: '期望回報豐厚且成功率高，強烈建議挺進下一輪！' };
  }
  if (prob >= 0.55 && ev > 0) {
    return { rec: 'CAUTIOUS_CONTINUE', text: '期望值為正但風險遞增，請注意走位並謹慎挑戰。' };
  }
  return { rec: 'TAKE_PROFIT', text: '期望值偏低或累積獎勵過高，強烈建議見好就收，鎖定利潤！' };
}

function buildProjection(riskScore: number, powerScore: number): RoundProjection[] {
  const list: RoundProjection[] = [];
  let cumulativeProb = 1.0;
  let cumulativeReward = 0;

  for (let r = 1; r <= 10; r++) {
    const roundReward = ULTIMATUM_ROUND_BASE_REWARDS[r] || 30;
    cumulativeReward += roundReward;
    const stepProb = calculateSuccessProb(r, riskScore, powerScore);
    cumulativeProb = Math.round(cumulativeProb * stepProb * 1000) / 1000;
    const expValue = Math.round(cumulativeProb * cumulativeReward);
    list.push({
      round: r,
      estimatedRewardChaos: roundReward,
      cumulativeRewardChaos: cumulativeReward,
      survivalProbability: Math.round(cumulativeProb * 100) / 100,
      expectedCumulativeValueChaos: expValue
    });
  }
  return list;
}

export function calculateUltimatumEv(input: UltimatumEvInput): UltimatumEvAnalysis {
  const power = input.characterPowerScore ?? 75;
  const { totalRisk, warnings } = calculateModRisks(input.activeMods, input.playerWeaknesses);
  const nextRound = Math.min(10, input.currentRound + 1);
  const nextReward = ULTIMATUM_ROUND_BASE_REWARDS[nextRound] || 50;

  const prob = calculateSuccessProb(nextRound, totalRisk, power);
  const ev = Math.round((prob * nextReward - (1 - prob) * input.accumulatedRewardChaos) * 10) / 10;
  const denom = prob * nextReward;
  const rr = denom > 0 ? Math.round((((1 - prob) * input.accumulatedRewardChaos) / denom) * 100) / 100 : 99;

  const { rec, text } = determineRecommendation(ev, prob, input.accumulatedRewardChaos);
  const projection = buildProjection(totalRisk, power);

  return {
    currentRound: input.currentRound,
    accumulatedRewardChaos: input.accumulatedRewardChaos,
    nextRoundRewardEstimateChaos: nextReward,
    nextRoundSuccessProbability: prob,
    totalModRiskScore: totalRisk,
    expectedNetGainChaos: ev,
    riskRewardRatio: rr,
    recommendation: rec,
    recommendationText: text,
    lethalWarnings: warnings,
    projection
  };
}
