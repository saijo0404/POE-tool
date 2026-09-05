import type {
  TimelessJewelType,
  TimelessEvaluationResult,
  ParsedTimelessJewel,
  TimelessJewelDef,
  TimelessLeaderDef
} from './types';
import { TIMELESS_JEWELS } from './timelessData';

const JEWEL_PATTERNS: { type: TimelessJewelType; keywords: string[] }[] = [
  { type: 'glorious_vanity', keywords: ['glorious vanity', '輝煌的虛榮', '瓦爾之神', 'vaul'] },
  { type: 'lethal_pride', keywords: ['lethal pride', '致命的驕傲', '卡魯', 'karui'] },
  { type: 'brutal_restraint', keywords: ['brutal restraint', '殘暴的克制', '馬拉克斯', 'maraketh'] },
  { type: 'militant_faith', keywords: ['militant faith', '激進的信仰', '聖堂武僧', 'templar'] },
  { type: 'elegant_hubris', keywords: ['elegant hubris', '優雅的狂妄', '永恆帝國', 'eternal empire'] }
];

function findJewelType(text: string): TimelessJewelType | undefined {
  const lower = text.toLowerCase();
  for (const item of JEWEL_PATTERNS) {
    if (item.keywords.some(kw => lower.includes(kw))) return item.type;
  }
  return undefined;
}

function findLeaderId(text: string, jewelDef?: TimelessJewelDef): string | undefined {
  if (!jewelDef) return undefined;
  const lower = text.toLowerCase();
  for (const l of jewelDef.leaders) {
    if (lower.includes(l.id) || lower.includes(l.name.toLowerCase()) || text.includes(l.nameZh.split(' ')[0])) {
      return l.id;
    }
  }
  return undefined;
}

function findSeedNumber(text: string): number | undefined {
  const match = text.match(/(?:浸沐|commemorates|denotes|carved|honours|數目|\b)\s*([1-9]\d{2,5})\b/i);
  if (match && match[1]) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num >= 100 && num <= 180000) return num;
  }
  return undefined;
}

export function parseTimelessJewelText(clipboardText: string): ParsedTimelessJewel {
  if (!clipboardText || !clipboardText.trim()) return {};
  const jewelType = findJewelType(clipboardText);
  const def = TIMELESS_JEWELS.find(j => j.id === jewelType);
  const leaderId = findLeaderId(clipboardText, def);
  const seedNumber = findSeedNumber(clipboardText);

  return { jewelType, leaderId, seedNumber };
}

function selectLeader(def: TimelessJewelDef, leaderId?: string): TimelessLeaderDef {
  const found = def.leaders.find(l => l.id === leaderId);
  return found || def.leaders[0];
}

export function evaluateTimelessJewel(
  jewelType: TimelessJewelType,
  leaderId?: string,
  seedNumber = 1000
): TimelessEvaluationResult {
  const jewelDef = TIMELESS_JEWELS.find(j => j.id === jewelType) || TIMELESS_JEWELS[0];
  const leader = selectLeader(jewelDef, leaderId);

  return {
    jewelType: jewelDef.id,
    jewelNameZh: jewelDef.nameZh,
    leaderId: leader.id,
    leaderNameZh: leader.nameZh,
    seedNumber,
    keystoneNameZh: leader.keystoneNameZh,
    keystoneDescriptionZh: leader.keystoneDescriptionZh,
    popularityScore: leader.popularityScore,
    ratingTier: leader.ratingTier,
    synergyBuilds: leader.synergyBuilds,
    estimatedPriceRangeChaos: leader.basePriceRangeChaos
  };
}
