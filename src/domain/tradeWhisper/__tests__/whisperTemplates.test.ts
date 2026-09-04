import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WHISPER_TEMPLATES,
  getDefaultWhisperTemplates,
  interpolateWhisperTemplate,
  buildWhisperResponseCommand,
  validateWhisperTemplate,
  mergeWhisperTemplates,
  type WhisperTemplate
} from '../whisperTemplates';

describe('whisperTemplates', () => {
  describe('getDefaultWhisperTemplates', () => {
    it('returns array of default templates with unique ids', () => {
      const templates = getDefaultWhisperTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(4);
      const ids = new Set(templates.map(t => t.id));
      expect(ids.size).toBe(templates.length);
    });

    it('returns a new array each time', () => {
      const a = getDefaultWhisperTemplates();
      const b = getDefaultWhisperTemplates();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('interpolateWhisperTemplate', () => {
    it('replaces all placeholders accurately', () => {
      const tpl = '嗨 {buyer}，你要買的 {item} ({price}) 在 {stash}，請稍候！';
      const result = interpolateWhisperTemplate(tpl, {
        buyer: '<VIP> PlayerOne',
        item: 'Headhunter Leather Belt',
        price: '50 divine',
        stashTab: 'Special'
      });
      expect(result).toBe('嗨 PlayerOne，你要買的 Headhunter Leather Belt (50 divine) 在 Special，請稍候！');
    });

    it('handles missing or undefined placeholders gracefully', () => {
      const tpl = '嗨 {buyer}，{item} 已售出！';
      const result = interpolateWhisperTemplate(tpl, {
        buyer: 'Tester'
      });
      expect(result).toBe('嗨 Tester，已售出！');
    });

    it('leaves template without placeholders unchanged', () => {
      const tpl = '正在打王攻堅中，稍候！';
      const result = interpolateWhisperTemplate(tpl, { buyer: 'John' });
      expect(result).toBe('正在打王攻堅中，稍候！');
    });
  });

  describe('buildWhisperResponseCommand', () => {
    it('builds standard in-game whisper command', () => {
      const cmd = buildWhisperResponseCommand('<PRO> BuyerBob', '正在打王中，請稍等！');
      expect(cmd).toBe('@BuyerBob 正在打王中，請稍等！');
    });

    it('interpolates template parameters in the whisper command', () => {
      const cmd = buildWhisperResponseCommand('<PRO> BuyerBob', '抱歉 {buyer}，{item} 已售出！', {
        item: 'Mageblood'
      });
      expect(cmd).toBe('@BuyerBob 抱歉 BuyerBob，Mageblood 已售出！');
    });
  });

  describe('validateWhisperTemplate', () => {
    it('succeeds for valid template', () => {
      const valid: WhisperTemplate = {
        id: 'tpl-custom-1',
        label: '自訂問候',
        message: '哈囉 {buyer}，馬上過去！',
        category: 'custom'
      };
      const res = validateWhisperTemplate(valid);
      expect(res.isOk()).toBe(true);
      if (res.isOk()) {
        expect(res.value.id).toBe('tpl-custom-1');
      }
    });

    it('fails when id is empty', () => {
      const res = validateWhisperTemplate({
        id: '',
        label: '測試',
        message: '內容',
        category: 'custom'
      });
      expect(res.isErr()).toBe(true);
      if (res.isErr()) {
        expect(res.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('fails when label is empty or too long', () => {
      const resEmpty = validateWhisperTemplate({
        id: 'tpl-1',
        label: '   ',
        message: '內容',
        category: 'custom'
      });
      expect(resEmpty.isErr()).toBe(true);

      const resLong = validateWhisperTemplate({
        id: 'tpl-1',
        label: 'A'.repeat(40),
        message: '內容',
        category: 'custom'
      });
      expect(resLong.isErr()).toBe(true);
    });

    it('fails when message is empty or exceeds limit', () => {
      const resEmpty = validateWhisperTemplate({
        id: 'tpl-1',
        label: '測試',
        message: '',
        category: 'custom'
      });
      expect(resEmpty.isErr()).toBe(true);

      const resLong = validateWhisperTemplate({
        id: 'tpl-1',
        label: '測試',
        message: 'x'.repeat(250),
        category: 'custom'
      });
      expect(resLong.isErr()).toBe(true);
    });
  });

  describe('mergeWhisperTemplates', () => {
    it('returns default templates when saved list is empty or undefined', () => {
      expect(mergeWhisperTemplates(undefined)).toEqual(DEFAULT_WHISPER_TEMPLATES);
      expect(mergeWhisperTemplates([])).toEqual(DEFAULT_WHISPER_TEMPLATES);
    });

    it('merges custom templates with default templates without duplicates', () => {
      const custom: WhisperTemplate = {
        id: 'custom-1',
        label: '客製回覆',
        message: '客製訊息',
        category: 'custom'
      };
      const merged = mergeWhisperTemplates([custom]);
      expect(merged.some(t => t.id === 'custom-1')).toBe(true);
      expect(merged.some(t => t.id === 'tpl-wait-map')).toBe(true);
    });
  });
});
