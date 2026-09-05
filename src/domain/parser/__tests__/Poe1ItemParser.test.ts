import { describe, it, expect } from 'vitest';
import { Poe1ItemParser } from '../Poe1ItemParser';

describe('Poe1ItemParser', () => {
  const parser = new Poe1ItemParser();

  it('identifies standard PoE 1 items', () => {
    const text = `Rarity: Unique
Mageblood
Heavy Belt
--------
Requirements:
Level: 44
--------
Item Level: 86
--------
+25 to Strength
--------
Magic Utility Flasks cannot be used`;

    expect(parser.canParse(text)).toBe(true);
    const result = parser.parse(text);
    expect(result.engine).toBe('poe1');
    expect(result.name).toBe('Mageblood');
    expect(result.baseType).toBe('Heavy Belt');
    expect(result.rarity).toBe('Unique');
    expect(result.itemLevel).toBe(86);
  });

  it('parses PoE 1 Chinese item properly', () => {
    const text = `稀有度: 傳奇
魔血
重革腰帶
--------
需求:
等級: 44
--------
物品等級: 86
--------
+25 力量
--------
魔法功能藥劑無法使用`;

    const result = parser.parse(text);
    expect(result.engine).toBe('poe1');
    expect(result.name).toBe('魔血');
    expect(result.baseType).toBe('重革腰帶');
    expect(result.language).toBe('zh');
  });
});
