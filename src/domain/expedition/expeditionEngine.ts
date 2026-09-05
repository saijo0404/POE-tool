import type {
  DannigArbitrageResult,
  FactionType,
  LogbookCalculation,
  LogbookRecommendation,
  TujenHaggleAdvice,
} from './types';
import { EXPEDITION_FACTIONS, EXPEDITION_REMNANTS } from './expeditionData';

export function calculateTujenHaggle(askingPrice: number): TujenHaggleAdvice {
  const safe = Math.max(1, Math.round(askingPrice * 0.52));
  const aggro = Math.max(1, Math.round(askingPrice * 0.45));
  const counter = Math.max(1, Math.round(askingPrice * 0.68));
  const savings = Math.max(0, askingPrice - safe);
  const savingsPercent = askingPrice > 0 ? Math.round((savings / askingPrice) * 100) : 0;

  return {
    askingPrice,
    firstOfferSafe: safe,
    firstOfferAggressive: aggro,
    secondCounterOffer: counter,
    estimatedSavings: savings,
    savingsPercent,
    tipZh: '首出拉至 50%~55% 刻度安全點；若圖貞皺眉，二出回價至 68% 即可高機率成交且保留最多文物。',
  };
}

export function calculateDannigArbitrage(
  sunArtifacts: number,
  _targetFaction: FactionType,
  sunRate: number,
  targetRate: number,
  discountRatio = 0.6
): DannigArbitrageResult {
  const convertedCount = discountRatio > 0 ? Math.round(sunArtifacts / discountRatio) : 0;
  const originalVal = sunArtifacts * sunRate;
  const convertedVal = convertedCount * targetRate;
  const netProfit = Number((convertedVal - originalVal).toFixed(1));

  return {
    convertedCount,
    netProfitChaos: netProfit,
  };
}

interface RemnantStats {
  runicMult: number;
  qtyMult: number;
  deadlyNames: string[];
}

function evaluateSelectedRemnants(remnantIds: string[]): RemnantStats {
  let runicMult = 1.0;
  let qtyMult = 1.0;
  const deadlyNames: string[] = [];

  for (const id of remnantIds) {
    const r = EXPEDITION_REMNANTS.find((item) => item.id === id);
    if (!r) continue;
    runicMult *= r.runicMonsterMultiplier;
    qtyMult *= r.logbookDropMultiplier;
    if (r.isDeadly) deadlyNames.push(r.nameZh);
  }

  return { runicMult, qtyMult, deadlyNames };
}

function resolveRecommendation(hasDeadly: boolean, netProfit: number): LogbookRecommendation {
  if (hasDeadly) return 'warning_deadly';
  if (netProfit < 0) return 'reroll_placement';
  return 'run';
}

export function calculateLogbookEv(
  selectedFaction: FactionType,
  areaLevel: number,
  remnantIds: string[],
  logbookCost: number
): LogbookCalculation {
  const faction = EXPEDITION_FACTIONS.find((f) => f.id === selectedFaction);
  const baseEv = faction?.baseEvChaos ?? 100;
  const ilvlFactor = 1 + Math.max(0, areaLevel - 68) * 0.02;

  const { runicMult, qtyMult, deadlyNames } = evaluateSelectedRemnants(remnantIds);
  const hasDeadly = deadlyNames.length > 0;

  const grossChaos = Math.round(baseEv * ilvlFactor * runicMult * qtyMult);
  const netProfit = grossChaos - logbookCost;
  const estimatedArtifacts = Math.round(400 * ilvlFactor * runicMult);

  return {
    selectedFaction,
    areaLevel,
    selectedRemnantIds: remnantIds,
    logbookCostChaos: logbookCost,
    totalRunicMonsterBonus: Number(((runicMult - 1) * 100).toFixed(0)),
    totalQuantityBonus: Number(((qtyMult - 1) * 100).toFixed(0)),
    hasDeadlyAffixes: hasDeadly,
    deadlyRemnantNames: deadlyNames,
    estimatedArtifactsTotal: estimatedArtifacts,
    estimatedGrossChaos: grossChaos,
    netProfitChaos: netProfit,
    recommendation: resolveRecommendation(hasDeadly, netProfit),
  };
}
