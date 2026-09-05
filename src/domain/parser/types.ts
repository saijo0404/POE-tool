import type { ParsedItem } from '../item/types';
import type { GameEngine } from '../engine/types';

export interface ItemParserStrategy {
  readonly supportedEngine: GameEngine;
  canParse(text: string): boolean;
  parse(text: string): ParsedItem;
}

export interface ParseItemOptions {
  engine?: GameEngine;
}
