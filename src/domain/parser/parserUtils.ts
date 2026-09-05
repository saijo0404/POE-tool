import type { ItemRarity, ItemLanguage, ParsedItemMod } from '../item/types';

export function normalizeLines(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim());
}

export function splitSections(text: string): string[][] {
  const lines = normalizeLines(text);
  const sections: string[][] = [];
  let currentSection: string[] = [];

  for (const line of lines) {
    if (/^-{4,}\s*$/.test(line)) {
      if (currentSection.length > 0) {
        sections.push(currentSection);
        currentSection = [];
      }
    } else if (line.length > 0) {
      currentSection.push(line);
    }
  }

  if (currentSection.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export function detectLanguage(text: string): ItemLanguage {
  const isZh =
    text.includes('稀有度:') ||
    text.includes('物品種類:') ||
    text.includes('物品類別:') ||
    text.includes('需求:') ||
    text.includes('物品等級:');
  return isZh ? 'zh' : 'en';
}

export function parseRarity(line: string): ItemRarity {
  const clean = line.replace(/^(?:稀有度|Rarity):\s*/i, '').trim();
  switch (clean.toLowerCase()) {
    case 'unique':
    case '傳奇':
      return 'Unique';
    case 'rare':
    case '稀有':
      return 'Rare';
    case 'magic':
    case '魔法':
      return 'Magic';
    case 'normal':
    case '普通':
      return 'Normal';
    case 'gem':
    case '寶石':
      return 'Gem';
    case 'currency':
    case '通貨':
      return 'Currency';
    default:
      return 'Rare';
  }
}

export function extractNumericValue(line: string, pattern: RegExp): number | undefined {
  const match = line.match(pattern);
  if (!match || !match[1]) return undefined;
  const num = parseInt(match[1], 10);
  return isNaN(num) ? undefined : num;
}

export function buildSimpleMod(text: string, index: number, type: ParsedItemMod['type']): ParsedItemMod {
  const numMatch = text.match(/([+-]?\d+(?:\.\d+)?)/);
  const val = numMatch ? parseFloat(numMatch[1]) : undefined;

  return {
    id: `mod_${type}_${index}`,
    text,
    englishText: text,
    type,
    value: val,
    enabled: true
  };
}
