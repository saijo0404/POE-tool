import { describe, it, expect } from 'vitest';
import {
  classifyWeaponType,
  getWeaponCategory,
  isTwoHanded,
  isValidOffHand,
  createEquippedWeaponFromParsedItem
} from '../weaponClassifier';
import type { ParsedItem } from '../../item/types';

describe('weaponClassifier', () => {
  it('correctly classifies PoE 2 base types in Traditional Chinese and English', () => {
    expect(classifyWeaponType('高級雙頭杖')).toBe('Quarterstaff');
    expect(classifyWeaponType('Iron Quarterstaff')).toBe('Quarterstaff');
    expect(classifyWeaponType('戰弓')).toBe('Bow');
    expect(classifyWeaponType('Composite Bow')).toBe('Bow');
    expect(classifyWeaponType('重十字弓')).toBe('Crossbow');
    expect(classifyWeaponType('Arbalest Crossbow')).toBe('Crossbow');
    expect(classifyWeaponType('巨劍')).toBe('TwoHandSword');
    expect(classifyWeaponType('Greatsword')).toBe('TwoHandSword');
    expect(classifyWeaponType('巨斧')).toBe('TwoHandAxe');
    expect(classifyWeaponType('Greataxe')).toBe('TwoHandAxe');
    expect(classifyWeaponType('巨槌')).toBe('TwoHandMace');
    expect(classifyWeaponType('Greatmace')).toBe('TwoHandMace');
    expect(classifyWeaponType('魔杖')).toBe('Wand');
    expect(classifyWeaponType('Bone Wand')).toBe('Wand');
    expect(classifyWeaponType('權杖')).toBe('Sceptre');
    expect(classifyWeaponType('Ritual Sceptre')).toBe('Sceptre');
    expect(classifyWeaponType('連枷')).toBe('Flail');
    expect(classifyWeaponType('單手長矛')).toBe('Spear');
    expect(classifyWeaponType('Javelin')).toBe('Spear');
    expect(classifyWeaponType('塔盾')).toBe('Shield');
    expect(classifyWeaponType('Kite Shield')).toBe('Shield');
    expect(classifyWeaponType('法器')).toBe('Focus');
    expect(classifyWeaponType('Orb Focus')).toBe('Focus');
    expect(classifyWeaponType('箭袋')).toBe('Quiver');
    expect(classifyWeaponType('Broadhead Quiver')).toBe('Quiver');
  });

  it('identifies weapon categories and two-handed flags', () => {
    expect(isTwoHanded('Quarterstaff')).toBe(true);
    expect(isTwoHanded('Bow')).toBe(true);
    expect(isTwoHanded('Crossbow')).toBe(true);
    expect(isTwoHanded('TwoHandSword')).toBe(true);
    expect(isTwoHanded('OneHandSword')).toBe(false);
    expect(isTwoHanded('Wand')).toBe(false);

    expect(getWeaponCategory('Bow')).toBe('TwoHanded');
    expect(getWeaponCategory('OneHandAxe')).toBe('OneHanded');
    expect(getWeaponCategory('Shield')).toBe('OffHand');
    expect(getWeaponCategory('Quiver')).toBe('OffHand');
    expect(getWeaponCategory('Focus')).toBe('OffHand');
    expect(getWeaponCategory('Unarmed')).toBe('Unarmed');
  });

  it('validates off-hand weapon pairings correctly', () => {
    // Bow / Crossbow can only pair with Quiver
    expect(isValidOffHand('Bow', 'Quiver')).toBe(true);
    expect(isValidOffHand('Crossbow', 'Quiver')).toBe(true);
    expect(isValidOffHand('Bow', 'Shield')).toBe(false);

    // Two-handed melee cannot have any off-hand
    expect(isValidOffHand('TwoHandSword', 'Shield')).toBe(false);
    expect(isValidOffHand('Quarterstaff', 'Focus')).toBe(false);

    // One-handed weapons can pair with shields, foci, or dual-wield
    expect(isValidOffHand('Wand', 'Focus')).toBe(true);
    expect(isValidOffHand('Wand', 'Shield')).toBe(true);
    expect(isValidOffHand('OneHandSword', 'Shield')).toBe(true);
    expect(isValidOffHand('OneHandSword', 'OneHandAxe')).toBe(true);
    expect(isValidOffHand('OneHandSword', 'Quiver')).toBe(false);
  });

  it('creates EquippedWeapon from ParsedItem', () => {
    const mockItem: ParsedItem = {
      name: '滅世之弓',
      baseType: '戰弓',
      rarity: 'Rare',
      language: 'zh',
      implicits: [],
      explicits: [],
      rawText: 'mock',
      itemLevel: 75,
      spirit: 50
    };

    const weapon = createEquippedWeaponFromParsedItem(mockItem);
    expect(weapon).not.toBeNull();
    expect(weapon?.weaponType).toBe('Bow');
    expect(weapon?.isTwoHanded).toBe(true);
    expect(weapon?.category).toBe('TwoHanded');
    expect(weapon?.spirit).toBe(50);
    expect(weapon?.levelRequirement).toBe(75);
  });

  it('returns null for non-weapon items', () => {
    const mockArmour: ParsedItem = {
      name: '星芒戰鎧',
      baseType: '星芒戰鎧',
      rarity: 'Rare',
      language: 'zh',
      implicits: [],
      explicits: [],
      rawText: 'mock'
    };

    const weapon = createEquippedWeaponFromParsedItem(mockArmour);
    expect(weapon).toBeNull();
  });
});
