import type {
  HotkeyActionId,
  HotkeyBindingMap,
  HotkeyConflict,
  HotkeyValidationResult
} from './types';
import { HOTKEY_PRESETS, getDefaultBindings } from './hotkeyPresets';

const MODIFIER_ORDER: Record<string, number> = {
  ctrl: 1,
  alt: 2,
  shift: 3
};

function cleanKeyPart(part: string): string {
  const p = part.trim().toLowerCase();
  if (p === 'control' || p === 'cmd' || p === 'command') return 'ctrl';
  if (p === 'option') return 'alt';
  return p;
}

export function normalizeHotkey(keyString: string): string {
  if (!keyString || !keyString.trim()) return '';
  const rawParts = keyString.split('+').map(cleanKeyPart).filter(Boolean);

  const modifiers: string[] = [];
  let mainKey = '';

  for (const part of rawParts) {
    if (part === 'ctrl' || part === 'alt' || part === 'shift') {
      if (!modifiers.includes(part)) modifiers.push(part);
    } else {
      mainKey = part;
    }
  }

  modifiers.sort((a, b) => (MODIFIER_ORDER[a] || 99) - (MODIFIER_ORDER[b] || 99));

  if (!mainKey) return modifiers.join('+');
  return modifiers.length > 0 ? `${modifiers.join('+')}+${mainKey}` : mainKey;
}

export function validateHotkey(keyString: string): HotkeyValidationResult {
  const norm = normalizeHotkey(keyString);
  if (!norm) {
    return { isValid: false, error: '快捷鍵不可為空' };
  }

  const parts = norm.split('+');
  const hasMainKey = parts.some(p => p !== 'ctrl' && p !== 'alt' && p !== 'shift');
  if (!hasMainKey) {
    return { isValid: false, error: '缺少觸發主鍵（不可僅包含 Ctrl/Alt/Shift 修飾鍵）' };
  }

  return { isValid: true, normalizedKey: norm };
}

export function detectHotkeyConflicts(bindings: HotkeyBindingMap): HotkeyConflict[] {
  const conflicts: HotkeyConflict[] = [];
  const entries = Object.entries(bindings) as [HotkeyActionId, string][];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [actA, rawA] = entries[i];
      const [actB, rawB] = entries[j];
      const normA = normalizeHotkey(rawA);
      const normB = normalizeHotkey(rawB);

      if (normA && normB && normA === normB) {
        conflicts.push({ actionA: actA, actionB: actB, key: normA });
      }
    }
  }
  return conflicts;
}

export function isHotkeyTriggered(
  event: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean },
  binding: string
): boolean {
  const norm = normalizeHotkey(binding);
  if (!norm) return false;

  const parts = norm.split('+');
  const reqCtrl = parts.includes('ctrl');
  const reqAlt = parts.includes('alt');
  const reqShift = parts.includes('shift');
  const mainKey = parts.find(p => p !== 'ctrl' && p !== 'alt' && p !== 'shift');

  const hasCtrl = Boolean(event.ctrlKey || event.metaKey);
  const hasAlt = Boolean(event.altKey);
  const hasShift = Boolean(event.shiftKey);

  if (reqCtrl !== hasCtrl || reqAlt !== hasAlt || reqShift !== hasShift) {
    return false;
  }

  return event.key.toLowerCase() === mainKey;
}

export function applyPreset(presetId: string): HotkeyBindingMap {
  const preset = HOTKEY_PRESETS.find(p => p.id === presetId);
  return preset ? { ...preset.bindings } : getDefaultBindings();
}
