export type HotkeyActionId = 'priceCheck' | 'dangerCheck' | 'whisperReply' | 'overlayPin';

export interface HotkeyActionDef {
  id: HotkeyActionId;
  nameZh: string;
  description: string;
  defaultKey: string;
}

export interface HotkeyBindingMap {
  priceCheck: string;
  dangerCheck: string;
  whisperReply: string;
  overlayPin: string;
}

export interface HotkeyPreset {
  id: string;
  nameZh: string;
  description: string;
  bindings: HotkeyBindingMap;
}

export interface HotkeyValidationResult {
  isValid: boolean;
  normalizedKey?: string;
  error?: string;
}

export interface HotkeyConflict {
  actionA: HotkeyActionId;
  actionB: HotkeyActionId;
  key: string;
}
