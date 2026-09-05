import { describe, it, expect } from 'vitest';
import {
  detectIsTw,
  getTradeApiBaseUrl,
  getTradeWebBaseUrl,
  getDefaultTradeLeagues,
  resolveTradeLeague,
  buildTradeSearchUrl
} from '../engineTradeConfig';

describe('engineTradeConfig', () => {
  describe('detectIsTw', () => {
    it('detects Taiwan realm from league string', () => {
      expect(detectIsTw('台服_Settlers')).toBe(true);
      expect(detectIsTw('tw_standard')).toBe(true);
      expect(detectIsTw('standard_tw')).toBe(true);
      expect(detectIsTw('Settlers')).toBe(false);
      expect(detectIsTw(undefined)).toBe(false);
    });
  });

  describe('getTradeApiBaseUrl', () => {
    it('returns official global endpoint for poe1', () => {
      expect(getTradeApiBaseUrl('poe1')).toBe('https://www.pathofexile.com/api/trade');
    });

    it('returns official global endpoint for poe2', () => {
      expect(getTradeApiBaseUrl('poe2')).toBe('https://www.pathofexile.com/api/trade2');
    });

    it('returns official Taiwan endpoint for poe1 and poe2 when isTw is true', () => {
      expect(getTradeApiBaseUrl('poe1', true)).toBe('https://pathofexile.tw/api/trade');
      expect(getTradeApiBaseUrl('poe2', true)).toBe('https://pathofexile.tw/api/trade2');
    });
  });

  describe('getTradeWebBaseUrl', () => {
    it('returns official global web base for poe1 and poe2', () => {
      expect(getTradeWebBaseUrl('poe1')).toBe('https://www.pathofexile.com/trade');
      expect(getTradeWebBaseUrl('poe2')).toBe('https://www.pathofexile.com/trade2');
    });

    it('returns official Taiwan web base for poe1 and poe2', () => {
      expect(getTradeWebBaseUrl('poe1', true)).toBe('https://pathofexile.tw/trade');
      expect(getTradeWebBaseUrl('poe2', true)).toBe('https://pathofexile.tw/trade2');
    });
  });

  describe('getDefaultTradeLeagues', () => {
    it('returns default leagues for poe1', () => {
      const leagues = getDefaultTradeLeagues('poe1');
      expect(leagues.some(l => l.id === 'Settlers')).toBe(true);
      expect(leagues.some(l => l.id === 'Standard')).toBe(true);
    });

    it('returns default leagues for poe2', () => {
      const leagues = getDefaultTradeLeagues('poe2');
      expect(leagues.some(l => l.id === 'Standard')).toBe(true);
      expect(leagues.some(l => l.id === 'Early Access')).toBe(true);
    });
  });

  describe('resolveTradeLeague', () => {
    it('returns specified league when valid', () => {
      expect(resolveTradeLeague('poe1', 'Hardcore Settlers')).toBe('Hardcore Settlers');
      expect(resolveTradeLeague('poe2', 'Early Access')).toBe('Early Access');
    });

    it('falls back to engine default league when Auto or empty', () => {
      expect(resolveTradeLeague('poe1', 'Auto')).toBe('Settlers');
      expect(resolveTradeLeague('poe1', '')).toBe('Settlers');
      expect(resolveTradeLeague('poe2', 'Auto')).toBe('Standard');
      expect(resolveTradeLeague('poe2', '')).toBe('Standard');
      expect(resolveTradeLeague('poe2', undefined)).toBe('Standard');
    });
  });

  describe('buildTradeSearchUrl', () => {
    it('builds search URL with queryId for poe1 and poe2', () => {
      const url1 = buildTradeSearchUrl({
        engine: 'poe1',
        league: 'Settlers',
        queryId: 'abc123xyz'
      });
      expect(url1).toBe('https://www.pathofexile.com/trade/search/Settlers/abc123xyz');

      const url2 = buildTradeSearchUrl({
        engine: 'poe2',
        league: 'Standard',
        queryId: 'xyz987poe2'
      });
      expect(url2).toBe('https://www.pathofexile.com/trade2/search/Standard/xyz987poe2');
    });

    it('builds search URL with queryJson payload', () => {
      const url = buildTradeSearchUrl({
        engine: 'poe2',
        league: 'Standard',
        queryJson: '{"query":{"status":{"option":"online"}}}'
      });
      expect(url).toContain('https://www.pathofexile.com/trade2/search/Standard?q=');
      expect(url).toContain(encodeURIComponent('{"query":{"status":{"option":"online"}}}'));
    });

    it('builds base search URL when no queryId or queryJson is provided', () => {
      const url = buildTradeSearchUrl({
        engine: 'poe2',
        league: 'Early Access'
      });
      expect(url).toBe('https://www.pathofexile.com/trade2/search/Early%20Access');
    });

    it('builds Taiwan domain URL when Taiwan league is detected', () => {
      const url = buildTradeSearchUrl({
        engine: 'poe2',
        league: 'tw_standard',
        queryId: 'tw456'
      });
      expect(url).toBe('https://pathofexile.tw/trade2/search/tw_standard/tw456');
    });
  });
});
