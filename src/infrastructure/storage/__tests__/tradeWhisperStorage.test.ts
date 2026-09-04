import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadTradeWhisperConfig,
  saveTradeWhisperConfig,
  loadTradeWhisperHistory,
  saveTradeWhisperHistory,
  loadWhisperTemplates,
  saveWhisperTemplates
} from '../tradeWhisperStorage';
import { DEFAULT_TRADE_WHISPER_CONFIG } from '../../../domain/tradeWhisper/constants';
import type { TradeWhisper } from '../../../domain/tradeWhisper/types';

describe('tradeWhisperStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default config when storage is empty', () => {
    const cfg = loadTradeWhisperConfig();
    expect(cfg).toEqual(DEFAULT_TRADE_WHISPER_CONFIG);
  });

  it('saves and loads customized config correctly', () => {
    saveTradeWhisperConfig({
      ...DEFAULT_TRADE_WHISPER_CONFIG,
      waitMessageTemplate: 'Wait 30s please'
    });
    const loaded = loadTradeWhisperConfig();
    expect(loaded.waitMessageTemplate).toBe('Wait 30s please');
  });

  it('saves and loads history capped to max limit', () => {
    const dummyWhisper: TradeWhisper = {
      id: 'tw-1',
      sender: 'Buyer1',
      itemName: 'Headhunter',
      price: '50 divine',
      league: 'Settlers',
      rawMessage: '@From Buyer1: Hi...',
      timestamp: 1234567,
      status: 'pending'
    };
    saveTradeWhisperHistory([dummyWhisper]);
    const history = loadTradeWhisperHistory();
    expect(history.length).toBe(1);
    expect(history[0].sender).toBe('Buyer1');
  });

  it('loads and saves custom whisper templates', () => {
    const defaultTemplates = loadWhisperTemplates();
    expect(defaultTemplates.length).toBeGreaterThanOrEqual(4);

    const customList = [
      ...defaultTemplates,
      {
        id: 'tpl-my-custom',
        label: '自訂模板',
        message: '稍後聯繫',
        category: 'custom' as const
      }
    ];
    saveWhisperTemplates(customList);
    const loaded = loadWhisperTemplates();
    expect(loaded.some(t => t.id === 'tpl-my-custom')).toBe(true);
  });
});
