import { describe, it, expect } from 'vitest';
import type {
  AtlasNode,
  AtlasNodeType,
  AtlasMechanicCategory,
  AtlasDecodedTree,
  AtlasStrategyTier,
  AtlasStrategy,
  AtlasCalculationSummary,
  BatchItemRequirement,
  AtlasTierScarab,
  AtlasTierExtraItem,
  AggregatedStatItem,
  AtlasTreeStatsSummary,
  CategoryMetadata,
  AtlasCategoryKey
} from '../poe';
import {
  MAX_ATLAS_POINTS,
  ATLAS_ORIGIN_NODE_ID,
  ATLAS_CATEGORIES_METADATA,
  getCategoryMetadata
} from '../poe';

describe('types/poe centralized exports', () => {
  it('exports atlas domain constants and metadata correctly', () => {
    expect(MAX_ATLAS_POINTS).toBe(138);
    expect(ATLAS_ORIGIN_NODE_ID).toBe('29045');
    expect(ATLAS_CATEGORIES_METADATA).toBeDefined();
    expect(typeof getCategoryMetadata).toBe('function');

    const meta = getCategoryMetadata('essence');
    expect(meta.label).toBe('精髓');
  });

  it('allows type checking against atlas domain types', () => {
    const nodeType: AtlasNodeType = 'start';
    const category: AtlasMechanicCategory = 'general';
    const categoryKey: AtlasCategoryKey = 'essence';
    const meta: CategoryMetadata = ATLAS_CATEGORIES_METADATA[categoryKey];
    expect(meta.labelEn).toBe('Essence');

    const node: AtlasNode = {
      id: '29045',
      numId: 29045,
      name: '輿圖起點',
      nameEn: 'Atlas Origin',
      type: nodeType,
      category,
      description: '起點',
      stats: [],
      x: 0,
      y: 0,
      connections: []
    };

    expect(node.id).toBe('29045');
    expect(node.type).toBe('start');

    const decodedTree: AtlasDecodedTree = {
      version: 1,
      nodeIds: ['29045'],
      numIds: [29045],
      unmatchedNumIds: []
    };
    expect(decodedTree.nodeIds.length).toBe(1);

    const scarab: AtlasTierScarab = { id: 's1', name: 'Scarab', count: 1 };
    const extraItem: AtlasTierExtraItem = { id: 'e1', name: 'Map', category: 'map', count: 1 };
    const tier: AtlasStrategyTier = {
      id: 't1',
      name: 'Tier 1',
      recommendedMaps: ['Dunes'],
      coreKeystones: [],
      scarabs: [scarab],
      extraItems: [extraItem]
    };
    const strategy: AtlasStrategy = {
      id: 'strat1',
      name: 'Strategy 1',
      category: 'essence',
      description: 'Desc',
      tags: ['essence'],
      tiers: [tier]
    };
    expect(strategy.tiers.length).toBe(1);

    const batchItem: BatchItemRequirement = {
      name: 'Scarab',
      category: 'scarab',
      unitCount: 1,
      totalCount: 10,
      unitPriceChaos: 5,
      totalCostChaos: 50,
      totalCostDivine: 0.33
    };
    const calculationSummary: AtlasCalculationSummary = {
      scarabCostChaos: 5,
      extraItemCostChaos: 0,
      totalCostChaosPerMap: 5,
      totalCostDivinePerMap: 0.03,
      revenueChaosPerMap: 20,
      revenueDivinePerMap: 0.13,
      netProfitChaosPerMap: 15,
      netProfitDivinePerMap: 0.1,
      roiPercentage: 300,
      mapsPerHour: 20,
      hourlyRevenueChaos: 400,
      hourlyRevenueDivine: 2.66,
      hourlyProfitChaos: 300,
      hourlyProfitDivine: 2,
      batchSize: 10,
      batchTotalCostChaos: 50,
      batchTotalCostDivine: 0.33,
      batchTotalProfitChaos: 150,
      batchTotalProfitDivine: 1,
      batchItems: [batchItem]
    };
    expect(calculationSummary.batchSize).toBe(10);

    const statItem: AggregatedStatItem = { text: 'Chance', textEn: 'Chance', count: 1 };
    const statsSummary: AtlasTreeStatsSummary = {
      pointsSpent: 1,
      activeKeystones: [],
      statsList: ['Chance'],
      aggregatedStats: [statItem],
      categoryCounts: { essence: 1 }
    };
    expect(statsSummary.pointsSpent).toBe(1);
  });
});
