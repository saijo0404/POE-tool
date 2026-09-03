import { describe, it, expect } from 'vitest';
import { CraftingService } from '../craftingService';
import { CRAFT_BASES } from '../../../domain/crafting/basesDatabase';

describe('CraftingService Application Unit Tests', () => {
  const base = CRAFT_BASES.find(b => b.id === 'sadist_garb')!;

  it('should return Err if baseItem is null', () => {
    const res = CraftingService.evaluate({
      baseItem: null,
      ilvl: 86,
      targetMods: [],
    });

    expect(res.isErr()).toBe(true);
    expect(res.isOk()).toBe(false);
  });

  it('should return Err if ilvl is invalid', () => {
    const res = CraftingService.evaluate({
      baseItem: base,
      ilvl: 0,
      targetMods: [],
    });

    expect(res.isErr()).toBe(true);
  });

  it('should return Ok with actuary result when params are valid', () => {
    const res = CraftingService.evaluate({
      baseItem: base,
      ilvl: 86,
      targetMods: [{ modId: 'maximum_life', maxTier: 1 }],
      divineRate: 150,
      ninjaRates: {
        'Deafening Essence of Greed': 6,
        'Pristine Fossil': 4,
      },
    });

    expect(res.isOk()).toBe(true);
    const result = res.unwrap();
    expect(result.evaluations.length).toBeGreaterThan(0);
    expect(result.recommendedMethod).toBeDefined();
  });
});
