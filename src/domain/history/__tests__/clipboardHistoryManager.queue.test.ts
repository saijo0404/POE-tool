import { describe, it, expect } from 'vitest';
import { createHistoryItem, addHistoryItem } from '../clipboardHistoryManager';
import type { ClipboardHistoryItem } from '../types';
import { mockItemA, mockItemB } from './clipboardHistoryMocks';

describe('clipboardHistoryManager - Queue Operations', () => {
  describe('createHistoryItem', () => {
    it('creates history item with generated ID and timestamp', () => {
      const hist = createHistoryItem('Item A text', mockItemA, 150);
      expect(hist.id).toBeTruthy();
      expect(hist.rawText).toBe('Item A text');
      expect(hist.item).toEqual(mockItemA);
      expect(hist.priceChaos).toBe(150);
      expect(hist.timestamp).toBeGreaterThan(0);
    });
  });

  describe('addHistoryItem', () => {
    it('adds new items up to limit and places latest first', () => {
      let history: ClipboardHistoryItem[] = [];
      const item1 = createHistoryItem('text1', mockItemA, 10);
      const item2 = createHistoryItem('text2', mockItemB, 20);

      history = addHistoryItem(history, item1);
      expect(history.length).toBe(1);
      expect(history[0].id).toBe(item1.id);

      history = addHistoryItem(history, item2);
      expect(history.length).toBe(2);
      expect(history[0].id).toBe(item2.id);
    });

    it('deduplicates when same rawText added, bumping to front', () => {
      const item1 = createHistoryItem('same text', mockItemA, 10, 1000);
      const item2 = createHistoryItem('other text', mockItemB, 20, 2000);
      const item1Updated = createHistoryItem('same text', mockItemA, 50, 3000);

      let history = [item2, item1];
      history = addHistoryItem(history, item1Updated);

      expect(history.length).toBe(2);
      expect(history[0].rawText).toBe('same text');
      expect(history[0].priceChaos).toBe(50);
      expect(history[1].rawText).toBe('other text');
    });

    it('caps queue at maxItems (default 20)', () => {
      let history: ClipboardHistoryItem[] = [];
      for (let i = 0; i < 25; i++) {
        const item = createHistoryItem(`item-${i}`, { ...mockItemA, name: `Item ${i}` });
        history = addHistoryItem(history, item);
      }
      expect(history.length).toBe(20);
      expect(history[0].item.name).toBe('Item 24');
      expect(history[19].item.name).toBe('Item 5');
    });
  });
});
