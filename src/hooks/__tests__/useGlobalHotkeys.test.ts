import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalHotkeys, isHotkeyTriggered } from '../useGlobalHotkeys';
import { poeApi } from '../../services/api';

describe('useGlobalHotkeys Hook & Helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('isHotkeyTriggered', () => {
    it('correctly matches Ctrl+C+D default shortcut', () => {
      const eventD = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true });
      const eventC = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true });
      const eventA = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });

      expect(isHotkeyTriggered(eventD, 'ctrl+c+d')).toBe(true);
      expect(isHotkeyTriggered(eventC, 'ctrl+c+d')).toBe(false);
      expect(isHotkeyTriggered(eventA, 'ctrl+c+d')).toBe(false);
    });

    it('matches custom single key and modifier combinations', () => {
      const eventF2 = new KeyboardEvent('keydown', { key: 'f2', altKey: true });
      expect(isHotkeyTriggered(eventF2, 'alt+f2')).toBe(true);

      const eventShiftD = new KeyboardEvent('keydown', { key: 'd', shiftKey: true });
      expect(isHotkeyTriggered(eventShiftD, 'shift+d')).toBe(true);

      const eventNonMatching = new KeyboardEvent('keydown', { key: 'd' });
      expect(isHotkeyTriggered(eventNonMatching, 'ctrl+d')).toBe(false);
    });
  });

  describe('useGlobalHotkeys hook lifecycle', () => {
    it('triggers callback and reads clipboard on shortcut press', async () => {
      const onTrigger = vi.fn();
      const setPastedText = vi.fn();
      const showToast = vi.fn();

      vi.spyOn(poeApi, 'readClipboard').mockResolvedValue({
        text: 'Rarity: Unique\nHeadhunter',
        isPoeItem: true
      });

      renderHook(() =>
        useGlobalHotkeys({
          hotkey: 'ctrl+c+d',
          onTrigger,
          setPastedText,
          showToast
        })
      );

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true }));
      });

      expect(onTrigger).toHaveBeenCalled();
      expect(setPastedText).toHaveBeenCalledWith('Rarity: Unique\nHeadhunter');
      expect(showToast).toHaveBeenCalledWith(expect.stringContaining('快捷鍵觸發'));
    });

    it('removes listener on unmount', async () => {
      const onTrigger = vi.fn();
      const { unmount } = renderHook(() =>
        useGlobalHotkeys({
          hotkey: 'ctrl+c+d',
          onTrigger,
          setPastedText: vi.fn(),
          showToast: vi.fn()
        })
      );

      unmount();

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true }));
      });

      expect(onTrigger).not.toHaveBeenCalled();
    });
  });
});
