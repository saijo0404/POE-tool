import type { IStoragePort } from '../../application/ports/IStoragePort';
import { defaultStorage } from './LocalStorageAdapter';
import type { ClipboardHistoryItem, ComparisonItem } from '../../domain/history/types';

const STORAGE_KEY_HISTORY = 'poe_clipboard_history_v1';
const STORAGE_KEY_TRAY = 'poe_comparison_tray_v1';

export function saveClipboardHistory(
  history: ClipboardHistoryItem[],
  storage: IStoragePort = defaultStorage
): void {
  storage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
}

export function loadClipboardHistory(
  storage: IStoragePort = defaultStorage
): ClipboardHistoryItem[] {
  const raw = storage.getItem<string | null>(STORAGE_KEY_HISTORY, null);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveComparisonTray(
  tray: ComparisonItem[],
  storage: IStoragePort = defaultStorage
): void {
  storage.setItem(STORAGE_KEY_TRAY, JSON.stringify(tray));
}

export function loadComparisonTray(
  storage: IStoragePort = defaultStorage
): ComparisonItem[] {
  const raw = storage.getItem<string | null>(STORAGE_KEY_TRAY, null);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
