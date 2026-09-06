import type { Poe2LogEvent } from './types';

const TIMESTAMP_REGEX = /^(\d{4})[/-](\d{2})[/-](\d{2})\s+(\d{2}):(\d{2}):(\d{2})/;
const LOG_PREFIX_REGEX = /^\d{4}[/-]\d{2}[/-]\d{2}\s+\d{2}:\d{2}:\d{2}(?:\s+\d+\s+[0-9a-fA-F]+)?\s*(?:\[.*?\])?\s*:?\s*/;

const KNOWN_TOWNS = new Set([
  'Clearfell Encampment', 'Ardura Caravan', 'The Ziggurat',
  'Kingsmarch', 'Ogham Outskirts', "Lioneye's Watch",
  '清晰丘陵營地', '阿爾杜拉車隊', '吉庫拉特', '金斯馬奇', '歐甘城郊', '獅子之眼'
]);

export function parseLogTimestamp(line: string): number {
  const match = line.match(TIMESTAMP_REGEX);
  if (!match) return Date.now();
  const [, year, month, day, hour, min, sec] = match;
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(min, 10),
    parseInt(sec, 10)
  ).getTime();
}

export function cleanLogLine(line: string): string {
  return line.replace(LOG_PREFIX_REGEX, '').trim();
}

export function classifyArea(areaName: string): { isTown: boolean; isHideout: boolean; isEndgameMap: boolean } {
  const name = areaName.trim();
  const isHideout = name.toLowerCase().includes('hideout') || name.includes('藏身處');
  const isTown =
    KNOWN_TOWNS.has(name) ||
    name.includes('Encampment') ||
    name.includes('Caravan') ||
    name.includes('營地') ||
    name.includes('車隊');
  const isEndgameMap = !isHideout && !isTown;
  return { isTown, isHideout, isEndgameMap };
}

function parseAreaGenerated(clean: string, ts: number, raw: string): Poe2LogEvent | null {
  const genMatch = clean.match(/^Generating level (\d+) area "([^"]+)"(?:\s+with seed (\d+))?/i);
  if (!genMatch) return null;
  const level = parseInt(genMatch[1], 10);
  const areaName = genMatch[2].trim();
  return {
    type: 'AREA_GENERATED',
    timestamp: ts,
    rawText: raw,
    areaName,
    level,
    mapTier: Math.max(1, level - 64),
    seed: genMatch[3]
  };
}

function parseAreaEntered(clean: string, ts: number, raw: string): Poe2LogEvent | null {
  const enterMatch =
    clean.match(/^(?:Entering area|You have entered|進入了區域：|你已進入)\s*(.+?)\.?$/i);
  if (!enterMatch) return null;
  const areaName = enterMatch[1].trim();
  const info = classifyArea(areaName);
  return {
    type: 'AREA_ENTERED',
    timestamp: ts,
    rawText: raw,
    areaName,
    ...info
  };
}

function parseBossSlain(clean: string, ts: number, raw: string): Poe2LogEvent | null {
  if (
    clean.includes('Quest Complete: Defeat the Map Boss') ||
    clean.includes('Quest Complete: 擊敗地圖首領')
  ) {
    return { type: 'BOSS_SLAIN', timestamp: ts, rawText: raw };
  }
  const slainMatch = clean.match(/^([A-Za-z0-9\s',-\u4e00-\u9fa5]+?)\s*(?:has been slain|已被擊殺)\.?$/i);
  if (slainMatch && !slainMatch[1].toLowerCase().includes('you')) {
    return { type: 'BOSS_SLAIN', timestamp: ts, rawText: raw, bossName: slainMatch[1].trim() };
  }
  return null;
}

function parsePlayerDied(clean: string, ts: number, raw: string): Poe2LogEvent | null {
  if (
    clean.match(/^You have died\.?$/i) ||
    clean.includes('你已經陣亡') ||
    clean.includes('你已經死亡')
  ) {
    return { type: 'PLAYER_DIED', timestamp: ts, rawText: raw };
  }
  return null;
}

function parseGoldReceived(clean: string, ts: number, raw: string): Poe2LogEvent | null {
  const goldMatch = clean.match(/(?:received|gained|collected|獲得了|拾取了|獲得)\s*([\d,]+)\s*(?:Gold|金幣)/i);
  if (!goldMatch) return null;
  const amount = parseInt(goldMatch[1].replace(/,/g, ''), 10);
  return isNaN(amount) ? null : { type: 'GOLD_RECEIVED', timestamp: ts, rawText: raw, amount };
}

function parseItemReceived(clean: string, ts: number, raw: string): Poe2LogEvent | null {
  const waystoneMatch = clean.match(/(?:Waystone|銘刻地圖)\s*(?:\(Tier\s*(\d+)\)|\(階級\s*(\d+)\)|(?:Tier|階級)\s*(\d+))/i);
  if (waystoneMatch) {
    const tier = parseInt(waystoneMatch[1] || waystoneMatch[2] || waystoneMatch[3] || '1', 10);
    return { type: 'ITEM_RECEIVED', timestamp: ts, rawText: raw, itemName: `Waystone (Tier ${tier})`, category: 'waystone', tier, amount: 1 };
  }
  const runeMatch = clean.match(/(?:Greater\s+)?([A-Za-z]+)\s+Rune|([\u4e00-\u9fa5]+)符文/i);
  if (runeMatch) {
    const name = runeMatch[0].trim();
    return { type: 'ITEM_RECEIVED', timestamp: ts, rawText: raw, itemName: name, category: 'rune', amount: 1 };
  }
  const currMatch = clean.match(/(Exalted Orb|Divine Orb|Chaos Orb|神聖石|崇高石|混沌石)/i);
  if (currMatch) {
    return { type: 'ITEM_RECEIVED', timestamp: ts, rawText: raw, itemName: currMatch[1].trim(), category: 'currency', amount: 1 };
  }
  return null;
}

export function parsePoe2LogLine(rawLine: string): Poe2LogEvent | null {
  const line = rawLine.trim();
  if (!line) return null;
  const ts = parseLogTimestamp(line);
  const clean = cleanLogLine(line);

  return (
    parseAreaGenerated(clean, ts, line) ||
    parseAreaEntered(clean, ts, line) ||
    parseBossSlain(clean, ts, line) ||
    parsePlayerDied(clean, ts, line) ||
    parseGoldReceived(clean, ts, line) ||
    parseItemReceived(clean, ts, line)
  );
}

export function parsePoe2LogBatch(logContent: string): Poe2LogEvent[] {
  const lines = logContent.split(/\r?\n/);
  const events: Poe2LogEvent[] = [];
  for (const line of lines) {
    const ev = parsePoe2LogLine(line);
    if (ev) events.push(ev);
  }
  return events;
}
