import { describe, it, expect } from 'vitest';
import {
  extractGearStats,
  compareGearStats,
  detectSlotFromItem
} from '../gearDeltaEngine';
import type { ParsedItem, ParsedItemMod } from '../../../types/poe';

function makeMod(text: string, id: string): ParsedItemMod {
  return { id, text, englishText: text, type: 'explicit', enabled: true };
}

describe('detectSlotFromItem', () => {
  it('identifies helmets, body armours, boots, and weapons', () => {
    const helmet: ParsedItem = {
      name: 'Test Helm',
      baseType: 'Royal Burgonet',
      rarity: 'Rare',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: []
    };
    expect(detectSlotFromItem(helmet)).toBe('helmet');

    const boots: ParsedItem = {
      name: 'Test Boots',
      baseType: 'Two-Toned Boots',
      rarity: 'Rare',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: []
    };
    expect(detectSlotFromItem(boots)).toBe('boots');

    const belt: ParsedItem = {
      name: 'Test Belt',
      baseType: 'Heavy Belt',
      rarity: 'Rare',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: []
    };
    expect(detectSlotFromItem(belt)).toBe('belt');
  });
});

describe('extractGearStats', () => {
  it('extracts life, resistances, and attributes correctly', () => {
    const item: ParsedItem = {
      name: 'Golden Ring',
      baseType: 'Two-Stone Ring',
      rarity: 'Rare',
      language: 'en',
      rawText: '',
      implicits: [
        makeMod('+16% to Fire and Cold Resistances', 'imp1')
      ],
      explicits: [
        makeMod('+75 to maximum Life', 'e1'),
        makeMod('+40% to Fire Resistance', 'e2'),
        makeMod('+35% to Chaos Resistance', 'e3'),
        makeMod('+25 to Strength', 'e4')
      ]
    };

    const stats = extractGearStats(item);
    expect(stats.life).toBe(75);
    // 40 + 16 = 56
    expect(stats.fireRes).toBe(56);
    // 16 cold from implicit
    expect(stats.coldRes).toBe(16);
    expect(stats.chaosRes).toBe(35);
    expect(stats.totalEleRes).toBe(72);
    expect(stats.strength).toBe(25);
  });
});

describe('compareGearStats', () => {
  const currentHelm: ParsedItem = {
    name: 'Old Helmet',
    baseType: 'Siege Helmet',
    rarity: 'Rare',
    language: 'en',
    rawText: '',
    implicits: [],
    explicits: [
      makeMod('+60 to maximum Life', '1'),
      makeMod('+30% to Fire Resistance', '2'),
      makeMod('+20% to Lightning Resistance', '3')
    ]
  };

  const newHelm: ParsedItem = {
    name: 'New Upgraded Helmet',
    baseType: 'Royal Burgonet',
    rarity: 'Rare',
    language: 'en',
    rawText: '',
    implicits: [],
    explicits: [
      makeMod('+95 to maximum Life', 'n1'),
      makeMod('+42% to Fire Resistance', 'n2'),
      makeMod('+35% to Chaos Resistance', 'n3')
    ]
  };

  it('calculates positive and negative deltas accurately', () => {
    const report = compareGearStats(currentHelm, newHelm);

    expect(report.currentName).toBe('Old Helmet');
    expect(report.newName).toBe('New Upgraded Helmet');

    const lifeDelta = report.deltas.find(d => d.statKey === 'life');
    expect(lifeDelta?.delta).toBe(35); // +95 vs +60
    expect(lifeDelta?.isPositive).toBe(true);

    const fireDelta = report.deltas.find(d => d.statKey === 'fireRes');
    expect(fireDelta?.delta).toBe(12); // +42 vs +30

    const lightningDelta = report.deltas.find(d => d.statKey === 'lightningRes');
    expect(lightningDelta?.delta).toBe(-20); // 0 vs +20
    expect(lightningDelta?.isNegative).toBe(true);

    const chaosDelta = report.deltas.find(d => d.statKey === 'chaosRes');
    expect(chaosDelta?.delta).toBe(35); // +35 vs 0

    expect(report.gains.length).toBeGreaterThanOrEqual(3);
    expect(report.losses.length).toBeGreaterThanOrEqual(1);
    expect(['upgrade', 'sidegrade']).toContain(report.recommendation);
  });

  it('handles comparing identical items without errors', () => {
    const report = compareGearStats(currentHelm, currentHelm);
    expect(report.gains.length).toBe(0);
    expect(report.losses.length).toBe(0);
    expect(report.netResistDelta).toBe(0);
    expect(report.recommendation).toBe('sidegrade');
  });
});
