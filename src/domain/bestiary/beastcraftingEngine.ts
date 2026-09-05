import type {
  BeastCraftCategory,
  BeastCraftRecipe,
  BestiaryMissionResult,
  MissionTier,
  MissionValuedBeast,
  RecipeCostCalculation,
  RoiStatus,
} from './types';
import { DEFAULT_YELLOW_BEAST_PRICE, RED_BEASTS } from './bestiaryData';

function resolveRoiStatus(profit: number, margin: number): RoiStatus {
  if (profit > 0 && margin >= 10) return 'profitable';
  if (profit >= 0) return 'marginal';
  return 'loss';
}

export function calculateRecipeCost(
  recipe: BeastCraftRecipe,
  primaryCost: number,
  yellowCost: number,
  customOutputVal?: number
): RecipeCostCalculation {
  const yellowTotal = recipe.yellowBeastCount * yellowCost;
  const totalCost = primaryCost + yellowTotal;
  const estimatedOutput = customOutputVal ?? recipe.defaultEstimatedOutputChaos;
  const netProfit = estimatedOutput - totalCost;
  const profitMargin = totalCost > 0 ? Number(((netProfit / totalCost) * 100).toFixed(2)) : 0;

  return {
    recipeId: recipe.id,
    recipeNameZh: recipe.nameZh,
    primaryBeastCostChaos: primaryCost,
    yellowBeastCostChaos: yellowTotal,
    totalCraftCostChaos: totalCost,
    estimatedOutputChaos: estimatedOutput,
    netProfitChaos: netProfit,
    profitMarginPercent: profitMargin,
    roiStatus: resolveRoiStatus(netProfit, profitMargin),
  };
}

export function filterRecipes(
  recipes: BeastCraftRecipe[],
  category?: BeastCraftCategory,
  searchKeyword?: string
): BeastCraftRecipe[] {
  const keyword = searchKeyword?.trim().toLowerCase() ?? '';
  return recipes.filter((r) => {
    const matchesCategory = !category || r.category === category;
    const matchesKeyword =
      !keyword ||
      r.nameZh.toLowerCase().includes(keyword) ||
      r.nameEn.toLowerCase().includes(keyword) ||
      r.primaryBeastNameZh.toLowerCase().includes(keyword) ||
      r.primaryBeastNameEn.toLowerCase().includes(keyword);
    return matchesCategory && matchesKeyword;
  });
}

function getTierBeastWeights(tier: MissionTier): Array<{ id: string; weight: number }> {
  if (tier === 'white') {
    return [
      { id: 'farric_frost_crawford', weight: 40 },
      { id: 'farric_lynx_alpha', weight: 40 },
      { id: 'saqawine_retch', weight: 20 },
    ];
  }
  if (tier === 'yellow') {
    return [
      { id: 'craicic_vassal', weight: 30 },
      { id: 'saqawine_vulture', weight: 25 },
      { id: 'farric_frost_crawford', weight: 25 },
      { id: 'saqawine_retch', weight: 20 },
    ];
  }
  return [
    { id: 'craicic_chimeral', weight: 20 },
    { id: 'fenumal_plagued_arachnid', weight: 20 },
    { id: 'farric_tiger_alpha', weight: 15 },
    { id: 'saqawine_vulture', weight: 15 },
    { id: 'craicic_vassal', weight: 15 },
    { id: 'farric_frost_crawford', weight: 15 },
  ];
}

function calculateTierStats(tier: MissionTier): { redExpected: number; yellowExpected: number } {
  if (tier === 'white') return { redExpected: 1, yellowExpected: 2 };
  if (tier === 'yellow') return { redExpected: 1.3, yellowExpected: 3 };
  return { redExpected: 1.8, yellowExpected: 4 };
}

export function estimateMissionEv(
  tier: MissionTier,
  missionCostChaos: number,
  customBeastPrices?: Record<string, number>
): BestiaryMissionResult {
  const { redExpected, yellowExpected } = calculateTierStats(tier);
  const weights = getTierBeastWeights(tier);
  const totalWeight = weights.reduce((acc, w) => acc + w.weight, 0);

  let weightedRedChaos = 0;
  const topValuedBeasts: MissionValuedBeast[] = [];

  for (const item of weights) {
    const beast = RED_BEASTS.find((b) => b.id === item.id);
    const price = customBeastPrices?.[item.id] ?? beast?.defaultMarketChaos ?? 50;
    const chancePercent = Number(((item.weight / totalWeight) * 100).toFixed(1));
    weightedRedChaos += price * (item.weight / totalWeight);

    if (beast) {
      topValuedBeasts.push({
        nameZh: beast.nameZh,
        captureChancePercent: chancePercent,
        valueChaos: price,
      });
    }
  }

  const grossChaos = Math.round(
    redExpected * weightedRedChaos + yellowExpected * DEFAULT_YELLOW_BEAST_PRICE
  );

  return {
    missionTier: tier,
    redBeastsExpected: redExpected,
    yellowBeastsExpected: yellowExpected,
    expectedGrossChaos: grossChaos,
    netProfitChaos: grossChaos - missionCostChaos,
    topValuedBeasts: topValuedBeasts.sort((a, b) => b.valueChaos - a.valueChaos),
  };
}

export function formatBeastBulkWhisper(
  beastNameEn: string,
  quantity: number,
  priceChaos: number,
  league = 'Settlers'
): string {
  const totalChaos = priceChaos * quantity;
  return `@seller Hi, I'd like to buy your ${quantity} ${beastNameEn} for ${totalChaos} chaos in ${league}.`;
}
