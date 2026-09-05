import { describe, expect, it } from 'vitest';
import {
  lookupChineseBaseType,
  lookupEnglishBaseType,
  lookupPoe2Stat,
  normalizePattern,
} from '../statLookup';

describe('PoE 2 Dictionary & Base Type Lookups', () => {
  describe('Bi-directional Base Type Lookups', () => {
    it('should look up Waystones bi-directionally across tiers 1-16', () => {
      // Tier 1
      expect(lookupEnglishBaseType('尋路石 (階級 1)')).toBe('Waystone (Tier 1)');
      expect(lookupChineseBaseType('Waystone (Tier 1)')).toBe('尋路石 (階級 1)');

      // Tier 16
      expect(lookupEnglishBaseType('尋路石 (階級 16)')).toBe('Waystone (Tier 16)');
      expect(lookupChineseBaseType('Waystone (Tier 16)')).toBe('尋路石 (階級 16)');

      // Shorthands
      expect(lookupEnglishBaseType('尋路石 T10')).toBe('Waystone (Tier 10)');
      expect(lookupEnglishBaseType('尋路石 (T5)')).toBe('Waystone (Tier 5)');
    });

    it('should look up Uncut Gems bi-directionally across tiers 1-20', () => {
      // Tier 1
      expect(lookupEnglishBaseType('未切割寶石 (階級 1)')).toBe('Uncut Gem (Tier 1)');
      expect(lookupChineseBaseType('Uncut Gem (Tier 1)')).toBe('未切割寶石 (階級 1)');

      // Tier 20
      expect(lookupEnglishBaseType('未切割寶石 (階級 20)')).toBe('Uncut Gem (Tier 20)');
      expect(lookupChineseBaseType('Uncut Gem (Tier 20)')).toBe('未切割寶石 (階級 20)');

      // Shorthand
      expect(lookupEnglishBaseType('未切割寶石 T15')).toBe('Uncut Gem (Tier 15)');
    });

    it('should look up Runes and Currencies bi-directionally', () => {
      expect(lookupEnglishBaseType('太陽符文')).toBe('Sun Rune');
      expect(lookupChineseBaseType('Sun Rune')).toBe('太陽符文');

      expect(lookupEnglishBaseType('風暴符文')).toBe('Storm Rune');
      expect(lookupChineseBaseType('Storm Rune')).toBe('風暴符文');

      expect(lookupEnglishBaseType('金幣')).toBe('Gold');
      expect(lookupChineseBaseType('Gold')).toBe('金幣');

      expect(lookupEnglishBaseType('神聖石')).toBe('Divine Orb');
      expect(lookupChineseBaseType('Divine Orb')).toBe('神聖石');
    });

    it('should return undefined for empty or unknown base types', () => {
      expect(lookupEnglishBaseType('')).toBeUndefined();
      expect(lookupChineseBaseType('')).toBeUndefined();
      expect(lookupEnglishBaseType('未知的自訂裝備基底XYZ')).toBeUndefined();
      expect(lookupChineseBaseType('Unknown Random Base ABC')).toBeUndefined();
    });
  });

  describe('PoE 2 Stat Lookups', () => {
    it('should match Spirit affixes in Chinese and English', () => {
      const zh = lookupPoe2Stat('+45 最大精魂');
      expect(zh).not.toBeNull();
      expect(zh?.id).toBe('explicit.stat_spirit');
      expect(zh?.value).toBe(45);
      expect(zh?.minValue).toBe(Math.floor(45 * 0.85));
      expect(zh?.maxValue).toBe(Math.ceil(45 * 1.15));

      const en = lookupPoe2Stat('+45 to maximum Spirit');
      expect(en).not.toBeNull();
      expect(en?.id).toBe('explicit.stat_spirit');
      expect(en?.value).toBe(45);
    });

    it('should match Dodge roll affixes', () => {
      const rollZh = lookupPoe2Stat('增加 20% 翻滾冷卻回復率');
      expect(rollZh).not.toBeNull();
      expect(rollZh?.id).toBe('explicit.stat_dodge_roll_recovery_rate');
      expect(rollZh?.value).toBe(20);

      const rollEn = lookupPoe2Stat('20% increased Dodge Roll Recovery Rate');
      expect(rollEn).not.toBeNull();
      expect(rollEn?.id).toBe('explicit.stat_dodge_roll_recovery_rate');
    });

    it('should match Sockets, Buildup, and Weapon Sets', () => {
      const socket = lookupPoe2Stat('+2 個符文插槽');
      expect(socket?.id).toBe('explicit.stat_rune_sockets');
      expect(socket?.value).toBe(2);

      const socketEn = lookupPoe2Stat('+2 Rune Sockets');
      expect(socketEn?.id).toBe('explicit.stat_rune_sockets');

      const freeze = lookupPoe2Stat('+15% 冰凍積蓄');
      expect(freeze?.id).toBe('explicit.stat_freeze_buildup');

      const weapon1 = lookupPoe2Stat('武器配置 1: 增加 30% 物理傷害');
      expect(weapon1?.id).toBe('explicit.stat_weapon_set_1_phys');

      const weapon2 = lookupPoe2Stat('武器配置 2: 增加 25% 元素傷害');
      expect(weapon2?.id).toBe('explicit.stat_weapon_set_2_elem');
    });

    it('should support fallback substring search for noisy modifier strings', () => {
      const noisyZh = '前綴 物品帶有 +50 最大精魂 數值效果';
      const matchZh = lookupPoe2Stat(noisyZh);
      expect(matchZh).not.toBeNull();
      expect(matchZh?.id).toBe('explicit.stat_spirit');
      expect(matchZh?.value).toBe(50);

      const noisyEn = 'Crafted 15% increased Dodge Roll Recovery Rate On Boots';
      const matchEn = lookupPoe2Stat(noisyEn);
      expect(matchEn).not.toBeNull();
      expect(matchEn?.id).toBe('explicit.stat_dodge_roll_recovery_rate');
    });

    it('should return null for unmatched strings', () => {
      expect(lookupPoe2Stat('')).toBeNull();
      expect(lookupPoe2Stat('完全不相干的雜訊文字 9999')).toBeNull();
    });

    it('should perform stat lookups well within 5ms latency threshold', () => {
      const testCases = [
        '+35 最大精魂',
        '增加 18% 翻滾冷卻回復率',
        '+2 個符文插槽',
        '武器配置 1: 增加 30% 物理傷害',
        '+25% 冰凍積蓄',
      ];

      const start = performance.now();
      const iterations = 500;
      for (let i = 0; i < iterations; i++) {
        for (const tc of testCases) {
          lookupPoe2Stat(tc);
        }
      }
      const totalElapsed = performance.now() - start;
      const avgPerQueryMs = totalElapsed / (iterations * testCases.length);

      // Average lookup must be <= 5ms (typically < 0.05ms)
      expect(avgPerQueryMs).toBeLessThan(5.0);
    });
  });

  describe('normalizePattern', () => {
    it('replaces numbers with # and trims whitespace', () => {
      expect(normalizePattern('+50 最大精魂')).toBe('# 最大精魂');
      expect(normalizePattern('增加 20.5% 能量護盾充能率')).toBe('增加 #% 能量護盾充能率');
    });
  });
});
