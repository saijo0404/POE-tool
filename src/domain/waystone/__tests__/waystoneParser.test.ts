import { describe, it, expect } from 'vitest';
import { parseWaystone, isWaystoneItem, extractModLines } from '../waystoneParser';

describe('waystoneParser', () => {
  const englishWaystoneSample = `
Item Class: Waystones
Rarity: Rare
Bramble Waystone (Tier 14)
--------
Waystone Tier: 14
Item Quantity: +68%
Item Rarity: +32%
Monster Pack Size: +22%
Waystone Drop Chance: +45%
--------
Requirements:
Level: 78
--------
Item Level: 82
--------
Monsters penetrate 14% Elemental Resistances
Monsters deal 30% extra Physical Damage as Chaos
Players have 50% less Recovery Rate of Life and Energy Shield
Patches of Chilled Ground
`;

  const traditionalChineseWaystoneSample = `
物品類別: 銘刻地圖
稀有度: 稀有
荊棘 銘刻地圖 (階級 14)
--------
銘刻地圖階級: 14
物品數量: +68%
物品稀有度: +32%
怪物群規模: +22%
銘刻地圖掉落機率: +45%
--------
需求:
等級: 78
--------
物品等級: 82
--------
怪物穿透 14% 元素抗性
怪物附加 30% 物理傷害的混沌傷害
玩家的生命與能量護盾回復速度降低 50%
地圖包含冰緩地面
`;

  it('identifies valid waystone item text in English and Traditional Chinese', () => {
    expect(isWaystoneItem(englishWaystoneSample)).toBe(true);
    expect(isWaystoneItem(traditionalChineseWaystoneSample)).toBe(true);
    expect(isWaystoneItem('Rarity: Rare\nSimple Belt\n--------')).toBe(false);
  });

  it('correctly parses tier, rarity, quantity, and drop chance from English waystone', () => {
    const result = parseWaystone(englishWaystoneSample);
    expect(result.isWaystone).toBe(true);
    expect(result.tier).toBe(14);
    expect(result.rarity).toBe('Rare');
    expect(result.itemQuantity).toBe(68);
    expect(result.itemRarity).toBe(32);
    expect(result.waystoneDropChance).toBe(45);
    expect(result.rawMods).toHaveLength(4);
    expect(result.rawMods[0]).toContain('Monsters penetrate 14% Elemental Resistances');
  });

  it('correctly parses tier, rarity, and drop chance from Traditional Chinese waystone', () => {
    const result = parseWaystone(traditionalChineseWaystoneSample);
    expect(result.isWaystone).toBe(true);
    expect(result.tier).toBe(14);
    expect(result.rarity).toBe('Rare');
    expect(result.itemQuantity).toBe(68);
    expect(result.itemRarity).toBe(32);
    expect(result.waystoneDropChance).toBe(45);
    expect(result.rawMods).toHaveLength(4);
    expect(result.rawMods[0]).toContain('怪物穿透 14% 元素抗性');
  });

  it('filters out metadata lines when extracting mod lines', () => {
    const mods = extractModLines(englishWaystoneSample);
    expect(mods.some(m => m.includes('Item Level'))).toBe(false);
    expect(mods.some(m => m.includes('Requirements'))).toBe(false);
    expect(mods.some(m => m.includes('Level: 78'))).toBe(false);
    expect(mods).toHaveLength(4);
  });

  it('returns default fallback when parsing non-waystone item', () => {
    const result = parseWaystone('Invalid text');
    expect(result.isWaystone).toBe(false);
    expect(result.tier).toBe(1);
    expect(result.rawMods).toHaveLength(0);
  });
});
