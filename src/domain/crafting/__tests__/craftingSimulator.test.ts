import { describe, it, expect } from 'vitest';
import { simulateCraftRoll, simulateBatchCraft } from '../craftingSimulator';
import { CRAFT_BASES } from '../basesDatabase';
import { CRAFT_PRESETS } from '../craftingPresets';
import { CRAFT_MODS } from '../modDatabase';
import type { TargetModSelection } from '../types';

describe('craftingSimulator & Presets Domain Unit Tests', () => {
  const base = CRAFT_BASES.find(b => b.id === 'sadist_garb')!;

  it('should simulate a single craft roll within PoE rare bounds (4~6 affixes, max 3 prefix, max 3 suffix)', () => {
    const rolled = simulateCraftRoll({
      baseItem: base,
      ilvl: 86,
      method: 'chaos',
      targetMods: [{ modId: 'maximum_life', maxTier: 1 }],
      costPerAttempt: 1,
    });

    expect(rolled.attemptCount).toBe(1);
    expect(rolled.totalSpentChaos).toBe(1);
    expect(rolled.prefixes.length).toBeGreaterThanOrEqual(1);
    expect(rolled.prefixes.length).toBeLessThanOrEqual(3);
    expect(rolled.suffixes.length).toBeGreaterThanOrEqual(1);
    expect(rolled.suffixes.length).toBeLessThanOrEqual(3);

    const total = rolled.prefixes.length + rolled.suffixes.length;
    expect(total).toBeGreaterThanOrEqual(4);
    expect(total).toBeLessThanOrEqual(6);
  });

  it('should guarantee essence mod when using essence method', () => {
    const targetMods: TargetModSelection[] = [{ modId: 'maximum_life', maxTier: 1 }];
    const rolled = simulateCraftRoll({
      baseItem: base,
      ilvl: 86,
      method: 'essence',
      targetMods,
      costPerAttempt: 4,
    });

    expect(rolled.totalSpentChaos).toBe(4);
    const lifeMod = rolled.prefixes.find(p => p.modId === 'maximum_life');
    expect(lifeMod).toBeDefined();
    expect(lifeMod?.tier).toBe(1);
    expect(lifeMod?.isTargetHit).toBe(true);
  });

  it('should simulate batch craft until hit or max attempts reached', () => {
    const rolled = simulateBatchCraft(
      {
        baseItem: base,
        ilvl: 86,
        method: 'chaos',
        targetMods: [], // empty targets -> guaranteed hit on first roll
        costPerAttempt: 1,
      },
      10
    );

    expect(rolled.hitAllTargets).toBe(true);
    expect(rolled.attemptCount).toBe(1);
  });

  it('should validate that all craft presets have valid base items and target mods', () => {
    expect(CRAFT_PRESETS.length).toBeGreaterThanOrEqual(5);

    for (const preset of CRAFT_PRESETS) {
      const presetBase = CRAFT_BASES.find(b => b.id === preset.baseItemId);
      expect(presetBase).toBeDefined();
      expect(preset.targetMods.length).toBeGreaterThan(0);

      for (const target of preset.targetMods) {
        const mod = CRAFT_MODS.find(m => m.id === target.modId);
        expect(mod).toBeDefined();
        expect(target.maxTier).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
