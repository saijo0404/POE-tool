import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboardHistory } from '../useClipboardHistory';
import type { ParsedItem } from '../../domain/item/types';

const mockItemA: ParsedItem = {
  name: '風暴 巨盔',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 84,
  language: 'zh',
  rawText: 'Item A raw text',
  implicits: [],
  explicits: []
};

const mockItemB: ParsedItem = {
  name: '烈焰 巨盔',
  baseType: '罪魔邪冠',
  rarity: 'Rare',
  itemLevel: 80,
  language: 'zh',
  rawText: 'Item B raw text',
  implicits: [],
  explicits: []
};

describe('useClipboardHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records history and persists across renders', () => {
    const { result } = renderHook(() => useClipboardHistory());

    expect(result.current.history).toEqual([]);

    act(() => {
      result.current.recordHistory('Item A raw text', mockItemA, 100);
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].item.name).toBe('風暴 巨盔');
    expect(result.current.history[0].priceChaos).toBe(100);
  });

  it('manages comparison tray add, remove, and clear', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => {
      result.current.handleAddToTray(mockItemA, 100);
      result.current.handleAddToTray(mockItemB, 200);
    });

    expect(result.current.tray.length).toBe(2);

    const firstId = result.current.tray[0].id;
    act(() => {
      result.current.handleRemoveFromTray(firstId);
    });

    expect(result.current.tray.length).toBe(1);
    expect(result.current.tray[0].item.name).toBe('烈焰 巨盔');

    act(() => {
      result.current.handleClearTray();
    });

    expect(result.current.tray.length).toBe(0);
  });

  it('clears history', () => {
    const { result } = renderHook(() => useClipboardHistory());

    act(() => {
      result.current.recordHistory('Item A raw text', mockItemA, 100);
      result.current.handleClearHistory();
    });

    expect(result.current.history.length).toBe(0);
  });
});
