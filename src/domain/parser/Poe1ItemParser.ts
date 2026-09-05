import type { ItemParserStrategy } from './types';
import type { ParsedItem, ParsedItemMod } from '../item/types';
import {
  splitSections,
  detectLanguage,
  parseRarity,
  extractNumericValue,
  buildSimpleMod
} from './parserUtils';

export class Poe1ItemParser implements ItemParserStrategy {
  readonly supportedEngine = 'poe1' as const;

  canParse(text: string): boolean {
    return /^(?:稀有度|Rarity):\s*.+/im.test(text);
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

    const explicits: ParsedItemMod[] = [];
    const implicits: ParsedItemMod[] = [];

    if (sections.length > 0) {
      const headerLines = sections[0];
      const filtered: string[] = [];

      for (const line of headerLines) {
        if (/^(?:物品種類|Item Class):\s*(.+)$/i.test(line)) {
          itemClass = line.replace(/^(?:物品種類|Item Class):\s*/i, '').trim();
        } else if (/^(?:稀有度|Rarity):\s*(.+)$/i.test(line)) {
          rarity = parseRarity(line);
        } else {
          filtered.push(line);
        }
      }

      if (filtered.length >= 2) {
        name = filtered[0];
        baseType = filtered[1];
      } else if (filtered.length === 1) {
        name = filtered[0];
        baseType = filtered[0];
      }
    }

    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      let isMetadata = false;

      for (const line of section) {
        if (/^(?:物品等級|Item Level):\s*(\d+)/i.test(line)) {
          itemLevel = extractNumericValue(line, /^(?:物品等級|Item Level):\s*(\d+)/i);
          isMetadata = true;
        } else if (/^(?:品質|Quality):\s*\+?(\d+)%/i.test(line)) {
          quality = extractNumericValue(line, /^(?:品質|Quality):\s*\+?(\d+)%/i);
          isMetadata = true;
        } else if (/^(?:插槽|Sockets):\s*(.+)$/i.test(line)) {
          sockets = line.replace(/^(?:插槽|Sockets):\s*/i, '').trim();
          isMetadata = true;
        } else if (/^(?:已汙染|已污染|Corrupted)$/i.test(line)) {
          corrupted = true;
          isMetadata = true;
        } else if (/^(?:需求|Requirements|護甲|Armour|閃避值|Evasion|能量護盾|Energy Shield|等級|Level|力量|Str|敏捷|Dex|智慧|Int|地圖階級|Map Tier):/i.test(line)) {
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
      language,
      implicits,
      explicits,
      rawText: text.trim(),
      engine: 'poe1'
    };
  }
}
