import type { WaystoneRarity, WaystoneTier } from './types';

export interface ParsedWaystoneData {
  isWaystone: boolean;
  tier: WaystoneTier;
  rarity: WaystoneRarity;
  itemQuantity: number;
  itemRarity: number;
  waystoneDropChance: number;
  rawMods: string[];
}

const RARITY_MAP: Record<string, WaystoneRarity> = {
  normal: 'Normal',
  普通: 'Normal',
  magic: 'Magic',
  魔法: 'Magic',
  rare: 'Rare',
  稀有: 'Rare',
  unique: 'Unique',
  傳奇: 'Unique'
};

export function isWaystoneItem(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('waystone') ||
    text.includes('銘刻地圖') ||
    text.includes('刻印地圖') ||
    lower.includes('item class: waystones') ||
    text.includes('物品類別: 銘刻地圖')
  );
}

function parseTier(text: string): WaystoneTier {
  const match = text.match(/(?:Waystone Tier|銘刻地圖階級|Tier|階級)[ :]+([0-9]{1,2})/i);
  if (!match) return 1;
  const num = parseInt(match[1], 10);
  if (num >= 1 && num <= 16) return num as WaystoneTier;
  return 1;
}

function parseRarity(text: string): WaystoneRarity {
  const match = text.match(/(?:Rarity|稀有度):[ \t]*([^\r\n]+)/i);
  if (!match) return 'Normal';
  const val = match[1].trim().toLowerCase();
  return RARITY_MAP[val] || 'Rare';
}

function parseStatValue(text: string, patterns: RegExp[]): number {
  for (const pat of patterns) {
    const match = text.match(pat);
    if (match) return parseInt(match[1], 10);
  }
  return 0;
}

export function extractModLines(text: string): string[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const skipKeywords = [
    'rarity:', '稀有度:', 'item class:', '物品類別:', 'waystone tier:', '銘刻地圖階級:',
    'item quantity:', '物品數量:', 'item rarity:', '物品稀有度:', 'monster pack size:', '怪物群規模:',
    'waystone drop chance:', '銘刻地圖掉落機率:', 'requirements:', '需求:', 'level:', '等級:',
    'item level:', '物品等級:', '--------', 'quality:', '品質:'
  ];

  return lines.filter(line => {
    const l = line.toLowerCase();
    if (l.startsWith('corrupted') || l === '已汙染' || l === '已污染') return false;
    if ((l.includes('waystone') || line.includes('銘刻地圖')) && (l.includes('tier') || line.includes('階級') || l.includes('('))) {
      return false;
    }
    return !skipKeywords.some(kw => l.startsWith(kw));
  });
}

export function parseWaystone(rawText: string): ParsedWaystoneData {
  const isWaystone = isWaystoneItem(rawText);
  if (!isWaystone) {
    return {
      isWaystone: false,
      tier: 1,
      rarity: 'Normal',
      itemQuantity: 0,
      itemRarity: 0,
      waystoneDropChance: 0,
      rawMods: []
    };
  }

  const tier = parseTier(rawText);
  const rarity = parseRarity(rawText);
  const itemQuantity = parseStatValue(rawText, [
    /(?:Item Quantity|物品數量):[ \t]*\+?([0-9]+)%/i
  ]);
  const itemRarity = parseStatValue(rawText, [
    /(?:Item Rarity|物品稀有度):[ \t]*\+?([0-9]+)%/i
  ]);
  const waystoneDropChance = parseStatValue(rawText, [
    /(?:Waystone Drop Chance|銘刻地圖掉落機率):[ \t]*\+?([0-9]+)%/i
  ]);
  const rawMods = extractModLines(rawText);

  return {
    isWaystone: true,
    tier,
    rarity,
    itemQuantity,
    itemRarity,
    waystoneDropChance,
    rawMods
  };
}
