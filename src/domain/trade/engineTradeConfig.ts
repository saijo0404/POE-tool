import type { GameEngine } from '../engine/types';
import type { TradeLeagueEntry } from './types';

export function detectIsTw(league?: string): boolean {
  if (!league) return false;
  const lower = league.toLowerCase();
  return lower.includes('台服') || lower.startsWith('tw_') || lower.endsWith('_tw');
}

export function getTradeApiBaseUrl(engine: GameEngine, isTw = false): string {
  if (engine === 'poe2') {
    return isTw ? 'https://pathofexile.tw/api/trade2' : 'https://www.pathofexile.com/api/trade2';
  }
  return isTw ? 'https://pathofexile.tw/api/trade' : 'https://www.pathofexile.com/api/trade';
}

export function getTradeWebBaseUrl(engine: GameEngine, isTw = false): string {
  if (engine === 'poe2') {
    return isTw ? 'https://pathofexile.tw/trade2' : 'https://www.pathofexile.com/trade2';
  }
  return isTw ? 'https://pathofexile.tw/trade' : 'https://www.pathofexile.com/trade';
}

export function getDefaultTradeLeagues(engine: GameEngine): TradeLeagueEntry[] {
  if (engine === 'poe2') {
    return [
      { id: 'Standard', text: 'Standard' },
      { id: 'Hardcore', text: 'Hardcore' },
      { id: 'Early Access', text: 'Early Access' },
      { id: 'Hardcore Early Access', text: 'Hardcore Early Access' }
    ];
  }
  return [
    { id: 'Settlers', text: 'Settlers' },
    { id: 'Hardcore Settlers', text: 'Hardcore Settlers' },
    { id: 'Standard', text: 'Standard' },
    { id: 'Hardcore', text: 'Hardcore' }
  ];
}

export function resolveTradeLeague(engine: GameEngine, requestedLeague?: string): string {
  if (requestedLeague && requestedLeague !== 'Auto' && requestedLeague.trim() !== '') {
    return requestedLeague.trim();
  }
  return engine === 'poe2' ? 'Standard' : 'Settlers';
}

export interface BuildTradeSearchUrlOptions {
  engine: GameEngine;
  league: string;
  queryId?: string;
  queryJson?: string;
  isTw?: boolean;
}

export function buildTradeSearchUrl({
  engine,
  league,
  queryId,
  queryJson,
  isTw
}: BuildTradeSearchUrlOptions): string {
  const isTwDomain = isTw ?? detectIsTw(league);
  const webBase = getTradeWebBaseUrl(engine, isTwDomain);
  const encLeague = encodeURIComponent(league);

  if (queryId && queryId.trim() !== '') {
    return `${webBase}/search/${encLeague}/${encodeURIComponent(queryId.trim())}`;
  }

  if (queryJson && queryJson !== '{}' && queryJson.trim() !== '') {
    return `${webBase}/search/${encLeague}?q=${encodeURIComponent(queryJson.trim())}`;
  }

  return `${webBase}/search/${encLeague}`;
}
