import { describe, it, expect } from 'vitest';
import {
  encodeAtlasStrategyShareCode,
  decodeAtlasStrategyShareCode
} from '../atlasShareCodec';
import {
  COMMUNITY_STRATEGIES,
  calculateBulkShoppingList
} from '../communityStrategies';
import type { AtlasStrategy } from '../types';

describe('atlasShareCodec (Issue #93)', () => {
  const mockStrategy: AtlasStrategy = {
    id: 'strat-original',
    name: '軍團沙丘極速發家配置',
    category: 'legion',
    description: '沙丘地形開闊極易全清軍團，收益穩定高爆發',
    tags: ['軍團', '速刷', '培育器'],
    tiers: [
      {
        id: 'tier-1',
        name: '沙丘速刷 4 甲蟲配置',
        recommendedMaps: ['沙丘 (Dunes)'],
        coreKeystones: ['無盡渴望', '戰禍指引'],
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/BAAFABAA',
        mechanicNotes: '開啟軍團後優先擊殺軍團長與帶標誌怪物',
        scarabs: [
          { id: 's1', name: '軍團聖甲蟲', nameEn: 'Legion Scarab', count: 2, customPriceChaos: 5 },
          { id: 's2', name: '將領軍團聖甲蟲', nameEn: 'Legion Scarab of Officers', count: 1, customPriceChaos: 15 }
        ],
        extraItems: []
      }
    ],
    createdAt: 1000,
    updatedAt: 2000
  };

  it('encodes strategy to POEATLAS-v1- prefixed share code and decodes back', () => {
    const shareCode = encodeAtlasStrategyShareCode(mockStrategy);
    expect(shareCode).toMatch(/^POEATLAS-v1-[A-Za-z0-9_-]+/);

    const result = decodeAtlasStrategyShareCode(shareCode);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const decoded = result.value;
      expect(decoded.name).toBe('軍團沙丘極速發家配置');
      expect(decoded.category).toBe('legion');
      expect(decoded.tags).toEqual(['軍團', '速刷', '培育器']);
      expect(decoded.tiers.length).toBe(1);
      expect(decoded.tiers[0].recommendedMaps).toEqual(['沙丘 (Dunes)']);
      expect(decoded.tiers[0].scarabs.length).toBe(2);
      expect(decoded.id).not.toBe('strat-original'); // Generates fresh ID
    }
  });

  it('rejects invalid or corrupted share codes', () => {
    const invalidPrefix = decodeAtlasStrategyShareCode('INVALID-CODE-XYZ');
    expect(invalidPrefix.isErr()).toBe(true);

    const corruptedBase64 = decodeAtlasStrategyShareCode('POEATLAS-v1-@@@corrupted!!!');
    expect(corruptedBase64.isErr()).toBe(true);

    const invalidJson = decodeAtlasStrategyShareCode('POEATLAS-v1-bm90IGEganNvbg=='); // 'not a json'
    expect(invalidJson.isErr()).toBe(true);
  });

  it('calculates bulk shopping list for 50 runs', () => {
    const shopping = calculateBulkShoppingList(mockStrategy, 50);
    expect(shopping.totalRuns).toBe(50);
    expect(shopping.totalMaps).toBe(50);
    expect(shopping.scarabs.length).toBe(2);

    const normalLegion = shopping.scarabs.find(s => s.name === '軍團聖甲蟲');
    expect(normalLegion?.totalCount).toBe(100); // 2 * 50
    expect(normalLegion?.totalCostChaos).toBe(500); // 100 * 5

    expect(shopping.totalCostChaos).toBeGreaterThan(500);
  });

  it('provides curated community strategies with valid structures', () => {
    expect(COMMUNITY_STRATEGIES.length).toBeGreaterThanOrEqual(5);
    COMMUNITY_STRATEGIES.forEach(strat => {
      expect(strat.name).toBeDefined();
      expect(strat.category).toBeDefined();
      expect(strat.tiers.length).toBeGreaterThan(0);
      expect(strat.tiers[0].scarabs).toBeDefined();
    });
  });
});
