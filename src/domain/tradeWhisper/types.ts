export interface StashPosition {
  left: number;
  top: number;
}

export type TradeWhisperStatus =
  | 'pending'
  | 'invited'
  | 'waited'
  | 'traded'
  | 'completed'
  | 'dismissed';

export type TradeWhisperAction =
  | 'invite'
  | 'wait'
  | 'trade'
  | 'thanksAndKick'
  | 'hideout'
  | 'dismiss';

export interface TradeWhisper {
  id: string;
  sender: string;
  guildTag?: string;
  itemName: string;
  itemCount?: number;
  price: string;
  priceAmount?: number;
  priceCurrency?: string;
  league: string;
  stashTab?: string;
  position?: StashPosition;
  rawMessage: string;
  timestamp: number;
  status: TradeWhisperStatus;
}

export interface TradeQuickResponseConfig {
  waitMessageTemplate: string;
  thanksMessageTemplate: string;
  autoOpenOverlayOnWhisper: boolean;
  soundAlertEnabled: boolean;
  clientLogPath?: string;
}

export interface StashCellPercentage {
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}
