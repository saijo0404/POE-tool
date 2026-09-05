import { useState, useEffect, useCallback } from 'react';
import type { ParsedItem } from '../domain/item/types';
import type { ClipboardHistoryItem, ComparisonItem } from '../domain/history/types';
import {
  createHistoryItem,
  addHistoryItem,
  addToComparison,
  removeFromComparison,
  clearComparison
} from '../domain/history/clipboardHistoryManager';
import {
  loadClipboardHistory,
  saveClipboardHistory,
  loadComparisonTray,
  saveComparisonTray
} from '../infrastructure/storage/clipboardHistoryStorage';

export function useClipboardHistory() {
  const [history, setHistory] = useState<ClipboardHistoryItem[]>(() => loadClipboardHistory());
  const [tray, setTray] = useState<ComparisonItem[]>(() => loadComparisonTray());

  useEffect(() => {
    saveClipboardHistory(history);
  }, [history]);

  useEffect(() => {
    saveComparisonTray(tray);
  }, [tray]);

  const recordHistory = useCallback((rawText: string, item: ParsedItem, priceChaos?: number) => {
    const newItem = createHistoryItem(rawText, item, priceChaos);
    setHistory(prev => addHistoryItem(prev, newItem));
  }, []);

  const handleAddToTray = useCallback((itemOrHist: ClipboardHistoryItem | ParsedItem, priceChaos?: number) => {
    const targetItem = 'rawText' in itemOrHist && 'item' in itemOrHist ? itemOrHist.item : itemOrHist;
    const targetPrice = 'priceChaos' in itemOrHist ? itemOrHist.priceChaos : priceChaos;
    setTray(prev => {
      const res = addToComparison(prev, targetItem, targetPrice);
      return res.success ? res.tray : prev;
    });
  }, []);

  const handleRemoveFromTray = useCallback((id: string) => {
    setTray(prev => removeFromComparison(prev, id));
  }, []);

  const handleClearTray = useCallback(() => {
    setTray(clearComparison());
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    tray,
    recordHistory,
    handleAddToTray,
    handleRemoveFromTray,
    handleClearTray,
    handleClearHistory
  };
}
