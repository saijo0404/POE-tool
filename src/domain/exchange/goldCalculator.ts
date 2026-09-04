/**
 * Faustus Currency Exchange Gold Fee Calculator
 */
import {
  OFFICIAL_GOLD_FEE_TABLE,
  DEFAULT_T16_MAP_GOLD_YIELD,
} from './constants';
import type { GoldFeeCalculation } from './types';

/**
 * Calculates official or dynamic gold fee for a single item unit
 */
export function calculateItemGoldFee(
  itemName: string,
  chaosValue?: number,
  category?: string
): number {
  if (OFFICIAL_GOLD_FEE_TABLE[itemName] !== undefined) {
    return OFFICIAL_GOLD_FEE_TABLE[itemName];
  }

  // Dynamic fallback based on market value (PoE 3.25 Faustus ~25 gold per 1c)
  if (chaosValue !== undefined && chaosValue > 0) {
    const estimated = Math.round(chaosValue * 25);
    return Math.max(2, estimated);
  }

  // Category fallback
  switch (category) {
    case 'Scarab':
      return 50;
    case 'Essence':
      return 25;
    case 'DivinationCard':
      return 100;
    case 'Fragment':
      return 150;
    case 'DeliriumOrb':
      return 75;
    default:
      return 25;
  }
}

function resolveGoldTier(goldPerUnit: number): GoldFeeCalculation['tier'] {
  if (goldPerUnit >= 5000) return 'PREMIUM';
  if (goldPerUnit >= 500) return 'HIGH';
  if (goldPerUnit >= 50) return 'MID';
  return 'BASIC';
}

/**
 * Calculates total gold fee for a transaction and estimated maps to farm
 */
export function calculateTotalGoldFee(
  itemName: string,
  quantity: number,
  chaosValue?: number,
  category?: string
): GoldFeeCalculation {
  const safeQty = Math.max(0, quantity);
  const goldCostPerUnit = calculateItemGoldFee(itemName, chaosValue, category);
  const totalGoldFee = safeQty * goldCostPerUnit;
  const tier = resolveGoldTier(goldCostPerUnit);

  const estimatedMapsToFarm =
    totalGoldFee > 0
      ? Math.max(1, Math.round((totalGoldFee / DEFAULT_T16_MAP_GOLD_YIELD) * 10) / 10)
      : 0;

  return {
    itemName,
    quantity: safeQty,
    goldCostPerUnit,
    totalGoldFee,
    tier,
    estimatedMapsToFarm,
  };
}
