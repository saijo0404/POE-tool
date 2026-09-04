import { describe, it, expect } from 'vitest';
import { evaluateGearPotential } from '../gearInspector';
import type { ParsedItem } from '../../../types/poe';

describe('gearInspector (Issue #92)', () => {
  const createMockItem = (overrides: Partial<ParsedItem> = {}): ParsedItem => ({
    name: '狂風 穿行者',
    baseType: 'Two-Toned Boots (雙色鞋)',
    rarity: 'Rare',
    itemClass: 'boots',
    itemLevel: 86,
    language: 'zh',
    implicits: [
      {
        id: 'imp-1',
        text: '+12% 火焰與冰冷抗性',
        englishText: '+12% to Fire and Cold Resistances',
        type: 'implicit',
        enabled: true
      }
    ],
    explicits: [],
    rawText: '',
    ...overrides
  });

  it('correctly classifies prefixes, suffixes and open crafting spaces for god-tier boots', () => {
    const item = createMockItem({
      explicits: [
        {
          id: 'exp-1',
          text: '+125 最大生命',
          englishText: '+125 to Maximum Life',
          type: 'explicit',
          tier: 1,
          enabled: true
        },
        {
          id: 'exp-2',
          text: '35% 增加移動速度',
          englishText: '35% increased Movement Speed',
          type: 'explicit',
          tier: 1,
          enabled: true
        },
        {
          id: 'exp-3',
          text: '+48% 火焰抗性',
          englishText: '+48% to Fire Resistance',
          type: 'explicit',
          tier: 1,
          enabled: true
        }
      ]
    });

    const report = evaluateGearPotential(item);

    expect(report.prefixes.length).toBe(2);
    expect(report.suffixes.length).toBe(1);
    expect(report.spaces.openPrefixes).toBe(1);
    expect(report.spaces.openSuffixes).toBe(2);
    expect(report.spaces.hasCraftedMod).toBe(false);
    expect(report.spaces.canCraftBenchMod).toBe(true);
    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.grade).toBe('S');
    expect(report.isHighValueBase).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it('detects fractured mods and factors into potential score', () => {
    const item = createMockItem({
      explicits: [
        {
          id: 'frac-1',
          text: '+48% 火焰抗性 (fractured)',
          englishText: '+48% to Fire Resistance (fractured)',
          type: 'fractured',
          tier: 1,
          enabled: true
        }
      ]
    });

    const report = evaluateGearPotential(item);

    expect(report.spaces.hasFracturedMod).toBe(true);
    expect(report.suffixes.some(s => s.type === 'fractured')).toBe(true);
    expect(report.spaces.openSuffixes).toBe(2);
  });

  it('detects full 6-affix item with zero open crafting slots', () => {
    const item = createMockItem({
      explicits: [
        { id: '1', text: '+120 最大生命', englishText: '+120 to Maximum Life', type: 'explicit', tier: 1, enabled: true },
        { id: '2', text: '30% 移動速度', englishText: '30% increased Movement Speed', type: 'explicit', tier: 2, enabled: true },
        { id: '3', text: '+30 最大魔力', englishText: '+30 to Maximum Mana', type: 'explicit', tier: 5, enabled: true },
        { id: '4', text: '+45% 火抗', englishText: '+45% to Fire Resistance', type: 'explicit', tier: 2, enabled: true },
        { id: '5', text: '+42% 冰抗', englishText: '+42% to Cold Resistance', type: 'explicit', tier: 2, enabled: true },
        { id: '6', text: '+35% 電抗', englishText: '+35% to Lightning Resistance', type: 'explicit', tier: 3, enabled: true }
      ]
    });

    const report = evaluateGearPotential(item);

    expect(report.spaces.openPrefixes).toBe(0);
    expect(report.spaces.openSuffixes).toBe(0);
    expect(report.spaces.canCraftBenchMod).toBe(false);
  });

  it('identifies crafted bench mods preventing further bench crafts', () => {
    const item = createMockItem({
      explicits: [
        { id: '1', text: '+120 最大生命', englishText: '+120 to Maximum Life', type: 'explicit', tier: 1, enabled: true },
        { id: '2', text: '+25% 冰冷與混沌抗性 (crafted)', englishText: '+25% to Cold and Chaos Resistances (crafted)', type: 'crafted', enabled: true }
      ]
    });

    const report = evaluateGearPotential(item);

    expect(report.spaces.hasCraftedMod).toBe(true);
    expect(report.spaces.canCraftBenchMod).toBe(false);
  });

  it('handles empty explicits or non-rare items safely', () => {
    const normalItem = createMockItem({ rarity: 'Normal', explicits: [] });
    const report = evaluateGearPotential(normalItem);

    expect(report.score).toBe(0);
    expect(report.grade).toBe('C');
    expect(report.isHighValueBase).toBe(false);
  });
});
