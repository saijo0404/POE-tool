import type { ItemParserStrategy } from './types';
import type { ParsedItem, ParsedItemMod } from '../item/types';
import {
  splitSections,
  detectLanguage,
  parseRarity,
  extractNumericValue,
  buildSimpleMod
} from './parserUtils';

const POE2_MARKERS = [
  /spirit:\s*\d+/i,
  /精魂:\s*\d+/,
  /waystone\s+tier:\s*\d+/i,
  /銘刻地圖階級:\s*\d+/,
  /uncut\s+.*gem/i,
  /未切割.*寶石/,
  /item class:\s*waystones/i,
  /物品種類:\s*銘刻地圖/,
  /rune\s+sockets:/i,
  /符文插槽:/
];

export class Poe2ItemParser implements ItemParserStrategy {
  readonly supportedEngine = 'poe2' as const;

  canParse(text: string): boolean {
    return POE2_MARKERS.some(marker => marker.test(text));
  }

  parse(text: string): ParsedItem {
    const language = detectLanguage(text);
    const sections = splitSections(text);

    let name = '';
    let baseType = '';
    let rarity = parseRarity('Rare');
    let itemClass: string | undefined;
    let itemLevel: number | undefined;
    let quality: number | undefined;
    let corrupted: boolean | undefined;
    let sockets: string | undefined;
    let runeSockets: string | undefined;
    let spirit: number | undefined;
    let waystoneTier: number | undefined;
    let uncutTier: number | undefined;

    const explicits: ParsedItemMod[] = [];
    const implicits: ParsedItemMod[] = [];

    // Parse header section
    if (sections.length > 0) {
      const headerLines = sections[0];
      const filteredHeader: string[] = [];

      for (const line of headerLines) {
        if (/^(?:物品種類|Item Class):\s*(.+)$/i.test(line)) {
          itemClass = line.replace(/^(?:物品種類|Item Class):\s*/i, '').trim();
        } else if (/^(?:稀有度|Rarity):\s*(.+)$/i.test(line)) {
          rarity = parseRarity(line);
        } else if (/^(?:Waystone Tier|銘刻地圖階級):\s*(\d+)/i.test(line)) {
          waystoneTier = extractNumericValue(line, /^(?:Waystone Tier|銘刻地圖階級):\s*(\d+)/i);
        } else if (/^(?:Tier|階級):\s*(\d+)/i.test(line)) {
          uncutTier = extractNumericValue(line, /^(?:Tier|階級):\s*(\d+)/i);
        } else if (/^(?:Spirit|精魂):\s*(\d+)/i.test(line)) {
          spirit = extractNumericValue(line, /^(?:Spirit|精魂):\s*(\d+)/i);
        } else {
          filteredHeader.push(line);
        }
      }

      if (filteredHeader.length >= 2) {
        name = filteredHeader[0];
        baseType = filteredHeader[1];
      } else if (filteredHeader.length === 1) {
        name = filteredHeader[0];
        baseType = filteredHeader[0];
      }
    }

    // Process body sections
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      let isMetadata = false;

      for (const line of section) {
        if (/^(?:Spirit|精魂):\s*(\d+)/i.test(line)) {
          spirit = extractNumericValue(line, /^(?:Spirit|精魂):\s*(\d+)/i);
          isMetadata = true;
        } else if (/^(?:Waystone Tier|銘刻地圖階級):\s*(\d+)/i.test(line)) {
          waystoneTier = extractNumericValue(line, /^(?:Waystone Tier|銘刻地圖階級):\s*(\d+)/i);
          isMetadata = true;
        } else if (/^(?:Tier|階級):\s*(\d+)/i.test(line)) {
          uncutTier = extractNumericValue(line, /^(?:Tier|階級):\s*(\d+)/i);
          isMetadata = true;
        } else if (/^(?:物品等級|Item Level):\s*(\d+)/i.test(line)) {
          itemLevel = extractNumericValue(line, /^(?:物品等級|Item Level):\s*(\d+)/i);
          isMetadata = true;
        } else if (/^(?:品質|Quality):\s*\+?(\d+)%/i.test(line)) {
          quality = extractNumericValue(line, /^(?:品質|Quality):\s*\+?(\d+)%/i);
          isMetadata = true;
        } else if (/^(?:插槽|Sockets):\s*(.+)$/i.test(line)) {
          sockets = line.replace(/^(?:插槽|Sockets):\s*/i, '').trim();
          isMetadata = true;
        } else if (/^(?:符文插槽|Rune Sockets):\s*(.+)$/i.test(line)) {
          runeSockets = line.replace(/^(?:符文插槽|Rune Sockets):\s*/i, '').trim();
          isMetadata = true;
        } else if (/^(?:已汙染|已污染|Corrupted)$/i.test(line)) {
          corrupted = true;
          isMetadata = true;
        } else if (/^(?:需求|Requirements|護甲|Armour|閃避值|Evasion|能量護盾|Energy Shield|等級|Level|力量|Str|敏捷|Dex|智慧|Int):/i.test(line)) {
          isMetadata = true;
        }
      }

      if (!isMetadata) {
        for (const line of section) {
          if (line.endsWith('(implicit)') || line.endsWith('(固定詞綴)')) {
            const clean = line.replace(/\s*\((?:implicit|固定詞綴)\)$/i, '').trim();
            implicits.push(buildSimpleMod(clean, implicits.length, 'implicit'));
          } else {
            explicits.push(buildSimpleMod(line, explicits.length, 'explicit'));
          }
        }
      }
    }

    return {
      name,
      baseType,
      rarity,
      itemClass,
      itemLevel,
      quality,
      corrupted,
      sockets,
      runeSockets,
      spirit,
      waystoneTier,
      uncutTier,
      language,
      implicits,
      explicits,
      rawText: text.trim(),
      engine: 'poe2'
    };
  }
}
