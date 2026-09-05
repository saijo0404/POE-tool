export type RollingStrategyType = 'scour_alch' | 'chaos_spam' | 'vaal_corrupt';

export interface MapRollingConfig {
  forbiddenModsCount?: number;
  minQuantityPercent?: number;
  minPackSizePercent?: number;
  mapCount?: number;
  strategy?: RollingStrategyType;
}

export interface RollingSimulationResult {
  strategy: RollingStrategyType;
  strategyName: string;
  costPerRollChaos: number;
  successProbability: number;
  expectedAttempts: number;
  confidence95Attempts: number;
  expectedCostChaos: number;
  confidence95CostChaos: number;
  mapCount: number;
  totalBatchCostChaos: number;
  verdictNote: string;
}

export interface StrategyComparisonItem extends RollingSimulationResult {
  isRecommended: boolean;
  recommendationReason: string;
}

const TOTAL_MOD_POOL_SIZE = 60;
const STRATEGY_COSTS: Record<RollingStrategyType, { name: string; cost: number }> = {
  scour_alch: { name: '重鑄 + 點金 (Scour + Alch)', cost: 1.5 },
  chaos_spam: { name: '混沌直骰 (Chaos Spam)', cost: 1.0 },
  vaal_corrupt: { name: '點金 + 瓦爾寶珠 (Vaal Corrupt)', cost: 2.5 }
};

export function estimateRollPassProbability(input: {
  forbiddenModsCount?: number;
  minQuantityPercent?: number;
  minPackSizePercent?: number;
}): number {
  const k = Math.max(0, Math.min(TOTAL_MOD_POOL_SIZE - 5, input.forbiddenModsCount ?? 0));
  const pSafeMod = Math.pow(Math.max(0.01, 1 - k / TOTAL_MOD_POOL_SIZE), 5);

  const minQuant = input.minQuantityPercent ?? 0;
  const pQuant = minQuant <= 65 ? 1.0 : Math.max(0.05, 1 - (minQuant - 65) * 0.03);

  const minPack = input.minPackSizePercent ?? 0;
  const pPack = minPack <= 20 ? 1.0 : Math.max(0.05, 1 - (minPack - 20) * 0.05);

  const rawP = pSafeMod * pQuant * pPack;
  return Math.round(Math.min(0.98, Math.max(0.005, rawP)) * 1000) / 1000;
}

function calculateConfidence95Attempts(p: number): number {
  if (p >= 0.98) return 1;
  const val = Math.ceil(-2.9957 / Math.log(1 - p));
  return Math.max(1, Math.min(val, 999));
}

function formatVerdict(strategy: RollingStrategyType, avg: number, cost: number): string {
  if (strategy === 'scour_alch') {
    return `平均每張圖需 ${avg} 次重鑄點金 (期望 ~${cost} C)，適合穩定控管危險詞綴。`;
  }
  if (strategy === 'chaos_spam') {
    return `平均每張圖需 ${avg} 顆混沌石 (期望 ~${cost} C)，洗圖節奏最迅速。`;
  }
  return `平均每張圖期望耗費 ~${cost} C，適合追求極限 8 詞與頂級怪群加成。`;
}

export function simulateMapRolling(config: MapRollingConfig): RollingSimulationResult {
  const strategy = config.strategy ?? 'scour_alch';
  const meta = STRATEGY_COSTS[strategy];
  const p = estimateRollPassProbability(config);

  const attempts = Math.round((1 / p) * 10) / 10;
  const c95Attempts = calculateConfidence95Attempts(p);
  const singleCost = Math.round(attempts * meta.cost * 10) / 10;
  const c95Cost = Math.round(c95Attempts * meta.cost * 10) / 10;
  const maps = config.mapCount ?? 1;
  const totalBatch = Math.round(singleCost * maps * 10) / 10;

  return {
    strategy,
    strategyName: meta.name,
    costPerRollChaos: meta.cost,
    successProbability: p,
    expectedAttempts: attempts,
    confidence95Attempts: c95Attempts,
    expectedCostChaos: singleCost,
    confidence95CostChaos: c95Cost,
    mapCount: maps,
    totalBatchCostChaos: totalBatch,
    verdictNote: formatVerdict(strategy, attempts, singleCost)
  };
}

export function compareRollingStrategies(
  config: Omit<MapRollingConfig, 'strategy'>
): StrategyComparisonItem[] {
  const strategies: RollingStrategyType[] = ['scour_alch', 'chaos_spam', 'vaal_corrupt'];
  const results = strategies.map(s => simulateMapRolling({ ...config, strategy: s }));

  const lowestCost = results.reduce((min, r) => (r.expectedCostChaos < min.expectedCostChaos ? r : min), results[0]);

  return results.map(r => {
    const isRec = r.strategy === lowestCost.strategy;
    let reason = '標準洗圖方案';
    if (isRec) {
      reason = `最省通貨首選（單場期望成本最低：${r.expectedCostChaos} C）`;
    } else if (r.strategy === 'vaal_corrupt') {
      reason = '極限打寶方案（有機會瓦出 8 詞特大怪群地圖）';
    } else if (r.strategy === 'chaos_spam') {
      reason = '極速洗圖方案（操作最簡便但單次成本較高）';
    }
    return { ...r, isRecommended: isRec, recommendationReason: reason };
  });
}
