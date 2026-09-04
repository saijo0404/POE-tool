/**
 * Faustus Currency Conversion Matrix
 */
import { OFFICIAL_GOLD_FEE_TABLE } from './constants';
import type { CurrencyKey, CurrencyRates, CurrencyMatrixConversion } from './types';

const CURRENCY_GOLD_COSTS: Record<CurrencyKey, number> = {
  chaos: OFFICIAL_GOLD_FEE_TABLE['Chaos Orb'] || 25,
  divine: OFFICIAL_GOLD_FEE_TABLE['Divine Orb'] || 1250,
  mirror: OFFICIAL_GOLD_FEE_TABLE['Mirror of Kalandra'] || 50000,
  exalted: OFFICIAL_GOLD_FEE_TABLE['Exalted Orb'] || 125,
};

/**
 * Converts a given amount of currency into Chaos, Divine, Mirror, and Exalted
 */
export function convertCurrency(
  amount: number,
  from: CurrencyKey,
  rates: CurrencyRates
): Record<CurrencyKey, number> {
  if (amount <= 0) {
    return { chaos: 0, divine: 0, mirror: 0, exalted: 0 };
  }

  const { divineChaosRate, mirrorChaosRate, exaltedChaosRate } = rates;
  let amountInChaos = 0;

  switch (from) {
    case 'chaos':
      amountInChaos = amount;
      break;
    case 'divine':
      amountInChaos = amount * (divineChaosRate > 0 ? divineChaosRate : 150);
      break;
    case 'mirror':
      amountInChaos =
        amount *
        (mirrorChaosRate > 0
          ? mirrorChaosRate
          : (divineChaosRate > 0 ? divineChaosRate : 150) * 700);
      break;
    case 'exalted':
      amountInChaos = amount * (exaltedChaosRate > 0 ? exaltedChaosRate : 15);
      break;
  }

  const divine =
    divineChaosRate > 0
      ? Math.round((amountInChaos / divineChaosRate) * 1000) / 1000
      : 0;

  const mirror =
    mirrorChaosRate > 0 ? amountInChaos / mirrorChaosRate : 0;

  const exalted =
    exaltedChaosRate > 0
      ? Math.round((amountInChaos / exaltedChaosRate) * 10) / 10
      : 0;

  return {
    chaos: Math.round(amountInChaos * 100) / 100,
    divine,
    mirror,
    exalted,
  };
}

/**
 * Creates full matrix details including estimated Faustus gold fee
 */
export function createCurrencyConversionMatrix(
  amount: number,
  baseCurrency: CurrencyKey,
  rates: CurrencyRates
): CurrencyMatrixConversion {
  const conversions = convertCurrency(amount, baseCurrency, rates);
  const goldFeeEstimate = Math.max(0, amount) * (CURRENCY_GOLD_COSTS[baseCurrency] || 25);

  return {
    baseCurrency,
    amount: Math.max(0, amount),
    conversions,
    goldFeeEstimate,
  };
}
