import { describe, it, expect } from 'vitest';
import { convertCurrency, createCurrencyConversionMatrix } from '../conversionMatrix';
import type { CurrencyRates } from '../types';

describe('conversionMatrix Domain Logic', () => {
  const mockRates: CurrencyRates = {
    divineChaosRate: 150,
    mirrorChaosRate: 150 * 700, // 105,000 Chaos
    exaltedChaosRate: 15,
  };

  it('correctly converts 150 Chaos into Divine, Mirror and Exalted', () => {
    const res = convertCurrency(150, 'chaos', mockRates);
    expect(res.chaos).toBe(150);
    expect(res.divine).toBe(1);
    expect(res.exalted).toBe(10);
    expect(res.mirror).toBeCloseTo(150 / 105000, 6);
  });

  it('correctly converts 2 Divine into Chaos, Mirror and Exalted', () => {
    const res = convertCurrency(2, 'divine', mockRates);
    expect(res.chaos).toBe(300);
    expect(res.divine).toBe(2);
    expect(res.exalted).toBe(20);
    expect(res.mirror).toBeCloseTo(2 / 700, 6);
  });

  it('correctly converts 1 Mirror into Chaos and Divine', () => {
    const res = convertCurrency(1, 'mirror', mockRates);
    expect(res.chaos).toBe(105000);
    expect(res.divine).toBe(700);
  });

  it('creates full currency conversion matrix with gold estimate', () => {
    const matrix = createCurrencyConversionMatrix(10, 'divine', mockRates);
    expect(matrix.baseCurrency).toBe('divine');
    expect(matrix.amount).toBe(10);
    expect(matrix.conversions.chaos).toBe(1500);
    expect(matrix.goldFeeEstimate).toBe(10 * 1250);
  });

  it('guards against zero or negative rates and amounts', () => {
    const zeroRes = convertCurrency(0, 'chaos', mockRates);
    expect(zeroRes.chaos).toBe(0);
    expect(zeroRes.divine).toBe(0);

    const invalidRates: CurrencyRates = {
      divineChaosRate: 0,
      mirrorChaosRate: 0,
      exaltedChaosRate: 0,
    };
    const fallback = convertCurrency(100, 'chaos', invalidRates);
    expect(fallback.chaos).toBe(100);
    expect(fallback.divine).toBe(0);
  });
});
