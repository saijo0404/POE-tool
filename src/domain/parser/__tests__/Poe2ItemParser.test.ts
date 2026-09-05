import { describe, it, expect } from 'vitest';
import { Poe2ItemParser } from '../Poe2ItemParser';

describe('Poe2ItemParser', () => {
  const parser = new Poe2ItemParser();

  it('identifies PoE 2 items correctly via canParse', () => {
    const poe2Text = `Item Class: Body Armours
Rarity: Rare
Doom Shell
Golden Plate
--------
Spirit: 60
--------
Item Level: 78`;

    const poe1Text = `Rarity: Unique
Mageblood
Heavy Belt
--------
Item Level: 86`;

    expect(parser.canParse(poe2Text)).toBe(true);
    expect(parser.canParse(poe1Text)).toBe(false);
  });

  it('parses PoE 2 English rare armour with Spirit', () => {
    const text = `Item Class: Body Armours
Rarity: Rare
Doom Shell
Golden Plate
--------
Armour: 450
Energy Shield: 120
Spirit: 60
--------
Requirements:
Level: 65
Str: 105
--------
Sockets: S S
--------
Item Level: 78
--------
+85 to maximum Life
+35% to Fire Resistance
+28% to Lightning Resistance`;

    const result = parser.parse(text);

    expect(result.engine).toBe('poe2');
    expect(result.name).toBe('Doom Shell');
    expect(result.baseType).toBe('Golden Plate');
    expect(result.rarity).toBe('Rare');
    expect(result.itemClass).toBe('Body Armours');
    expect(result.itemLevel).toBe(78);
    expect(result.spirit).toBe(60);
    expect(result.language).toBe('en');
    expect(result.explicits.length).toBe(3);
    expect(result.explicits[0].text).toContain('+85 to maximum Life');
  });

  it('parses PoE 2 Traditional Chinese rare armour with Spirit', () => {
    const text = `物品種類: 胸甲
稀有度: 稀有
災厄 護殼
黃金板甲
--------
護甲: 450
能量護盾: 120
精魂: 60
--------
需求:
等級: 65
力量: 105
--------
插槽: S S
--------
物品等級: 78
--------
+85 最大生命
+35% 火焰抗性
+28% 閃電抗性`;

    const result = parser.parse(text);

    expect(result.engine).toBe('poe2');
    expect(result.name).toBe('災厄 護殼');
    expect(result.baseType).toBe('黃金板甲');
    expect(result.rarity).toBe('Rare');
    expect(result.itemClass).toBe('胸甲');
    expect(result.itemLevel).toBe(78);
    expect(result.spirit).toBe(60);
    expect(result.language).toBe('zh');
    expect(result.explicits.length).toBe(3);
    expect(result.explicits[0].text).toContain('+85 最大生命');
  });

  it('parses PoE 2 Waystone (銘刻地圖)', () => {
    const text = `Item Class: Waystones
Rarity: Rare
Sulphur Vents Waystone
Waystone Tier: 14
--------
Item Level: 79
--------
Monsters have 40% increased Area of Effect
+25% Monster Movement Speed`;

    const result = parser.parse(text);

    expect(result.engine).toBe('poe2');
    expect(result.name).toBe('Sulphur Vents Waystone');
    expect(result.waystoneTier).toBe(14);
    expect(result.itemClass).toBe('Waystones');
    expect(result.explicits.length).toBe(2);
  });

  it('parses PoE 2 Uncut Gem (未切割技能石)', () => {
    const text = `物品種類: 技能寶石
稀有度: 寶石
未切割技能寶石
--------
階級: 19
--------
物品等級: 75
--------
右鍵點擊以銘刻 19 階級或以下的技能寶石。`;

    const result = parser.parse(text);

    expect(result.engine).toBe('poe2');
    expect(result.name).toBe('未切割技能寶石');
    expect(result.uncutTier).toBe(19);
    expect(result.rarity).toBe('Gem');
  });
});
