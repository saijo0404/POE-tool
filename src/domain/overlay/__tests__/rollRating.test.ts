import { describe, it, expect } from 'vitest';
import { calculateRollRating } from '../rollRating';

describe('calculateRollRating', () => {
  it('calculates roll percentage and rating label correctly for range mods', () => {
    // 54 out of range 50-54 -> 100% -> 'Max'
    const maxRoll = calculateRollRating(54, 50, 54, 5);
    expect(maxRoll.percentage).toBe(100);
    expect(maxRoll.ratingLabel).toBe('Max');
    expect(maxRoll.tierText).toBe('T5');

    // 52 out of 50-54 -> 50% -> 'Mid'
    const midRoll = calculateRollRating(52, 50, 54, 1);
    expect(midRoll.percentage).toBe(50);
    expect(midRoll.ratingLabel).toBe('Mid');
    expect(midRoll.tierText).toBe('T1');

    // 50 out of 50-54 -> 0% -> 'Low'
    const lowRoll = calculateRollRating(50, 50, 54);
    expect(lowRoll.percentage).toBe(0);
    expect(lowRoll.ratingLabel).toBe('Low');
    expect(lowRoll.tierText).toBeUndefined();

    // 53 out of 50-54 -> 75% -> 'High'
    const highRoll = calculateRollRating(53, 50, 54);
    expect(highRoll.percentage).toBe(75);
    expect(highRoll.ratingLabel).toBe('High');
  });

  it('handles flat value without min/max range', () => {
    const flat = calculateRollRating(30);
    expect(flat.percentage).toBe(100);
    expect(flat.ratingLabel).toBe('None');
  });

  it('handles undefined values safely', () => {
    const empty = calculateRollRating(undefined, undefined, undefined);
    expect(empty.percentage).toBe(0);
    expect(empty.ratingLabel).toBe('None');
  });

  it('handles equal min and max correctly', () => {
    const singleVal = calculateRollRating(10, 10, 10);
    expect(singleVal.percentage).toBe(100);
    expect(singleVal.ratingLabel).toBe('Max');
  });
});
