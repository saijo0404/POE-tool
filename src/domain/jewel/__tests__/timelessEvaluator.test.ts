import { describe, it, expect } from 'vitest';
import {
  parseTimelessJewelText,
  evaluateTimelessJewel
} from '../timelessEvaluator';

describe('timelessEvaluator', () => {
  describe('parseTimelessJewelText', () => {
    it('parses Glorious Vanity with Doryani and seed number from Chinese text', () => {
      const text = `
        稀 有 度: 傳奇
        輝煌的虛榮
        永恆珠寶
        --------
        受 3120 位卡魯勇士的鮮血浸沐
        受 多里亞尼 (Doryani) 指引
        範圍內的核心被動技能將被瓦爾之神征服
      `;
      const parsed = parseTimelessJewelText(text);
      expect(parsed.jewelType).toBe('glorious_vanity');
      expect(parsed.leaderId).toBe('doryani');
      expect(parsed.seedNumber).toBe(3120);
    });

    it('parses Lethal Pride with Rakiata and seed from English/mixed text', () => {
      const text = `
        Item Class: Jewels
        Rarity: Unique
        Lethal Pride
        Timeless Jewel
        --------
        Commemorates 14500 fallen warriors who fought under Rakiata
        Passives in radius are Conquered by the Karui
      `;
      const parsed = parseTimelessJewelText(text);
      expect(parsed.jewelType).toBe('lethal_pride');
      expect(parsed.leaderId).toBe('rakiata');
      expect(parsed.seedNumber).toBe(14500);
    });

    it('gracefully handles non-timeless text without error', () => {
      const parsed = parseTimelessJewelText('普通的黃金戒指 +50 生命');
      expect(parsed.jewelType).toBeUndefined();
      expect(parsed.leaderId).toBeUndefined();
    });
  });

  describe('evaluateTimelessJewel', () => {
    it('evaluates Doryani Glorious Vanity as S-tier Corrupted Soul', () => {
      const result = evaluateTimelessJewel('glorious_vanity', 'doryani', 3120);
      expect(result.jewelType).toBe('glorious_vanity');
      expect(result.keystoneNameZh).toBe('腐化靈魂');
      expect(result.ratingTier).toBe('S');
      expect(result.popularityScore).toBeGreaterThanOrEqual(90);
      expect(result.synergyBuilds).toContain('血盾混和 (Hybrid)');
      expect(result.estimatedPriceRangeChaos[0]).toBeGreaterThanOrEqual(100);
    });

    it('evaluates Dominus Militant Faith as S-tier Inner Conviction', () => {
      const result = evaluateTimelessJewel('militant_faith', 'dominus', 5200);
      expect(result.keystoneNameZh).toBe('內心信念');
      expect(result.ratingTier).toBe('S');
    });

    it('falls back to default leader if unknown leader provided', () => {
      const result = evaluateTimelessJewel('brutal_restraint', 'non_existent_leader', 2000);
      expect(result.jewelType).toBe('brutal_restraint');
      expect(result.keystoneNameZh).toBeDefined();
    });
  });
});
