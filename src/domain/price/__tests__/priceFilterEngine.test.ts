import { describe, it, expect } from 'vitest';
import { analyzeMarketPrices, calculatePercentile } from '../priceFilterEngine';
import type { TradeListing } from '../../../types/poe';

function mockListing(amount: number, currency: string = 'chaos'): TradeListing {
  const isDivine = currency.toLowerCase() === 'divine';
  return {
    id: `listing-${Math.random()}`,
    whisper: '@test',
    onlineStatus: 'online',
    priceAmount: amount,
    priceCurrency: currency,
    priceInChaos: isDivine ? amount * 150 : amount,
    priceInDivine: isDivine ? amount : amount / 150,
    indexed: '2026-09-05T00:00:00Z',
    item: {
      name: 'Test Item',
      typeLine: 'Test Base',
      icon: ''
    }
  };
}

describe('calculatePercentile', () => {
  it('computes 25th, 50th, and 75th percentiles correctly', () => {
    const sorted = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(calculatePercentile(sorted, 0.5)).toBe(55);
    expect(calculatePercentile(sorted, 0.25)).toBe(32.5);
    expect(calculatePercentile(sorted, 0.75)).toBe(77.5);
  });

  it('handles single element array', () => {
    expect(calculatePercentile([50], 0.5)).toBe(50);
  });

  it('returns 0 for empty array', () => {
    expect(calculatePercentile([], 0.5)).toBe(0);
  });
});

describe('analyzeMarketPrices', () => {
  it('handles empty listings array gracefully', () => {
    const res = analyzeMarketPrices([]);
    expect(res.sampleCount).toBe(0);
    expect(res.confidenceLevel).toBe('low');
    expect(res.suggestedFairPriceChaos).toBe(0);
    expect(res.hasPriceFixing).toBe(false);
  });

  it('handles small sample size (N < 4) with low confidence without throwing', () => {
    const listings = [mockListing(10), mockListing(12)];
    const res = analyzeMarketPrices(listings);
    expect(res.sampleCount).toBe(2);
    expect(res.confidenceLevel).toBe('low');
    expect(res.suggestedFairPriceChaos).toBe(11);
    expect(res.priceFixingCount).toBe(0);
  });

  it('handles all identical prices without division by zero', () => {
    const listings = [
      mockListing(50), mockListing(50), mockListing(50),
      mockListing(50), mockListing(50), mockListing(50)
    ];
    const res = analyzeMarketPrices(listings);
    expect(res.sampleCount).toBe(6);
    expect(res.medianChaos).toBe(50);
    expect(res.suggestedFairPriceChaos).toBe(50);
    expect(res.priceFixingCount).toBe(0);
    expect(res.highOutlierCount).toBe(0);
  });

  it('detects and filters lower price-fixing outliers using IQR', () => {
    // 3 obvious price-fixers at 5c, 10c, 12c, while normal prices are 80c, 85c, 90c, 92c, 95c, 100c, 105c, 110c
    const listings = [
      mockListing(5), mockListing(10), mockListing(12),
      mockListing(80), mockListing(85), mockListing(90), mockListing(92),
      mockListing(95), mockListing(100), mockListing(105), mockListing(110)
    ];
    const res = analyzeMarketPrices(listings);

    expect(res.sampleCount).toBe(11);
    expect(res.priceFixingCount).toBeGreaterThanOrEqual(2);
    expect(res.hasPriceFixing).toBe(true);
    expect(res.warningMessage).toContain('壓價');
    // Suggested fair price should reflect the true market (~90-95c), not the 5-10c fixers
    expect(res.suggestedFairPriceChaos).toBeGreaterThanOrEqual(85);
    expect(res.suggestedQuickSellChaos).toBeGreaterThanOrEqual(75);
  });

  it('filters upper extreme outliers', () => {
    // 8 normal listings around 20-30c, and 2 absurd listings at 800c and 1500c
    const listings = [
      mockListing(20), mockListing(22), mockListing(25), mockListing(26),
      mockListing(28), mockListing(30), mockListing(32), mockListing(35),
      mockListing(800), mockListing(1500)
    ];
    const res = analyzeMarketPrices(listings);

    expect(res.highOutlierCount).toBe(2);
    expect(res.suggestedFairPriceChaos).toBeLessThan(50);
    expect(res.suggestedFairPriceChaos).toBeGreaterThanOrEqual(24);
  });

  it('correctly converts mixed Divine and Chaos currencies', () => {
    // 1 divine = 150 chaos
    const listings = [
      mockListing(1, 'divine'),     // 150c
      mockListing(1.1, 'divine'),   // 165c
      mockListing(150, 'chaos'),    // 150c
      mockListing(160, 'chaos'),    // 160c
      mockListing(170, 'chaos')     // 170c
    ];
    const res = analyzeMarketPrices(listings, { divineChaosRate: 150 });

    expect(res.sampleCount).toBe(5);
    expect(res.suggestedFairPriceChaos).toBeGreaterThanOrEqual(150);
    expect(res.suggestedFairPriceChaos).toBeLessThanOrEqual(170);
    expect(res.suggestedFairPriceDivine).toBeCloseTo(1.07, 2);
  });
});
