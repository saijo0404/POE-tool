import { describe, it, expect } from 'vitest';
import type { ParsedItem } from '../../item/types';
import {
  createHistoryItem,
  addHistoryItem,
  addToComparison,
  removeFromComparison,
  clearComparison,
  compareItems
} from '../clipboardHistoryManager';
import type { ClipboardHistoryItem, ComparisonItem } from '../types';

const mockItemA: ParsedItem = {
  name: '暴怒 避難所',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 85,
  language: 'zh',
  rawText: 'Item A text',
  implicits: [],
  explicits: [
    {
      id: '1',
      text: '+54 最大魔力',
      englishText: '+54 to maximum Mana',
      type: 'explicit',
      value: 54,
      enabled: true
    },
    {
      id: '2',
      text: '+30% 閃電抗性',
      englishText: '+30% to Lightning Resistance',
      type: 'explicit',
      value: 30,
      enabled: true
    }
  ]
};

const mockItemB: ParsedItem = {
  name: '恐懼 之靈',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 80,
  language: 'zh',
  rawText: 'Item B text',
  implicits: [],
  explicits: [
    {
      id: '3',
      text: '+80 最大魔力',
      englishText: '+80 to maximum Mana',
      type: 'explicit',
      value: 80,
      enabled: true
    },
    {
      id: '4',
      text: '+45% 火焰抗性',
      englishText: '+45% to Fire Resistance',
      type: 'explicit',
      value: 45,
      enabled: true
    }
  ]
};

const mockItemC: ParsedItem = {
  name: '勝利 榮耀',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 88,
  language: 'zh',
  rawText: 'Item C text',
  implicits: [],
  explicits: [
    {
      id: '5',
      text: '+20% 閃電抗性',
      englishText: '+20% to Lightning Resistance',
      type: 'explicit',
      value: 20,
      enabled: true
    }
  ]
};

describe('clipboardHistoryManager', () => {
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

  describe('addToComparison & removeFromComparison & clearComparison', () => {
    it('adds item to comparison tray up to max of 4', () => {
      let tray: ComparisonItem[] = [];
      const res1 = addToComparison(tray, mockItemA, 100);
      expect(res1.success).toBe(true);
      tray = res1.tray;
      expect(tray.length).toBe(1);

      const res2 = addToComparison(tray, mockItemB, 150);
      expect(res2.success).toBe(true);
      tray = res2.tray;
      expect(tray.length).toBe(2);

      // Duplicate
      const dup = addToComparison(tray, mockItemA, 100);
      expect(dup.success).toBe(false);
      expect(dup.reason).toBe('ALREADY_EXISTS');
      expect(dup.tray.length).toBe(2);

      const res3 = addToComparison(tray, mockItemC, 200);
      tray = res3.tray;
      const itemD = { ...mockItemA, rawText: 'Item D' };
      const res4 = addToComparison(tray, itemD, 250);
      tray = res4.tray;
      expect(tray.length).toBe(4);

      // Tray full
      const itemE = { ...mockItemA, rawText: 'Item E' };
      const res5 = addToComparison(tray, itemE, 300);
      expect(res5.success).toBe(false);
      expect(res5.reason).toBe('TRAY_FULL');
      expect(res5.tray.length).toBe(4);
    });

    it('removes item by ID and clears tray', () => {
      const res1 = addToComparison([], mockItemA, 100);
      const res2 = addToComparison(res1.tray, mockItemB, 150);
      let tray = res2.tray;

      tray = removeFromComparison(tray, tray[0].id);
      expect(tray.length).toBe(1);
      expect(tray[0].item.name).toBe('恐懼 之靈');

      tray = clearComparison();
      expect(tray.length).toBe(0);
    });
  });

  describe('compareItems', () => {
    it('handles empty tray gracefully', () => {
      const result = compareItems([]);
      expect(result.items).toHaveLength(0);
      expect(result.metrics.priceCount).toBe(0);
      expect(result.affixes).toHaveLength(0);
    });

    it('calculates metrics and affixes comparison correctly', () => {
      const resA = addToComparison([], mockItemA, 100);
      const resB = addToComparison(resA.tray, mockItemB, 200);
      const resC = addToComparison(resB.tray, mockItemC, 150);
      const tray = resC.tray;

      const result = compareItems(tray);
      expect(result.items.length).toBe(3);
      expect(result.metrics.priceMin).toBe(100);
      expect(result.metrics.priceMax).toBe(200);
      expect(result.metrics.priceMedian).toBe(150);
      expect(result.metrics.priceCount).toBe(3);

      expect(result.metrics.itemLevelMin).toBe(80);
      expect(result.metrics.itemLevelMax).toBe(88);
      expect(result.metrics.itemLevelAvg).toBeCloseTo((85 + 80 + 88) / 3, 1);

      // Affix comparisons
      expect(result.affixes.length).toBeGreaterThan(0);
      const manaMod = result.affixes.find(a => a.name.includes('最大魔力'));
      expect(manaMod).toBeDefined();
      expect(manaMod?.values[tray[0].id]).toBe(54);
      expect(manaMod?.values[tray[1].id]).toBe(80);
      expect(manaMod?.values[tray[2].id]).toBeUndefined();
    });

    it('calculates median with even number of items', () => {
      const resA = addToComparison([], mockItemA, 100);
      const resB = addToComparison(resA.tray, mockItemB, 300);
      const result = compareItems(resB.tray);
      expect(result.metrics.priceMedian).toBe(200);
    });
  });
});
