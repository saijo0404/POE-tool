import type { ItemParserStrategy } from './types';
import type { GameEngine } from '../engine/types';
import type { ParsedItem } from '../item/types';
import { Poe1ItemParser } from './Poe1ItemParser';
import { Poe2ItemParser } from './Poe2ItemParser';

export class ItemParserFactory {
  private readonly poe1Parser: ItemParserStrategy;
  private readonly poe2Parser: ItemParserStrategy;

  constructor(poe1Parser?: ItemParserStrategy, poe2Parser?: ItemParserStrategy) {
    this.poe1Parser = poe1Parser ?? new Poe1ItemParser();
    this.poe2Parser = poe2Parser ?? new Poe2ItemParser();
  }

  getParser(engine: GameEngine): ItemParserStrategy {
    return engine === 'poe2' ? this.poe2Parser : this.poe1Parser;
  }

  resolveParserForText(text: string): ItemParserStrategy {
    if (this.poe2Parser.canParse(text)) {
      return this.poe2Parser;
    }
    return this.poe1Parser;
  }

  parseItem(text: string, engine?: GameEngine): ParsedItem {
    const parser = engine ? this.getParser(engine) : this.resolveParserForText(text);
    return parser.parse(text);
  }
}

export const defaultItemParserFactory = new ItemParserFactory();
