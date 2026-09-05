import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveClipboardHistory,
  loadClipboardHistory,
  saveComparisonTray,
  loadComparisonTray
} from '../clipboardHistoryStorage';
import type { IStoragePort } from '../../../application/ports/IStoragePort';
import type { ClipboardHistoryItem, ComparisonItem } from '../../../domain/history/types';

class MockStorage implements IStoragePort {
  private store = new Map<string, string>();

  getItem<T>(key: string, defaultValue: T): T {
    const val = this.store.get(key);
    if (val === undefined) return defaultValue;
    return val as unknown as T;
  }

  setItem<T>(key: string, value: T): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('clipboardHistoryStorage', () => {
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
  });

  it('saves and loads clipboard history', () => {
    expect(loadClipboardHistory(storage)).toEqual([]);

    const items: ClipboardHistoryItem[] = [
      {
        id: '1',
        rawText: 'Item 1',
        timestamp: 100,
        priceChaos: 10,
        item: {
          name: 'Item 1',
          baseType: 'Helmet',
          rarity: 'Rare',
          language: 'zh',
          rawText: 'Item 1',
          implicits: [],
          explicits: []
        }
      }
    ];

    saveClipboardHistory(items, storage);
    const loaded = loadClipboardHistory(storage);
    expect(loaded).toEqual(items);
  });

  it('handles invalid JSON gracefully', () => {
    storage.setItem('poe_clipboard_history_v1', '{corrupt');
    expect(loadClipboardHistory(storage)).toEqual([]);
  });

  it('saves and loads comparison tray', () => {
    expect(loadComparisonTray(storage)).toEqual([]);

    const items: ComparisonItem[] = [
      {
        id: 'c1',
        addedAt: 100,
        priceChaos: 50,
        item: {
          name: 'Item 1',
          baseType: 'Helmet',
          rarity: 'Rare',
          language: 'zh',
          rawText: 'Item 1',
          implicits: [],
          explicits: []
        }
      }
    ];

    saveComparisonTray(items, storage);
    const loaded = loadComparisonTray(storage);
    expect(loaded).toEqual(items);
  });
});
