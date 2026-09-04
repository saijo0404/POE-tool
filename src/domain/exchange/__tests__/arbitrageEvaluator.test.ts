import { describe, it, expect } from 'vitest';
import { evaluateArbitrage, findArbitrageOpportunities } from '../arbitrageEvaluator';
import type { ExchangeItem } from '../types';

describe('arbitrageEvaluator Domain Logic', () => {
  const divineRate = 150;

  it('detects BUY_FAUSTUS_SELL_TRADE when Faustus price is significantly lower than Trade price', () => {
    // Faustus: 80 Chaos, Trade: 100 Chaos -> Profit ~ 20 Chaos (minus gold fee)
    const result = evaluateArbitrage({
      itemId: 'scarab-1',
      itemName: 'Divination Scarab',
      category: 'Scarab',
      icon: '',
      faustusPriceChaos: 80,
      tradePriceChaos: 100,
      goldCostPerUnit: 100,
      volume24h: 500,
      divineRate,
    });

    expect(result).not.toBeNull();
    if (result) {
      expect(result.direction).toBe('BUY_FAUSTUS_SELL_TRADE');
      expect(result.profitChaos).toBeCloseTo(16, 0); // 20 - (100 gold ~ 4c)
      expect(result.roiPercent).toBeGreaterThan(15);
      expect(result.recommendation).toContain('Faustus 交易所買入');
    }
  });

  it('detects BUY_TRADE_SELL_FAUSTUS when Trade price is lower than Faustus price', () => {
    // Trade: 50 Chaos, Faustus: 70 Chaos -> Profit ~ 20 Chaos
    const result = evaluateArbitrage({
      itemId: 'essence-1',
      itemName: 'Deafening Essence of Greed',
      category: 'Essence',
      icon: '',
      faustusPriceChaos: 70,
      tradePriceChaos: 50,
      goldCostPerUnit: 75,
      volume24h: 800,
      divineRate,
    });

    expect(result).not.toBeNull();
    if (result) {
      expect(result.direction).toBe('BUY_TRADE_SELL_FAUSTUS');
      expect(result.profitChaos).toBeGreaterThan(10);
      expect(result.roiPercent).toBeGreaterThan(20);
      expect(result.recommendation).toContain('市集直購');
    }
  });

  it('filters out opportunities with negligible profit or negative ROI', () => {
    const result = evaluateArbitrage({
      itemId: 'c-1',
      itemName: 'Orb of Alteration',
      category: 'Currency',
      icon: '',
      faustusPriceChaos: 5.0,
      tradePriceChaos: 5.1,
      goldCostPerUnit: 15,
      volume24h: 1000,
      divineRate,
    });

    // 0.1 Chaos diff minus gold cost yields negligible or zero net profit
    expect(result).toBeNull();
  });

  it('finds and sorts top arbitrage opportunities from an item list', () => {
    const mockItems: ExchangeItem[] = [
      {
        id: 'item-1',
        name: 'Item High Profit',
        category: 'Scarab',
        icon: '',
        primaryValue: 50,
        secondaryValue: 50 / divineRate,
        tradePriceChaos: 80, // +30c
        volume24h: 200,
        maxVolumeCurrency: 'chaos',
        maxVolumeRate: 50,
        goldCostPerUnit: 50,
      },
      {
        id: 'item-2',
        name: 'Item Low Profit',
        category: 'Essence',
        icon: '',
        primaryValue: 10,
        secondaryValue: 10 / divineRate,
        tradePriceChaos: 12, // +2c
        volume24h: 300,
        maxVolumeCurrency: 'chaos',
        maxVolumeRate: 10,
        goldCostPerUnit: 25,
      },
      {
        id: 'item-3',
        name: 'Item No Diff',
        category: 'Currency',
        icon: '',
        primaryValue: 100,
        secondaryValue: 100 / divineRate,
        tradePriceChaos: 100,
        volume24h: 500,
        maxVolumeCurrency: 'chaos',
        maxVolumeRate: 100,
        goldCostPerUnit: 25,
      },
    ];

    const opps = findArbitrageOpportunities(mockItems, divineRate, 5, 50);
    expect(opps.length).toBeGreaterThanOrEqual(1);
    expect(opps[0].itemId).toBe('item-1');
    expect(opps[0].profitChaos).toBeGreaterThan(20);
  });
});
