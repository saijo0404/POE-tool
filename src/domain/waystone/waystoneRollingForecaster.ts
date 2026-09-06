import type {
  WaystoneRollingCriteria,
  WaystoneRollingForecast,
  WaystoneRollingStrategy
} from './types';
import { WAYSTONE_MODS_CATALOG } from './waystoneModsCatalog';

interface ModPoolStats {
  totalCatalogCount: number;
  forbiddenCount: number;
  fatalCount: number;
  warningCount: number;
}

function getModPoolStats(criteria: WaystoneRollingCriteria): ModPoolStats {
  const total = WAYSTONE_MODS_CATALOG.length;
  let forbidden = criteria.forbiddenModIds.length;
  const fatals = WAYSTONE_MODS_CATALOG.filter(m => m.baseRisk === 'fatal').length;
  const warnings = WAYSTONE_MODS_CATALOG.filter(m => m.baseRisk === 'warning').length;

  if (criteria.maxAcceptableRisk === 'caution') {
    forbidden = Math.max(forbidden, fatals + warnings);
  } else if (criteria.maxAcceptableRisk === 'warning') {
    forbidden = Math.max(forbidden, fatals);
  }

  return {
    totalCatalogCount: Math.max(total, 12),
    forbiddenCount: Math.min(forbidden, total - 1),
    fatalCount: fatals,
    warningCount: warnings
  };
}

function calculateSingleRollSuccessRate(
  strategy: WaystoneRollingStrategy,
  criteria: WaystoneRollingCriteria
): number {
  const stats = getModPoolStats(criteria);
  const safeRatio = (stats.totalCatalogCount - stats.forbiddenCount) / stats.totalCatalogCount;

  let modCount = 4;
  let quantPassRate = 0.85;

  if (strategy === 'alch_scour' || strategy === 'chaos_spam') {
    modCount = 4;
    quantPassRate = criteria.minItemQuantity <= 60 ? 0.9 : 0.65;
  } else if (strategy === 'transmute_aug_regal') {
    modCount = 3;
    quantPassRate = criteria.minItemQuantity <= 40 ? 0.95 : 0.35;
  }

  const modSafetyRate = Math.pow(safeRatio, modCount);
  const totalRate = modSafetyRate * quantPassRate;
  return Math.max(0.02, Math.min(0.95, totalRate));
}

function buildCostEstimates(strategy: WaystoneRollingStrategy, attempts: number) {
  const rounded = Math.max(1, Math.round(attempts));
  if (strategy === 'chaos_spam') {
    return {
      transmutation: 0, augmentation: 0, regal: 0,
      alchemy: 1, scouring: 0, chaos: rounded,
      goldEquivalent: rounded * 1200
    };
  }
  if (strategy === 'transmute_aug_regal') {
    return {
      transmutation: rounded, augmentation: Math.round(rounded * 0.8),
      regal: rounded, alchemy: 0, scouring: Math.max(0, rounded - 1),
      chaos: 0, goldEquivalent: rounded * 450
    };
  }
  return {
    transmutation: 0, augmentation: 0, regal: 0,
    alchemy: rounded, scouring: Math.max(0, rounded - 1), chaos: 0,
    goldEquivalent: rounded * 650
  };
}

function buildRecommendation(
  strategy: WaystoneRollingStrategy,
  rate: number,
  criteria: WaystoneRollingCriteria
): string {
  if (criteria.minItemQuantity > 70 && strategy === 'transmute_aug_regal') {
    return '⚠️ 藍圖增幅策略難以達到 70%+ 物品數量，強烈建議切換為「點金+重鑄」或「混沌直骰」。';
  }
  if (rate < 0.15) {
    return '⚠️ 當前規避條件過於嚴苛（單次通過率低於 15%），建議適度放寬目標數量或允許中度危險詞綴。';
  }
  return '✅ 當前策略成本效益良好，平均可在合理通貨範圍內洗出安全且高收益的銘刻地圖。';
}

export function forecastWaystoneRolling(
  strategy: WaystoneRollingStrategy,
  criteria: WaystoneRollingCriteria
): WaystoneRollingForecast {
  const successRate = calculateSingleRollSuccessRate(strategy, criteria);
  const expectedAttempts = Math.round((1 / successRate) * 10) / 10;
  const attempts95 = Math.ceil(Math.log(1 - 0.95) / Math.log(1 - successRate));

  return {
    strategy,
    successRatePercent: Math.round(successRate * 1000) / 10,
    expectedAttempts,
    attempts95Percentile: Math.max(attempts95, Math.ceil(expectedAttempts)),
    costEstimates: buildCostEstimates(strategy, expectedAttempts),
    recommendation: buildRecommendation(strategy, successRate, criteria)
  };
}
