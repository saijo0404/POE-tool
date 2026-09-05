import type {
  DeliriumPercent,
  DeliriumRewardType,
  DeliriumSimulationInput,
  DeliriumSimulationResult,
  DeliriumTierBreakdown,
  DeliriumRecommendation
} from './types';

const DAMAGE_REDUCTION_MAP: Record<DeliriumPercent, number> = {
  0: 0,
  20: 20,
  40: 45,
  60: 70,
  80: 88,
  100: 96
};

const BASE_SPLINTER_RANGE: Record<DeliriumPercent, [number, number]> = {
  0: [15, 30],
  20: [20, 35],
  40: [35, 55],
  60: [55, 80],
  80: [75, 110],
  100: [100, 150]
};

const REWARD_VALUE_PER_TIER: Record<DeliriumRewardType, number> = {
  scarabs: 14,
  currency: 12,
  divination: 11,
  essences: 10,
  fossils: 9,
  generic: 6
};

function calculateSplinters(percent: DeliriumPercent, kills: number, tier: number): { min: number; max: number; avg: number } {
  const [baseMin, baseMax] = BASE_SPLINTER_RANGE[percent];
  const tierFactor = Math.max(0.4, Math.min(1.0, tier / 16));
  const densityFactor = Math.max(0.2, kills / 1000);

  const min = Math.round(baseMin * tierFactor * densityFactor);
  const max = Math.round(baseMax * tierFactor * densityFactor);
  const avg = Math.round(((min + max) / 2) * 10) / 10;
  return { min, max, avg };
}

function calculateTiers(kills: number): { achievableTiers: number; breakdown: DeliriumTierBreakdown[] } {
  const breakdown: DeliriumTierBreakdown[] = [];
  let req = 50;
  let tier = 1;

  while (kills >= req && tier <= 12) {
    breakdown.push({ tier, requiredKills: req, estimatedValueChaos: 0 });
    tier++;
    req += 50 + tier * 20;
  }
  const achievableTiers = Math.max(1, breakdown.length);
  return { achievableTiers, breakdown };
}

function determineDeliriumRec(profit: number, roi: number, cost: number): { rec: DeliriumRecommendation; text: string } {
  if (profit >= 35 && (cost === 0 || roi >= 25)) {
    return { rec: 'HIGHLY_PROFITABLE', text: '預期高額正回報！高密度地圖強烈推薦投入瞻妄。' };
  }
  if (profit >= 0) {
    return { rec: 'MODERATE_PROFIT', text: '預估微幅獲利或持平，適合穩定累積幻境裂片與門票。' };
  }
  return { rec: 'HIGH_RISK_LOSS', text: '預期可能面臨通貨虧損，請增加怪物怪群密度或降低寶珠成本。' };
}

export function simulateDeliriumEv(input: DeliriumSimulationInput): DeliriumSimulationResult {
  const percent = input.deliriumPercent;
  const mapTier = input.mapTier ?? 16;
  const kills = Math.max(50, input.monsterPackCount);
  const orbCost = input.orbCostChaos ?? 35;
  const splinterPrice = input.splinterPriceChaos ?? 0.75;

  const orbCount = percent / 20;
  const totalCost = orbCount * orbCost;
  const dmgReduction = DAMAGE_REDUCTION_MAP[percent];

  const { min, max, avg } = calculateSplinters(percent, kills, mapTier);
  const splinterRevenue = Math.round(avg * splinterPrice * 10) / 10;

  const { achievableTiers, breakdown } = calculateTiers(kills);
  const valPerTier = REWARD_VALUE_PER_TIER[input.rewardType] || 8;
  const rewardsRevenue = Math.round(achievableTiers * valPerTier * (1 + percent / 200) * 10) / 10;

  breakdown.forEach(b => { b.estimatedValueChaos = Math.round(valPerTier * (1 + percent / 200) * 10) / 10; });

  const totalRevenue = Math.round((splinterRevenue + rewardsRevenue) * 10) / 10;
  const netProfit = Math.round((totalRevenue - totalCost) * 10) / 10;
  const roi = totalCost > 0 ? Math.round((netProfit / totalCost) * 1000) / 10 : (netProfit > 0 ? 100 : 0);

  const { rec, text } = determineDeliriumRec(netProfit, roi, totalCost);

  return {
    deliriumPercent: percent,
    achievableTiers,
    monsterDamageReductionPercent: dmgReduction,
    splinterDropMin: min,
    splinterDropMax: max,
    splinterDropAvg: avg,
    splinterRevenueChaos: splinterRevenue,
    rewardsRevenueChaos: rewardsRevenue,
    totalRevenueChaos: totalRevenue,
    totalCostChaos: totalCost,
    netProfitChaos: netProfit,
    roiPercent: roi,
    recommendation: rec,
    recommendationText: text,
    tierBreakdown: breakdown
  };
}
