import type { TradeListing } from '../../types/poe';

export interface PriceAnalysisOptions {
  divineChaosRate?: number;
}

export interface PriceAnalysisResult {
  sampleCount: number;
  validCount: number;
  priceFixingCount: number;
  highOutlierCount: number;
  hasPriceFixing: boolean;
  q1Chaos: number;
  medianChaos: number;
  q3Chaos: number;
  iqrChaos: number;
  lowerFenceChaos: number;
  upperFenceChaos: number;
  trimmedMeanChaos: number;
  suggestedQuickSellChaos: number;
  suggestedFairPriceChaos: number;
  suggestedQuickSellDivine: number;
  suggestedFairPriceDivine: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  warningMessage?: string;
}

export function normalizeToChaos(amount: number, currency: string, divineChaosRate: number): number {
  const cur = currency.toLowerCase();
  if (cur === 'divine' || cur === 'div') return amount * divineChaosRate;
  if (cur === 'mirror') return amount * divineChaosRate * 700;
  return amount;
}

export function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function calculateQuartiles(sorted: number[]) {
  const q1 = calculatePercentile(sorted, 0.25);
  const median = calculatePercentile(sorted, 0.5);
  const q3 = calculatePercentile(sorted, 0.75);
  const iqr = q3 - q1;
  return { q1, median, q3, iqr };
}

function detectFencesAndOutliers(prices: number[], q1: number, q3: number, iqr: number, median: number) {
  const rawLowerFence = q1 - 1.5 * iqr;
  const effectiveLower = rawLowerFence > 0
    ? rawLowerFence
    : Math.min(q1 * 0.5, median * 0.4);
  const lowerFence = Math.max(0, Math.round(effectiveLower * 10) / 10);
  const upperFence = Math.round((q3 + 1.5 * iqr) * 10) / 10;
  const priceFixing = prices.filter(p => p < lowerFence);
  const highOutliers = prices.filter(p => p > upperFence);
  const inliers = prices.filter(p => p >= lowerFence && p <= upperFence);
  return { lowerFence, upperFence, priceFixing, highOutliers, inliers };
}

function buildEmptyResult(): PriceAnalysisResult {
  return {
    sampleCount: 0, validCount: 0, priceFixingCount: 0, highOutlierCount: 0,
    hasPriceFixing: false, q1Chaos: 0, medianChaos: 0, q3Chaos: 0, iqrChaos: 0,
    lowerFenceChaos: 0, upperFenceChaos: 0, trimmedMeanChaos: 0,
    suggestedQuickSellChaos: 0, suggestedFairPriceChaos: 0,
    suggestedQuickSellDivine: 0, suggestedFairPriceDivine: 0,
    confidenceLevel: 'low'
  };
}

function handleSmallSampleResult(prices: number[], rate: number): PriceAnalysisResult {
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const roundedAvg = Math.round(avg * 10) / 10;
  return {
    sampleCount: prices.length, validCount: prices.length, priceFixingCount: 0, highOutlierCount: 0,
    hasPriceFixing: false, q1Chaos: prices[0], medianChaos: roundedAvg, q3Chaos: prices[prices.length - 1],
    iqrChaos: 0, lowerFenceChaos: 0, upperFenceChaos: prices[prices.length - 1] * 2,
    trimmedMeanChaos: roundedAvg, suggestedQuickSellChaos: roundedAvg, suggestedFairPriceChaos: roundedAvg,
    suggestedQuickSellDivine: Math.round((roundedAvg / rate) * 100) / 100,
    suggestedFairPriceDivine: Math.round((roundedAvg / rate) * 100) / 100,
    confidenceLevel: 'low'
  };
}

function extractPriceInChaos(listing: TradeListing, rate: number): number {
  if (typeof listing.priceAmount === 'number' && listing.priceAmount > 0) {
    return normalizeToChaos(listing.priceAmount, listing.priceCurrency || 'chaos', rate);
  }
  if (typeof listing.priceInChaos === 'number' && listing.priceInChaos > 0) {
    return listing.priceInChaos;
  }
  return 0;
}

export function analyzeMarketPrices(
  listings: TradeListing[],
  options?: PriceAnalysisOptions
): PriceAnalysisResult {
  const rate = options?.divineChaosRate ?? 150;
  const rawPrices = listings
    .map(l => extractPriceInChaos(l, rate))
    .filter(p => p > 0);

  if (rawPrices.length === 0) return buildEmptyResult();
  rawPrices.sort((a, b) => a - b);
  if (rawPrices.length < 4) return handleSmallSampleResult(rawPrices, rate);

  const { q1, median, q3, iqr } = calculateQuartiles(rawPrices);
  const { lowerFence, upperFence, priceFixing, highOutliers, inliers } = detectFencesAndOutliers(rawPrices, q1, q3, iqr, median);

  const targetList = inliers.length > 0 ? inliers : rawPrices;
  const trimmedMean = Math.round((targetList.reduce((a, b) => a + b, 0) / targetList.length) * 10) / 10;
  const fairChaos = Math.round(calculatePercentile(targetList, 0.5) * 10) / 10;
  const quickChaos = Math.max(1, Math.round(calculatePercentile(targetList, 0.15) * 10) / 10);

  const hasFixing = priceFixing.length > 0;
  const warningMessage = hasFixing
    ? `⚠️ 檢測到 ${priceFixing.length} 筆低於合理下界 (${lowerFence}c) 的疑似壓價掛牌，已自估價中剔除。`
    : undefined;

  return {
    sampleCount: rawPrices.length,
    validCount: inliers.length,
    priceFixingCount: priceFixing.length,
    highOutlierCount: highOutliers.length,
    hasPriceFixing: hasFixing,
    q1Chaos: Math.round(q1 * 10) / 10,
    medianChaos: Math.round(median * 10) / 10,
    q3Chaos: Math.round(q3 * 10) / 10,
    iqrChaos: Math.round(iqr * 10) / 10,
    lowerFenceChaos: lowerFence,
    upperFenceChaos: upperFence,
    trimmedMeanChaos: trimmedMean,
    suggestedQuickSellChaos: quickChaos,
    suggestedFairPriceChaos: fairChaos,
    suggestedQuickSellDivine: Math.round((quickChaos / rate) * 100) / 100,
    suggestedFairPriceDivine: Math.round((fairChaos / rate) * 100) / 100,
    confidenceLevel: rawPrices.length >= 10 && inliers.length / rawPrices.length >= 0.7 ? 'high' : 'medium',
    warningMessage
  };
}
