import { describe, it, expect } from 'vitest';
import { calculatePseudoStats } from '../pseudoStats';
import type { ParsedItem, ParsedItemMod } from '../../item/types';

describe('calculatePseudoStats', () => {
  it('aggregates elemental resistances into total elemental resistance and total resistance', () => {
    const explicits: ParsedItemMod[] = [
      {
        id: 'explicit.stat_3372524247',
        text: '+30% 火焰抗性',
        englishText: '+30% to Fire Resistance',
        type: 'explicit',
        tier: 4,
        value: 30,
        minValue: 30,
        maxValue: 35,
        enabled: true
      },
      {
        id: 'explicit.stat_4220027924',
        text: '+25% 冰冷抗性',
        englishText: '+25% to Cold Resistance',
        type: 'explicit',
        tier: 5,
        value: 25,
        minValue: 25,
        maxValue: 29,
        enabled: true
      },
      {
        id: 'explicit.stat_1671376347',
        text: '+40% 閃電抗性',
        englishText: '+40% to Lightning Resistance',
        type: 'explicit',
        tier: 2,
        value: 40,
        minValue: 40,
        maxValue: 45,
        enabled: true
      },
      {
        id: 'explicit.stat_2923486250',
        text: '+20% 混沌抗性',
        englishText: '+20% to Chaos Resistance',
        type: 'explicit',
        tier: 3,
        value: 20,
        minValue: 20,
        maxValue: 25,
        enabled: true
      }
    ];

    const item: ParsedItem = {
      name: '暴怒 避難所',
      baseType: '罪魔邪冠',
      rarity: 'Rare',
      language: 'zh',
      rawText: '',
      implicits: [],
      explicits
    };

    const pseudos = calculatePseudoStats(item);

    const totalEle = pseudos.find(p => p.id === 'pseudo.pseudo_total_elemental_resistance');
    expect(totalEle).toBeDefined();
    expect(totalEle?.value).toBe(95); // 30 + 25 + 40
    expect(totalEle?.text).toBe('+#% 總元素抗性 (Pseudo)');
    expect(totalEle?.englishText).toBe('+#% total Elemental Resistance');
    expect(totalEle?.type).toBe('pseudo');

    const totalRes = pseudos.find(p => p.id === 'pseudo.pseudo_total_resistance');
    expect(totalRes).toBeDefined();
    expect(totalRes?.value).toBe(115); // 95 + 20
    expect(totalRes?.text).toBe('+#% 總抗性 (Pseudo)');
  });

  it('correctly calculates dual resistances and all elemental resistance', () => {
    const explicits: ParsedItemMod[] = [
      {
        id: 'explicit.stat_dual_fire_cold',
        text: '+15% 火焰與冰冷抗性',
        englishText: '+15% to Fire and Cold Resistances',
        type: 'explicit',
        value: 15,
        enabled: true
      },
      {
        id: 'explicit.stat_2901986750',
        text: '+10% 全部元素抗性',
        englishText: '+10% to all Elemental Resistances',
        type: 'explicit',
        value: 10,
        enabled: true
      }
    ];

    const item: ParsedItem = {
      name: 'Rare Ring',
      baseType: 'Two-Stone Ring',
      rarity: 'Rare',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits
    };

    const pseudos = calculatePseudoStats(item);
    const totalEle = pseudos.find(p => p.id === 'pseudo.pseudo_total_elemental_resistance');
    expect(totalEle).toBeDefined();
    // Dual gives 15*2 = 30. All ele gives 10*3 = 30. Total = 60
    expect(totalEle?.value).toBe(60);
  });

  it('aggregates maximum life and energy shield from implicits and explicits', () => {
    const item: ParsedItem = {
      name: 'Rare Boots',
      baseType: 'Two-Toned Boots',
      rarity: 'Rare',
      language: 'zh',
      rawText: '',
      implicits: [
        {
          id: 'implicit.stat_life',
          text: '+20 最大生命',
          englishText: '+20 to maximum Life',
          type: 'implicit',
          value: 20,
          enabled: false
        }
      ],
      explicits: [
        {
          id: 'explicit.stat_3299347043',
          text: '+75 最大生命',
          englishText: '+75 to maximum Life',
          type: 'explicit',
          tier: 2,
          value: 75,
          enabled: true
        },
        {
          id: 'explicit.stat_4052037485',
          text: '+45 最大能量護盾',
          englishText: '+45 to maximum Energy Shield',
          type: 'explicit',
          value: 45,
          enabled: true
        }
      ]
    };

    const pseudos = calculatePseudoStats(item);

    const totalLife = pseudos.find(p => p.id === 'pseudo.pseudo_total_life');
    expect(totalLife).toBeDefined();
    expect(totalLife?.value).toBe(95); // 20 + 75

    const totalEs = pseudos.find(p => p.id === 'pseudo.pseudo_total_energy_shield');
    expect(totalEs).toBeDefined();
    expect(totalEs?.value).toBe(45);
  });
});
