import { describe, it, expect } from 'vitest';
import {
  parseLogTimestamp,
  cleanLogLine,
  classifyArea,
  parsePoe2LogLine,
  parsePoe2LogBatch
} from '../poe2LogParser';

describe('poe2LogParser', () => {
  describe('timestamp & cleaning', () => {
    it('should parse valid YYYY/MM/DD timestamps', () => {
      const line = '2024/12/06 18:25:31 12345678 9abcdef [INFO Client 1234] : You have entered Hideout.';
      const ts = parseLogTimestamp(line);
      const d = new Date(ts);
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(11); // 0-indexed December
      expect(d.getDate()).toBe(6);
      expect(d.getHours()).toBe(18);
      expect(d.getMinutes()).toBe(25);
      expect(d.getSeconds()).toBe(31);
    });

    it('should clean log line prefixes properly', () => {
      const line = '2024/12/06 18:25:31 12345678 9abcdef [INFO Client 1234] : You have entered Hideout.';
      expect(cleanLogLine(line)).toBe('You have entered Hideout.');
    });
  });

  describe('classifyArea', () => {
    it('should recognize hideouts', () => {
      expect(classifyArea('Hideout')).toEqual({ isTown: false, isHideout: true, isEndgameMap: false });
      expect(classifyArea('個人的藏身處')).toEqual({ isTown: false, isHideout: true, isEndgameMap: false });
    });

    it('should recognize known PoE 2 towns and camps', () => {
      expect(classifyArea('Clearfell Encampment')).toEqual({ isTown: true, isHideout: false, isEndgameMap: false });
      expect(classifyArea('Kingsmarch')).toEqual({ isTown: true, isHideout: false, isEndgameMap: false });
      expect(classifyArea('Ardura Caravan')).toEqual({ isTown: true, isHideout: false, isEndgameMap: false });
      expect(classifyArea('阿爾杜拉車隊')).toEqual({ isTown: true, isHideout: false, isEndgameMap: false });
    });

    it('should classify waystone endgame maps', () => {
      expect(classifyArea('Riverside Bluff')).toEqual({ isTown: false, isHideout: false, isEndgameMap: true });
      expect(classifyArea('Oasis Ruins')).toEqual({ isTown: false, isHideout: false, isEndgameMap: true });
      expect(classifyArea('黃金台地')).toEqual({ isTown: false, isHideout: false, isEndgameMap: true });
    });
  });

  describe('event parsing', () => {
    it('should parse area generation with level and mapTier', () => {
      const line = '2024/12/06 18:20:00 [INFO Client] : Generating level 79 area "Riverside Bluff" with seed 2841940291';
      const ev = parsePoe2LogLine(line);
      expect(ev).not.toBeNull();
      expect(ev?.type).toBe('AREA_GENERATED');
      if (ev?.type === 'AREA_GENERATED') {
        expect(ev.areaName).toBe('Riverside Bluff');
        expect(ev.level).toBe(79);
        expect(ev.mapTier).toBe(15); // 79 - 64
        expect(ev.seed).toBe('2841940291');
      }
    });

    it('should parse area entered event', () => {
      const line = '2024/12/06 18:20:05 [INFO Client] : Entering area Riverside Bluff';
      const ev = parsePoe2LogLine(line);
      expect(ev).not.toBeNull();
      expect(ev?.type).toBe('AREA_ENTERED');
      if (ev?.type === 'AREA_ENTERED') {
        expect(ev.areaName).toBe('Riverside Bluff');
        expect(ev.isEndgameMap).toBe(true);
      }
    });

    it('should parse boss slain events', () => {
      const qLine = '2024/12/06 18:23:45 [INFO Client] : Quest Complete: Defeat the Map Boss';
      const qEv = parsePoe2LogLine(qLine);
      expect(qEv?.type).toBe('BOSS_SLAIN');

      const nameLine = '2024/12/06 18:23:45 [INFO Client] : Ironbeak the Ravenous has been slain.';
      const nameEv = parsePoe2LogLine(nameLine);
      expect(nameEv?.type).toBe('BOSS_SLAIN');
      if (nameEv?.type === 'BOSS_SLAIN') {
        expect(nameEv.bossName).toBe('Ironbeak the Ravenous');
      }
    });

    it('should parse player died events in English and Chinese', () => {
      const en = '2024/12/06 18:22:10 [INFO Client] : You have died.';
      expect(parsePoe2LogLine(en)?.type).toBe('PLAYER_DIED');

      const zh = '2024/12/06 18:22:10 [INFO Client] : 你已經陣亡。';
      expect(parsePoe2LogLine(zh)?.type).toBe('PLAYER_DIED');
    });

    it('should parse gold received events with comma amounts', () => {
      const line = '2024/12/06 18:21:00 [INFO Client] : You have received 1,450 Gold.';
      const ev = parsePoe2LogLine(line);
      expect(ev?.type).toBe('GOLD_RECEIVED');
      if (ev?.type === 'GOLD_RECEIVED') {
        expect(ev.amount).toBe(1450);
      }

      const zhLine = '2024/12/06 18:21:05 [INFO Client] : 獲得了 8,900 金幣';
      const zhEv = parsePoe2LogLine(zhLine);
      expect(zhEv?.type).toBe('GOLD_RECEIVED');
      if (zhEv?.type === 'GOLD_RECEIVED') {
        expect(zhEv.amount).toBe(8900);
      }
    });

    it('should parse endgame drops: waystones, runes, and currencies', () => {
      const ws = '2024/12/06 18:22:00 [INFO Client] : Waystone (Tier 16)';
      const wsEv = parsePoe2LogLine(ws);
      expect(wsEv?.type).toBe('ITEM_RECEIVED');
      if (wsEv?.type === 'ITEM_RECEIVED') {
        expect(wsEv.category).toBe('waystone');
        expect(wsEv.tier).toBe(16);
      }

      const rune = '2024/12/06 18:22:15 [INFO Client] : Greater Iron Rune';
      const runeEv = parsePoe2LogLine(rune);
      expect(runeEv?.type).toBe('ITEM_RECEIVED');
      if (runeEv?.type === 'ITEM_RECEIVED') {
        expect(runeEv.category).toBe('rune');
      }

      const div = '2024/12/06 18:22:30 [INFO Client] : Divine Orb';
      const divEv = parsePoe2LogLine(div);
      expect(divEv?.type).toBe('ITEM_RECEIVED');
      if (divEv?.type === 'ITEM_RECEIVED') {
        expect(divEv.category).toBe('currency');
        expect(divEv.itemName).toBe('Divine Orb');
      }
    });
  });

  describe('parsePoe2LogBatch', () => {
    it('should parse multi-line batch log text', () => {
      const batch = `
2024/12/06 18:20:00 [INFO Client] : Generating level 79 area "Riverside Bluff" with seed 100
2024/12/06 18:20:05 [INFO Client] : Entering area Riverside Bluff
2024/12/06 18:21:00 [INFO Client] : You have received 1,200 Gold.
2024/12/06 18:22:00 [INFO Client] : Quest Complete: Defeat the Map Boss
2024/12/06 18:23:00 [INFO Client] : You have entered Hideout.
      `.trim();

      const events = parsePoe2LogBatch(batch);
      expect(events).toHaveLength(5);
      expect(events[0].type).toBe('AREA_GENERATED');
      expect(events[1].type).toBe('AREA_ENTERED');
      expect(events[2].type).toBe('GOLD_RECEIVED');
      expect(events[3].type).toBe('BOSS_SLAIN');
      expect(events[4].type).toBe('AREA_ENTERED');
    });
  });
});
