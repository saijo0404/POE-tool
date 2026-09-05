import type { DualWeaponLoadout } from './types';
import type {
  ScenarioType,
  ScenarioWeightConfig,
  ScenarioScoreReport,
  ScenarioGrade,
  ComboSynergyReport
} from './deltaTypes';
import { calculateAggregatedStats } from './weaponSetDeltaCalculator';

const DEFAULT_CLEARING_WEIGHTS: ScenarioWeightConfig = {
  dpsWeight: 0.25,
  speedWeight: 0.35,
  critWeight: 0.15,
  defenseWeight: 0.10,
  synergyWeight: 0.15
};

const DEFAULT_BOSSING_WEIGHTS: ScenarioWeightConfig = {
  dpsWeight: 0.40,
  speedWeight: 0.15,
  critWeight: 0.20,
  defenseWeight: 0.15,
  synergyWeight: 0.10
};

export function evaluateScenarioFit(
  loadout: DualWeaponLoadout,
  scenario: ScenarioType,
  comboReport?: ComboSynergyReport,
  customWeights?: Partial<ScenarioWeightConfig>
): ScenarioScoreReport {
  const baseWeights = scenario === 'clearing' ? DEFAULT_CLEARING_WEIGHTS : DEFAULT_BOSSING_WEIGHTS;
  const weights: ScenarioWeightConfig = { ...baseWeights, ...customWeights };

  const s1 = calculateAggregatedStats(loadout.set1);
  const s2 = calculateAggregatedStats(loadout.set2);

  const maxDps = Math.max(s1.totalDps, s2.totalDps);
  const maxSpeed = Math.max(s1.attacksPerSecond, s2.attacksPerSecond);
  const maxCrit = Math.max(s1.critChance, s2.critChance);
  const hasShield = s1.hasShield || s2.hasShield;
  const synergyScore = comboReport?.synergyScore ?? 50;

  // Normalized scores 0 - 100
  const dpsScore = Math.min(100, (maxDps / 800) * 100);
  const speedScore = Math.min(100, (maxSpeed / 2.0) * 100);
  const critScore = Math.min(100, (maxCrit / 30) * 100);
  const defenseScore = hasShield ? 90 : 50;

  let rawScore =
    dpsScore * weights.dpsWeight +
    speedScore * weights.speedWeight +
    critScore * weights.critWeight +
    defenseScore * weights.defenseWeight +
    synergyScore * weights.synergyWeight;

  if (scenario === 'balanced') {
    rawScore = (rawScore + evaluateScenarioFit(loadout, 'clearing', comboReport).score) / 2;
  }

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));
  const grade = getGrade(score);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (maxSpeed >= 1.6) strengths.push(`出色的攻擊/施法頻率 (${maxSpeed}/s)`);
  if (hasShield) strengths.push('配備盾牌提供格擋與防禦屬性');
  if (comboReport && comboReport.synergiesTriggered.length > 0) {
    strengths.push(`具備跨武器連段協同 (${comboReport.synergiesTriggered.join(', ')})`);
  }

  if (maxDps < 400) {
    weaknesses.push('當前裝備基礎傷害偏低');
    recommendations.push('建議提升武器階級或點選武器專屬增傷天賦');
  }
  if (!hasShield && scenario === 'bossing') {
    weaknesses.push('攻堅王戰缺乏盾牌防禦機制');
    recommendations.push('考慮在其中一組配置配備副手盾牌');
  }

  return {
    scenario,
    score,
    grade,
    strengths,
    weaknesses,
    recommendations
  };
}

function getGrade(score: number): ScenarioGrade {
  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  return 'C';
}
