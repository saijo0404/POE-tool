import type { TradeWhisper } from './types';

function cleanWhisperText(text: string): string {
  const line = text.trim();
  const logPrefixRegex = /^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}\s+\d+\s+[0-9a-fA-F]+\s+\[[A-Za-z]+ Client \d+\]\s*:?\s*/;
  return line.replace(logPrefixRegex, '').trim();
}

export function isTradeWhisper(text: string): boolean {
  const clean = cleanWhisperText(text);
  if (!clean.startsWith('@From') && !clean.startsWith('@來自') && !clean.startsWith('@来自')) {
    return false;
  }
  return (
    clean.includes('buy your') ||
    clean.includes('想購買') ||
    clean.includes('想购买') ||
    clean.includes('想要購買') ||
    clean.includes('想要购买')
  );
}

function parsePrice(priceStr: string): { amount?: number; currency?: string } {
  const match = priceStr.trim().match(/^([\d.,]+)\s*(.+)$/);
  if (!match) return {};
  const amount = parseFloat(match[1].replace(/,/g, ''));
  return {
    amount: isNaN(amount) ? undefined : amount,
    currency: match[2].trim()
  };
}

function extractPosition(clean: string): { tab?: string; left?: number; top?: number } {
  const stashRegex = /\((?:stash tab|倉庫分頁|仓库分页)\s*"([^"]+)";\s*(?:position|位置):\s*(?:left|左)\s*(\d+),\s*(?:top|上)\s*(\d+)\)/;
  const match = clean.match(stashRegex);
  if (!match) return {};
  return {
    tab: match[1],
    left: parseInt(match[2], 10),
    top: parseInt(match[3], 10)
  };
}

function parseStandardWhisper(clean: string): TradeWhisper | null {
  const stdRegex = /^@(From|來自|来自)\s+(?:<([^>]+)>\s+)?([^:]+):\s*(?:Hi, I would like to buy your|你好，我想購買|你好，我想购买)\s+(.+?)\s+(?:listed for|標價|标价)\s+(.+?)\s+(?:in|在)\s+([^()]+?)(?:\s*\(.*)?$/;
  const match = clean.match(stdRegex);
  if (!match) return null;

  const [, , guildTag, senderRaw, itemName, priceRaw, leagueRaw] = match;
  const sender = senderRaw.trim();
  const price = priceRaw.trim();
  const league = leagueRaw.trim();
  const { amount, currency } = parsePrice(price);
  const pos = extractPosition(clean);

  return {
    id: `tw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    guildTag: guildTag?.trim(),
    itemName: itemName.trim(),
    price,
    priceAmount: amount,
    priceCurrency: currency,
    league,
    stashTab: pos.tab,
    position: pos.left && pos.top ? { left: pos.left, top: pos.top } : undefined,
    rawMessage: clean,
    timestamp: Date.now(),
    status: 'pending'
  };
}

function parseBulkWhisper(clean: string): TradeWhisper | null {
  const bulkRegex = /^@(From|來自|来自)\s+(?:<([^>]+)>\s+)?([^:]+):\s*(?:Hi, I'd like to buy your|你好，我想要購買|你好，我想要购买)\s+(.+?)\s+(?:for my|標價|标价)\s+(.+?)\s+(?:in|在)\s+([^.]+?)\.?$/;
  const match = clean.match(bulkRegex);
  if (!match) return null;

  const [, , guildTag, senderRaw, itemName, priceRaw, leagueRaw] = match;
  const sender = senderRaw.trim();
  const price = priceRaw.trim();
  const league = leagueRaw.trim();
  const { amount, currency } = parsePrice(price);

  return {
    id: `tw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender,
    guildTag: guildTag?.trim(),
    itemName: itemName.trim(),
    price,
    priceAmount: amount,
    priceCurrency: currency,
    league,
    rawMessage: clean,
    timestamp: Date.now(),
    status: 'pending'
  };
}

export function parseTradeWhisper(text: string): TradeWhisper | null {
  if (!isTradeWhisper(text)) return null;
  const clean = cleanWhisperText(text);
  return parseStandardWhisper(clean) || parseBulkWhisper(clean);
}
