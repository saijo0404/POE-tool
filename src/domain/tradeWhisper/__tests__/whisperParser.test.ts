import { describe, it, expect } from 'vitest';
import { isTradeWhisper, parseTradeWhisper } from '../whisperParser';

describe('whisperParser (TDD)', () => {
  describe('isTradeWhisper', () => {
    it('returns true for standard English trade whisper', () => {
      const msg = '@From ShadowNinja: Hi, I would like to buy your Mageblood Heavy Belt listed for 200 divine in Settlers (stash tab "~b/o 200 divine"; position: left 4, top 8)';
      expect(isTradeWhisper(msg)).toBe(true);
    });

    it('returns true for English bulk currency trade whisper', () => {
      const msg = "@From TraderJoe: Hi, I'd like to buy your 50 Divine Orb for my 7500 Chaos Orb in Settlers.";
      expect(isTradeWhisper(msg)).toBe(true);
    });

    it('returns true for Traditional Chinese trade whisper', () => {
      const msg = '@來自 流亡勇者: 你好，我想購買 獵首 皮革腰帶 標價 50 divine 在 聯盟 (倉庫分頁 "出售"; 位置: 左 2, 上 5)';
      expect(isTradeWhisper(msg)).toBe(true);
    });

    it('returns true for Simplified Chinese trade whisper', () => {
      const msg = '@来自 流亡勇者: 你好，我想购买 猎首 皮革腰带 标价 50 divine 在 联盟 (仓库分页 "出售"; 位置: 左 2, 上 5)';
      expect(isTradeWhisper(msg)).toBe(true);
    });

    it('returns true for Client.txt log formatted lines', () => {
      const logLine = '2026/09/03 07:15:20 12345678 9abcdef [INFO Client 12345] @From Exile1: Hi, I would like to buy your Tabula Rasa Simple Robe listed for 10 chaos in Settlers.';
      expect(isTradeWhisper(logLine)).toBe(true);
    });

    it('returns false for normal chat or non-trade messages', () => {
      expect(isTradeWhisper('@From Friend: Are you ready for maps?')).toBe(false);
      expect(isTradeWhisper('/hideout')).toBe(false);
      expect(isTradeWhisper('Random message in global chat')).toBe(false);
      expect(isTradeWhisper('')).toBe(false);
    });
  });

  describe('parseTradeWhisper', () => {
    it('correctly parses standard English whisper with position', () => {
      const msg = '@From <ProGuild> PlayerOne: Hi, I would like to buy your Headhunter Leather Belt listed for 65 divine in Settlers (stash tab "~b/o 65 divine"; position: left 3, top 7)';
      const res = parseTradeWhisper(msg);
      expect(res).not.toBeNull();
      expect(res?.sender).toBe('PlayerOne');
      expect(res?.guildTag).toBe('ProGuild');
      expect(res?.itemName).toBe('Headhunter Leather Belt');
      expect(res?.price).toBe('65 divine');
      expect(res?.priceAmount).toBe(65);
      expect(res?.priceCurrency).toBe('divine');
      expect(res?.league).toBe('Settlers');
      expect(res?.stashTab).toBe('~b/o 65 divine');
      expect(res?.position).toEqual({ left: 3, top: 7 });
    });

    it('correctly parses whisper without guild tag and without position', () => {
      const msg = '@From SoloPlayer: Hi, I would like to buy your Divine Beauty listed for 2 divine in Standard';
      const res = parseTradeWhisper(msg);
      expect(res).not.toBeNull();
      expect(res?.sender).toBe('SoloPlayer');
      expect(res?.guildTag).toBeUndefined();
      expect(res?.itemName).toBe('Divine Beauty');
      expect(res?.price).toBe('2 divine');
      expect(res?.priceAmount).toBe(2);
      expect(res?.priceCurrency).toBe('divine');
      expect(res?.league).toBe('Standard');
      expect(res?.position).toBeUndefined();
    });

    it('correctly parses Traditional Chinese whisper', () => {
      const msg = '@來自 <榮耀> 冰霜法師: 你好，我想購買 獵首 皮革腰帶 標價 50 divine 在 聯盟 (倉庫分頁 "精選特價"; 位置: 左 5, 上 9)';
      const res = parseTradeWhisper(msg);
      expect(res).not.toBeNull();
      expect(res?.sender).toBe('冰霜法師');
      expect(res?.guildTag).toBe('榮耀');
      expect(res?.itemName).toBe('獵首 皮革腰帶');
      expect(res?.price).toBe('50 divine');
      expect(res?.stashTab).toBe('精選特價');
      expect(res?.position).toEqual({ left: 5, top: 9 });
    });

    it('correctly parses bulk currency whisper', () => {
      const msg = "@From MoneyBags: Hi, I'd like to buy your 20 Divine Orb for my 3000 Chaos Orb in Settlers.";
      const res = parseTradeWhisper(msg);
      expect(res).not.toBeNull();
      expect(res?.sender).toBe('MoneyBags');
      expect(res?.itemName).toBe('20 Divine Orb');
      expect(res?.price).toBe('3000 Chaos Orb');
      expect(res?.league).toBe('Settlers');
    });

    it('strips Client.txt log prefix automatically', () => {
      const logLine = '2026/09/03 12:00:00 456789 12345 [INFO Client 8888] : @From QuickBuyer: Hi, I would like to buy your Mirror Shard listed for 30 divine in Settlers';
      const res = parseTradeWhisper(logLine);
      expect(res).not.toBeNull();
      expect(res?.sender).toBe('QuickBuyer');
      expect(res?.itemName).toBe('Mirror Shard');
      expect(res?.price).toBe('30 divine');
    });

    it('returns null for non-trade strings', () => {
      expect(parseTradeWhisper('Hello world')).toBeNull();
      expect(parseTradeWhisper('@From Friend: hi')).toBeNull();
    });
  });
});
