import type { TradeQuickResponseConfig } from './types';
import { getDefaultWhisperTemplates } from './whisperTemplates';

export const DEFAULT_TRADE_WHISPER_CONFIG: TradeQuickResponseConfig = {
  waitMessageTemplate: '正在刷圖中，請稍候 1 分鐘！',
  thanksMessageTemplate: 'ty gl!',
  autoOpenOverlayOnWhisper: true,
  soundAlertEnabled: true,
  clientLogPath: '',
  customTemplates: getDefaultWhisperTemplates()
};

export const ACTION_THEME_COLORS = {
  invite: '#2ecc71',
  wait: '#3498db',
  trade: '#f1c40f',
  thanksAndKick: '#ecf0f1',
  hideout: '#e74c3c'
} as const;

export const ACTION_LABELS = {
  invite: '組隊',
  wait: '稍候',
  trade: '交易',
  thanksAndKick: '謝踢',
  hideout: '藏身處'
} as const;
