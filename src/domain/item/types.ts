export type ModType = 'implicit' | 'explicit' | 'fractured' | 'crafted' | 'pseudo';
export type ItemRarity = 'Normal' | 'Magic' | 'Rare' | 'Unique' | 'Currency' | 'Gem';
export type ItemLanguage = 'zh' | 'en';

export interface ParsedItemMod {
  id: string;
  text: string;
  englishText: string;
  type: ModType;
  tier?: number;
  value?: number;
  minValue?: number;
  maxValue?: number;
  enabled: boolean;
}

export interface ParsedItem {
  name: string;
  baseType: string;
  rarity: ItemRarity;
  itemClass?: string;
  itemLevel?: number;
  quality?: number;
  corrupted?: boolean;
  sockets?: string;
  language: ItemLanguage;
  implicits: ParsedItemMod[];
  explicits: ParsedItemMod[];
  rawText: string;
}
