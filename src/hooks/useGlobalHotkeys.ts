import { useEffect } from 'react';
import { poeApi } from '../services/api';

export interface UseGlobalHotkeysOptions {
  hotkey: string;
  onTrigger: () => void;
  setPastedText: (text: string) => void;
  showToast: (msg: string) => void;
}

export function isHotkeyTriggered(e: KeyboardEvent, hotkey: string): boolean {
  const norm = hotkey.toLowerCase();
  const hasCtrl = norm.includes('ctrl') || norm.includes('cmd');
  const hasAlt = norm.includes('alt');
  const hasShift = norm.includes('shift');

  const ctrlActive = e.ctrlKey || e.metaKey;
  const key = e.key.toLowerCase();

  if (hasCtrl && ctrlActive) {
    if (norm.includes('c') && norm.includes('d')) {
      return key === 'd';
    }
    return norm.includes(key) && key !== 'c';
  }
  if (hasAlt && e.altKey && norm.includes(key)) {
    return true;
  }
  if (hasShift && e.shiftKey && norm.includes(key)) {
    return true;
  }
  return false;
}

export function useGlobalHotkeys(options: UseGlobalHotkeysOptions): void {
  const { hotkey, onTrigger, setPastedText, showToast } = options;

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!isHotkeyTriggered(e, hotkey)) return;

      e.preventDefault();
      onTrigger();
      try {
        const serverRes = await poeApi.readClipboard();
        const text = serverRes?.text || (await navigator.clipboard.readText().catch(() => ''));
        if (text) {
          setPastedText(text);
          showToast(`快捷鍵觸發 (${hotkey.toUpperCase()})：已自動讀取裝備並完成查價！`);
        } else {
          showToast(`快捷鍵觸發 (${hotkey.toUpperCase()})：剪貼簿中無文字內容`);
        }
      } catch {
        showToast('快捷鍵觸發：已為您開啟裝備查價工具！');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkey, onTrigger, setPastedText, showToast]);
}
