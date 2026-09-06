import { describe, it, expect } from 'vitest';
import { evaluateWaystone } from '../waystoneRiskEvaluator';
import { DEFAULT_PLAYER_PROFILE } from '../waystoneModsCatalog';
import type { PlayerDefensiveProfile } from '../types';

describe('waystoneRiskEvaluator', () => {
  const lethalWaystoneText = `
Item Class: Waystones
Rarity: Rare
Citadel Waystone (Tier 15)
--------
Waystone Tier: 15
Item Quantity: +75%
--------
Monsters penetrate 15% Elemental Resistances
Players cannot leech Life or Mana
Patches of Chilled Ground
`;

  const extraChaosWaystoneText = `
Item Class: Waystones
Rarity: Rare
Waystone Tier: 13
--------
Monsters deal 35% extra Physical Damage as Chaos
Monsters have increased Critical Strike Chance and Multiplier
`;

  const safeWaystoneText = `
Item Class: Waystones
Rarity: Magic
Waystone Tier: 5
--------
Patches of Chilled Ground
Players are Cursed with Enfeeble
`;

  it('evaluates lethal waystone with fatal elemental penetration and cannot leech', () => {
    const result = evaluateWaystone(lethalWaystoneText, DEFAULT_PLAYER_PROFILE);
    expect(result.isWaystone).toBe(true);
    expect(result.overallRiskLevel).toBe('fatal');
    expect(result.fatalCount).toBeGreaterThanOrEqual(2);
    expect(result.safetyScore).toBeLessThan(40);
    expect(result.suggestions.some(s => s.includes('致命詞綴'))).toBe(true);
  });

  it('dynamically increases risk for negative chaos resistance player', () => {
    const vulnerableProfile: PlayerDefensiveProfile = {
      ...DEFAULT_PLAYER_PROFILE,
      chaosRes: -30
    };
    const result = evaluateWaystone(extraChaosWaystoneText, vulnerableProfile);
    const chaosMod = result.mods.find(m => m.definition.id === 'extra_chaos');
    expect(chaosMod?.adjustedRisk).toBe('fatal');
    expect(chaosMod?.riskReason).toContain('負值');
  });

  it('lowers risk for high chaos resistance player', () => {
    const tankyProfile: PlayerDefensiveProfile = {
      ...DEFAULT_PLAYER_PROFILE,
      chaosRes: 75
    };
    const result = evaluateWaystone(extraChaosWaystoneText, tankyProfile);
    const chaosMod = result.mods.find(m => m.definition.id === 'extra_chaos');
    expect(chaosMod?.adjustedRisk).toBe('caution');
  });

  it('reduces cannot leech penalty for regen-based players', () => {
    const regenProfile: PlayerDefensiveProfile = {
      ...DEFAULT_PLAYER_PROFILE,
      recoveryMechanism: 'regen'
    };
    const singleLeechText = `
Item Class: Waystones
Rarity: Rare
Waystone Tier: 10
--------
Players cannot leech Life or Mana
`;
    const result = evaluateWaystone(singleLeechText, regenProfile);
    const leechMod = result.mods.find(m => m.definition.id === 'cannot_leech');
    expect(leechMod?.adjustedRisk).toBe('caution');
  });

  it('rates safe waystone with high safety score and safe overall risk level', () => {
    const result = evaluateWaystone(safeWaystoneText, DEFAULT_PLAYER_PROFILE);
    expect(result.overallRiskLevel).toBe('caution');
    expect(result.safetyScore).toBeGreaterThanOrEqual(85);
    expect(result.fatalCount).toBe(0);
  });
});
