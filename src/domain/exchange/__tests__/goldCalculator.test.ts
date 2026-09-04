import { describe, it, expect } from 'vitest';
import { calculateItemGoldFee, calculateTotalGoldFee } from '../goldCalculator';

describe('goldCalculator Domain Logic', () => {
  it('returns exact official gold fee for recognized currencies', () => {
    expect(calculateItemGoldFee('Divine Orb')).toBe(1250);
    expect(calculateItemGoldFee('Chaos Orb')).toBe(25);
    expect(calculateItemGoldFee('Mirror of Kalandra')).toBe(50000);
    expect(calculateItemGoldFee('Scroll of Wisdom')).toBe(1);
    expect(calculateItemGoldFee('Exalted Orb')).toBe(125);
  });

  it('calculates fallback gold fee based on item chaos value when not in table', () => {
    // 10 chaos item ~ 10 * 25 = 250 gold
    const fee = calculateItemGoldFee('Unknown Scarab of Divination', 10, 'Scarab');
    expect(fee).toBeGreaterThanOrEqual(5);
    expect(fee).toBe(250);
  });

  it('enforces minimum fee of 2 gold even for fractional value items', () => {
    const fee = calculateItemGoldFee('Fractional Currency', 0.01, 'Currency');
    expect(fee).toBeGreaterThanOrEqual(2);
  });

  it('calculates total gold fee and maps to farm accurately', () => {
    const res = calculateTotalGoldFee('Divine Orb', 20);
    expect(res.itemName).toBe('Divine Orb');
    expect(res.quantity).toBe(20);
    expect(res.goldCostPerUnit).toBe(1250);
    expect(res.totalGoldFee).toBe(25000);
    expect(res.tier).toBe('HIGH');
    // 25,000 / 25,000 = 1.0 map
    expect(res.estimatedMapsToFarm).toBe(1);
  });

  it('handles negative or zero quantities safely', () => {
    const res = calculateTotalGoldFee('Chaos Orb', 0);
    expect(res.totalGoldFee).toBe(0);
    expect(res.estimatedMapsToFarm).toBe(0);

    const resNeg = calculateTotalGoldFee('Chaos Orb', -5);
    expect(resNeg.totalGoldFee).toBe(0);
  });
});
