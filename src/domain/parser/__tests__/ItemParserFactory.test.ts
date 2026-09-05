import { describe, it, expect } from 'vitest';
import { ItemParserFactory } from '../ItemParserFactory';

describe('ItemParserFactory', () => {
  const factory = new ItemParserFactory();

  it('resolves Poe2ItemParser when poe2 is explicitly requested', () => {
    const parser = factory.getParser('poe2');
    expect(parser.supportedEngine).toBe('poe2');
  });

  it('resolves Poe1ItemParser when poe1 is explicitly requested', () => {
    const parser = factory.getParser('poe1');
    expect(parser.supportedEngine).toBe('poe1');
  });

  it('automatically resolves Poe2ItemParser when item text contains PoE 2 markers', () => {
    const textWithSpirit = `Item Class: Body Armours
Rarity: Rare
Doom Shell
Golden Plate
--------
Spirit: 60`;

    const parser = factory.resolveParserForText(textWithSpirit);
    expect(parser.supportedEngine).toBe('poe2');
  });

  it('automatically resolves Poe1ItemParser for normal PoE 1 item text', () => {
    const poe1Text = `Rarity: Unique
Headhunter
Leather Belt
--------
Item Level: 84`;

    const parser = factory.resolveParserForText(poe1Text);
    expect(parser.supportedEngine).toBe('poe1');
  });

  it('parses item directly via factory.parseItem with engine override or auto-detection', () => {
    const poe2Text = `Item Class: Waystones
Rarity: Rare
Tower Waystone
Waystone Tier: 15
--------
Item Level: 82`;

    const parsedAuto = factory.parseItem(poe2Text);
    expect(parsedAuto.engine).toBe('poe2');
    expect(parsedAuto.waystoneTier).toBe(15);

    const parsedForced = factory.parseItem(poe2Text, 'poe2');
    expect(parsedForced.engine).toBe('poe2');
  });
});
