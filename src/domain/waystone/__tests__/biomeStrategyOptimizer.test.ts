import { describe, it, expect } from 'vitest';
import { optimizeBiomeStrategy } from '../biomeStrategyOptimizer';

describe('biomeStrategyOptimizer', () => {
  it('recommends gold strategy for Desert biome', () => {
    const rec = optimizeBiomeStrategy('desert', 'gold', 2);
    expect(rec.biome.id).toBe('desert');
    expect(rec.goal).toBe('gold');
    expect(rec.recommendedTabletIds).toContain('gold_bounty');
    expect(rec.expectedSynergyScore).toBeGreaterThanOrEqual(80);
    expect(rec.strategicAdviceZh).toContain('極致契合');
    expect(rec.estimatedYieldSummary.goldRating).toBeGreaterThanOrEqual(4);
  });

  it('recommends waystone progression strategy for Tundra biome', () => {
    const rec = optimizeBiomeStrategy('tundra', 'waystones', 2);
    expect(rec.biome.id).toBe('tundra');
    expect(rec.goal).toBe('waystones');
    expect(rec.recommendedTabletIds).toContain('waystone_surveyor');
    expect(rec.expectedSynergyScore).toBeGreaterThanOrEqual(80);
    expect(rec.recommendedWaystoneAffixesZh.some(a => a.includes('Waystone Drop Chance'))).toBe(true);
  });

  it('recommends rune strategy for Volcanic caldera biome', () => {
    const rec = optimizeBiomeStrategy('volcanic', 'runes', 3);
    expect(rec.biome.id).toBe('volcanic');
    expect(rec.goal).toBe('runes');
    expect(rec.recommendedTabletIds).toContain('runic_essence');
    expect(rec.expectedSynergyScore).toBe(100);
  });

  it('evaluates non-matching biome with secondary advice and lower synergy score', () => {
    // Tundra is best for waystones, not gold
    const rec = optimizeBiomeStrategy('tundra', 'gold', 1);
    expect(rec.expectedSynergyScore).toBeLessThan(80);
    expect(rec.strategicAdviceZh).toContain('次選策略');
  });

  it('provides yield ratings between 1 and 5 for all summary categories', () => {
    const rec = optimizeBiomeStrategy('jungle', 'mechanics', 2);
    expect(rec.estimatedYieldSummary.goldRating).toBeGreaterThanOrEqual(1);
    expect(rec.estimatedYieldSummary.goldRating).toBeLessThanOrEqual(5);
    expect(rec.estimatedYieldSummary.currencyRating).toBeGreaterThanOrEqual(1);
    expect(rec.estimatedYieldSummary.currencyRating).toBeLessThanOrEqual(5);
    expect(rec.estimatedYieldSummary.progressionRating).toBeGreaterThanOrEqual(1);
    expect(rec.estimatedYieldSummary.progressionRating).toBeLessThanOrEqual(5);
  });
});
