import { describe, it, expect } from 'vitest';
import {
  addToComparison,
  removeFromComparison,
  clearComparison,
  compareItems
} from '../clipboardHistoryManager';
import type { ComparisonItem } from '../types';
import { mockItemA, mockItemB, mockItemC } from './clipboardHistoryMocks';

describe('clipboardHistoryManager - Comparison Tray Operations', () => {
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
