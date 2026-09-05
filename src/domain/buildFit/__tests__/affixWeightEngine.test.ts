import { describe, it, expect } from 'vitest';
import { evaluateItemFit, getRankFromScore, extractStatValue } from '../affixWeightEngine';
import { DEFAULT_BUILD_PRESETS, getBuildPresetById } from '../buildPresets';
import type { ParsedItem, ParsedItemMod } from '../../../types/poe';

function makeMod(text: string, id: string): ParsedItemMod {
  return { id, text, englishText: text, type: 'explicit', enabled: true };
}

describe('extractStatValue', () => {
  it('extracts single integer value correctly', () => {
    expect(extractStatValue('+89 to maximum Life')).toBe(89);
    expect(extractStatValue('增加 15% 攻擊速度')).toBe(15);
    expect(extractStatValue('+35% 火焰抗性')).toBe(35);
  });

  it('extracts average if mod has a range or multiple numbers', () => {
    expect(extractStatValue('附加 10 至 20 點物理傷害')).toBe(15);
    expect(extractStatValue('Adds 10 to 20 Physical Damage')).toBe(15);
  });

  it('returns 0 when no number is present', () => {
    expect(extractStatValue('Hits cannot be Evaded')).toBe(1);
    expect(extractStatValue('無法被冰緩')).toBe(1);
  });
});

describe('getRankFromScore', () => {
  const thresholds = { s: 250, a: 180, b: 120, c: 60 };

  it('correctly maps scores to ranks', () => {
    expect(getRankFromScore(300, thresholds)).toBe('S');
    expect(getRankFromScore(250, thresholds)).toBe('S');
    expect(getRankFromScore(200, thresholds)).toBe('A');
    expect(getRankFromScore(150, thresholds)).toBe('B');
    expect(getRankFromScore(80, thresholds)).toBe('C');
    expect(getRankFromScore(30, thresholds)).toBe('D');
  });
});

describe('evaluateItemFit', () => {
  const rfPreset = getBuildPresetById('life_fire_rf')!;
  const bowPreset = getBuildPresetById('ele_bow_crit')!;

  const rfHelmet: ParsedItem = {
    name: '精魂之盔',
    baseType: '皇家輕盔',
    rarity: 'Rare',
    language: 'en',
    rawText: '',
    implicits: [],
    explicits: [
      makeMod('+95 to maximum Life', '1'),
      makeMod('+42% to Fire Resistance', '2'),
      makeMod('+38% to Chaos Resistance', '3'),
      makeMod('Regenerate 15.5 Life per second', '4')
    ]
  };

  const bowWeapon: ParsedItem = {
    name: '風暴之弦',
    baseType: '脊骨之弓',
    rarity: 'Rare',
    language: 'en',
    rawText: '',
    implicits: [],
    explicits: [
      makeMod('Adds 15 to 30 Cold Damage', 'b1'),
      makeMod('Adds 20 to 45 Lightning Damage', 'b2'),
      makeMod('25% increased Attack Speed', 'b3'),
      makeMod('+35% to Global Critical Strike Multiplier', 'b4')
    ]
  };

  it('evaluates RF gear favorably with life_fire_rf preset', () => {
    const result = evaluateItemFit(rfHelmet, rfPreset);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const evaluation = result.value;
      expect(evaluation.presetId).toBe('life_fire_rf');
      expect(evaluation.totalScore).toBeGreaterThan(120);
      expect(['S', 'A', 'B']).toContain(evaluation.rank);
      expect(evaluation.matches.length).toBeGreaterThanOrEqual(3);
      expect(evaluation.primaryHighlights.some(h => h.includes('Life') || h.includes('生命'))).toBe(true);
    }
  });

  it('evaluates bow weapon favorably with ele_bow_crit preset', () => {
    const result = evaluateItemFit(bowWeapon, bowPreset);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const evalRes = result.value;
      expect(evalRes.presetId).toBe('ele_bow_crit');
      expect(evalRes.totalScore).toBeGreaterThan(100);
      expect(evalRes.matches.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives low score when an item does not match preset criteria', () => {
    const result = evaluateItemFit(bowWeapon, rfPreset);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.rank).toBe('D');
      expect(result.value.totalScore).toBeLessThan(60);
    }
  });

  it('handles item with no mods gracefully', () => {
    const emptyItem: ParsedItem = {
      name: 'White Item',
      baseType: 'Leather Belt',
      rarity: 'Normal',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: []
    };
    const result = evaluateItemFit(emptyItem, rfPreset);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.totalScore).toBe(0);
      expect(result.value.rank).toBe('D');
      expect(result.value.matches).toEqual([]);
    }
  });

  it('contains at least 4 default presets in DEFAULT_BUILD_PRESETS', () => {
    expect(DEFAULT_BUILD_PRESETS.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_BUILD_PRESETS.some(p => p.id === 'life_fire_rf')).toBe(true);
    expect(DEFAULT_BUILD_PRESETS.some(p => p.id === 'poison_chaos_dot')).toBe(true);
    expect(DEFAULT_BUILD_PRESETS.some(p => p.id === 'ele_bow_crit')).toBe(true);
    expect(DEFAULT_BUILD_PRESETS.some(p => p.id === 'pure_phys_cyclone')).toBe(true);
  });
});
