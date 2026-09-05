import { describe, it, expect } from 'vitest';
import {
  normalizeHotkey,
  validateHotkey,
  detectHotkeyConflicts,
  isHotkeyTriggered,
  applyPreset
} from '../hotkeyManager';
import type { HotkeyBindingMap } from '../types';

describe('hotkeyManager', () => {
  describe('normalizeHotkey', () => {
    it('normalizes spaces and sorts modifier order correctly', () => {
      expect(normalizeHotkey('Ctrl + D')).toBe('ctrl+d');
      expect(normalizeHotkey('Alt + Ctrl + D')).toBe('ctrl+alt+d');
      expect(normalizeHotkey('Shift + Alt + Ctrl + X')).toBe('ctrl+alt+shift+x');
    });

    it('handles single function keys and letters', () => {
      expect(normalizeHotkey('F10')).toBe('f10');
      expect(normalizeHotkey('  D  ')).toBe('d');
    });
  });

  describe('validateHotkey', () => {
    it('rejects empty or modifier-only keys', () => {
      expect(validateHotkey('').isValid).toBe(false);
      expect(validateHotkey('   ').isValid).toBe(false);
      expect(validateHotkey('ctrl').isValid).toBe(false);
      expect(validateHotkey('ctrl+alt').isValid).toBe(false);
    });

    it('accepts valid hotkey combinations', () => {
      const res = validateHotkey('Ctrl+Shift+D');
      expect(res.isValid).toBe(true);
      expect(res.normalizedKey).toBe('ctrl+shift+d');
    });
  });

  describe('detectHotkeyConflicts', () => {
    it('returns empty when all bindings are distinct', () => {
      const bindings: HotkeyBindingMap = {
        priceCheck: 'ctrl+d',
        dangerCheck: 'ctrl+m',
        whisperReply: 'ctrl+enter',
        overlayPin: 'f10'
      };
      expect(detectHotkeyConflicts(bindings)).toHaveLength(0);
    });

    it('identifies conflict when two actions share the same normalized key', () => {
      const bindings: HotkeyBindingMap = {
        priceCheck: 'ctrl+d',
        dangerCheck: 'Ctrl + D',
        whisperReply: 'ctrl+enter',
        overlayPin: 'f10'
      };
      const conflicts = detectHotkeyConflicts(bindings);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].key).toBe('ctrl+d');
      expect(conflicts[0].actionA).toBe('priceCheck');
      expect(conflicts[0].actionB).toBe('dangerCheck');
    });
  });

  describe('isHotkeyTriggered', () => {
    it('accurately matches keyboard events with normalized bindings', () => {
      const event = { key: 'd', ctrlKey: true, altKey: false, shiftKey: false };
      expect(isHotkeyTriggered(event, 'ctrl+d')).toBe(true);
      expect(isHotkeyTriggered(event, 'ctrl+m')).toBe(false);
      expect(isHotkeyTriggered(event, 'alt+d')).toBe(false);
    });

    it('supports standalone function keys without modifiers', () => {
      const event = { key: 'F10', ctrlKey: false, altKey: false, shiftKey: false };
      expect(isHotkeyTriggered(event, 'f10')).toBe(true);
      expect(isHotkeyTriggered(event, 'ctrl+f10')).toBe(false);
    });
  });

  describe('applyPreset', () => {
    it('returns valid binding map for known preset', () => {
      const bindings = applyPreset('left_hand');
      expect(bindings.priceCheck).toBe('ctrl+q');
      expect(bindings.overlayPin).toBe('ctrl+space');
    });

    it('falls back to standard preset on unknown id', () => {
      const bindings = applyPreset('unknown_preset_id');
      expect(bindings.priceCheck).toBe('ctrl+d');
    });
  });
});
