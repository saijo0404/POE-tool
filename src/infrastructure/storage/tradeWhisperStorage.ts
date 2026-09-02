import type { TradeQuickResponseConfig, TradeWhisper } from '../../domain/tradeWhisper/types';
import { DEFAULT_TRADE_WHISPER_CONFIG } from '../../domain/tradeWhisper/constants';

const STORAGE_KEY_CONFIG = 'poe_tool_trade_whisper_config';
const STORAGE_KEY_HISTORY = 'poe_tool_trade_whisper_history';
const MAX_HISTORY_ITEMS = 30;

export function loadTradeWhisperConfig(): TradeQuickResponseConfig {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_TRADE_WHISPER_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_TRADE_WHISPER_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TRADE_WHISPER_CONFIG,
      ...parsed
    };
  } catch {
    return DEFAULT_TRADE_WHISPER_CONFIG;
  }
}

export function saveTradeWhisperConfig(config: TradeQuickResponseConfig): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('[TradeWhisperStorage] Failed to save config:', err);
  }
}

export function loadTradeWhisperHistory(): TradeWhisper[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

export function saveTradeWhisperHistory(history: TradeWhisper[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const capped = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(capped));
  } catch (err) {
    console.error('[TradeWhisperStorage] Failed to save history:', err);
  }
}
