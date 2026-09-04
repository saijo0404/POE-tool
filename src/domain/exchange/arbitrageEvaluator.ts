/**
 * Cross-market Arbitrage Evaluator (Faustus vs Trade Market)
 */
import { KNOWN_ITEM_ZH_NAMES } from './constants';
import type {
  ExchangeItem,
  ArbitrageOpportunity,
  ArbitrageDirection,
  ExchangeCategory,
} from './types';

export interface EvaluateArbitrageParams {
  itemId: string;
  itemName: string;
  itemNameZh?: string;
  category: ExchangeCategory;
  icon: string;
  faustusPriceChaos: number;
  tradePriceChaos: number;
  goldCostPerUnit: number;
  volume24h: number;
  divineRate: number;
}

const GOLD_CHAOS_VALUE_RATIO = 25; // Approximate gold equivalence: 25 gold ~ 1 Chaos

function determineConfidence(
  volume24h: number,
  roiPercent: number
): ArbitrageOpportunity['confidence'] {
  if (volume24h >= 200 && roiPercent >= 15) return 'HIGH';
  if (volume24h >= 50 && roiPercent >= 10) return 'MEDIUM';
  return 'LOW';
}

/**
 * Evaluates arbitrage potential for a single item
 */
export function evaluateArbitrage(
  params: EvaluateArbitrageParams
): ArbitrageOpportunity | null {
  const {
    itemId,
    itemName,
    itemNameZh = KNOWN_ITEM_ZH_NAMES[itemName],
    category,
    icon,
    faustusPriceChaos,
    tradePriceChaos,
    goldCostPerUnit,
    volume24h,
    divineRate,
  } = params;

  if (faustusPriceChaos <= 0 || tradePriceChaos <= 0) return null;

  const goldFeeInChaos = goldCostPerUnit / GOLD_CHAOS_VALUE_RATIO;
  const rawDiff = tradePriceChaos - faustusPriceChaos;
  const absDiff = Math.abs(rawDiff);

  // Determine direction
  let direction: ArbitrageDirection;
  let baseCost: number;
  let profitChaos: number;

  if (rawDiff > 0) {
    // Faustus is cheaper -> Buy Faustus, Sell Trade
    direction = 'BUY_FAUSTUS_SELL_TRADE';
    baseCost = faustusPriceChaos;
    profitChaos = rawDiff - goldFeeInChaos;
  } else {
    // Trade is cheaper -> Buy Trade, Sell Faustus
    direction = 'BUY_TRADE_SELL_FAUSTUS';
    baseCost = tradePriceChaos;
    profitChaos = absDiff - goldFeeInChaos;
  }

  const roiPercent = baseCost > 0 ? (profitChaos / baseCost) * 100 : 0;

  // Filter out non-profitable or low margin opportunities
  if (profitChaos < 0.5 || roiPercent < 5) {
    return null;
  }

  const safeDivRate = divineRate > 0 ? divineRate : 150;
  const profitDivine = Math.round((profitChaos / safeDivRate) * 1000) / 1000;
  const confidence = determineConfidence(volume24h, roiPercent);

  const recommendation =
    direction === 'BUY_FAUSTUS_SELL_TRADE'
      ? `Faustus 交易所買入 (${faustusPriceChaos}c) ➔ 市集直購賣出 (${tradePriceChaos}c)，單件淨賺 +${Math.round(profitChaos * 10) / 10}c`
      : `市集直購買入 (${tradePriceChaos}c) ➔ Faustus 交易所賣出 (${faustusPriceChaos}c)，單件淨賺 +${Math.round(profitChaos * 10) / 10}c`;

  return {
    itemId,
    itemName,
    itemNameZh,
    category,
    icon,
    direction,
    faustusPriceChaos,
    tradePriceChaos,
    priceDiffChaos: Math.round(absDiff * 100) / 100,
    profitChaos: Math.round(profitChaos * 100) / 100,
    profitDivine,
    roiPercent: Math.round(roiPercent * 10) / 10,
    goldFeePerUnit: goldCostPerUnit,
    volume24h,
    confidence,
    recommendation,
  };
}

/**
 * Finds and sorts arbitrage opportunities across exchange items
 */
export function findArbitrageOpportunities(
  items: ExchangeItem[],
  divineRate: number,
  minRoiPercent: number = 5,
  minVolume: number = 20
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  for (const item of items) {
    if (!item.tradePriceChaos || item.volume24h < minVolume) continue;

    const evalResult = evaluateArbitrage({
      itemId: item.id,
      itemName: item.name,
      itemNameZh: item.nameZh,
      category: item.category,
      icon: item.icon,
      faustusPriceChaos: item.primaryValue,
      tradePriceChaos: item.tradePriceChaos,
      goldCostPerUnit: item.goldCostPerUnit,
      volume24h: item.volume24h,
      divineRate,
    });

    if (evalResult && evalResult.roiPercent >= minRoiPercent) {
      opportunities.push(evalResult);
    }
  }

  // Sort by profit chaos descending
  return opportunities.sort((a, b) => b.profitChaos - a.profitChaos);
}
