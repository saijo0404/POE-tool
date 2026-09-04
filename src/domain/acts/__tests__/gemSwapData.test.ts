import { describe, it, expect } from 'vitest';
import {
  GEM_SWAP_MILESTONES,
  getGemSwapMilestonesByClass,
  getGemSwapMilestonesByLevel,
  getAttributeWarningForGem
} from '../gemSwapData';
import type { CharacterClass } from '../types';

describe('gemSwapData (Issue #94)', () => {
  const classes: CharacterClass[] = ['witch', 'ranger', 'marauder', 'shadow', 'duelist', 'templar', 'scion'];

  it('contains comprehensive milestones for all 7 classes at key leveling brackets', () => {
    expect(GEM_SWAP_MILESTONES.length).toBeGreaterThanOrEqual(21); // 7 classes * 3 levels

    classes.forEach(cls => {
      const milestones = getGemSwapMilestonesByClass(cls);
      expect(milestones.length).toBe(3);

      const levels = milestones.map(m => m.level);
      expect(levels).toEqual([12, 28, 38]);

      milestones.forEach(m => {
        expect(m.characterClass).toBe(cls);
        expect(m.archetypeName.length).toBeGreaterThan(0);
        expect(m.gearResistanceTarget.length).toBeGreaterThan(0);
        expect(m.gems.length).toBeGreaterThan(0);

        m.gems.forEach(gem => {
          expect(gem.name.length).toBeGreaterThan(0);
          expect(gem.sourceNpc.length).toBeGreaterThan(0);
          expect(gem.recommendedColors.length).toBeGreaterThan(0);
        });
      });
    });
  });

  it('filters milestones by level accurately', () => {
    const lv12Milestones = getGemSwapMilestonesByLevel(12);
    expect(lv12Milestones.length).toBe(7);
    expect(lv12Milestones.every(m => m.level === 12)).toBe(true);

    const lv28Milestones = getGemSwapMilestonesByLevel(28);
    expect(lv28Milestones.length).toBe(7);
    expect(lv28Milestones.every(m => m.level === 28)).toBe(true);

    const lv38Milestones = getGemSwapMilestonesByLevel(38);
    expect(lv38Milestones.length).toBe(7);
    expect(lv38Milestones.every(m => m.level === 38)).toBe(true);
  });

  it('generates attribute requirement warnings for off-stat gems', () => {
    // Witch needing Dex/Str
    const witchDexWarning = getAttributeWarningForGem('witch', 'dexterity', 33);
    expect(witchDexWarning).toContain('敏捷');
    expect(witchDexWarning).toMatch(/護身符/);

    const witchStrWarning = getAttributeWarningForGem('witch', 'strength', 35);
    expect(witchStrWarning).toContain('力量');

    // Witch needing Int should not trigger warning
    const witchIntWarning = getAttributeWarningForGem('witch', 'intelligence', 35);
    expect(witchIntWarning).toBeNull();

    // Marauder needing Int
    const marauderIntWarning = getAttributeWarningForGem('marauder', 'intelligence', 33);
    expect(marauderIntWarning).toContain('智慧');

    // Marauder needing Str should not trigger warning
    const marauderStrWarning = getAttributeWarningForGem('marauder', 'strength', 50);
    expect(marauderStrWarning).toBeNull();

    // Ranger needing Str
    const rangerStrWarning = getAttributeWarningForGem('ranger', 'strength', 35);
    expect(rangerStrWarning).toContain('力量');
  });
});
