import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClipboardHistoryTray } from '../ClipboardHistoryTray';
import type { ClipboardHistoryItem, ComparisonItem } from '../../../domain/history/types';

const mockItemA: ClipboardHistoryItem = {
  id: 'hist-1',
  rawText: 'Item A raw text',
  timestamp: 1690000000000,
  priceChaos: 120,
  item: {
    name: '雷霆 之護',
    baseType: '罪魔邪冠',
    rarity: 'Rare',
    itemLevel: 85,
    language: 'zh',
    rawText: 'Item A raw text',
    implicits: [],
    explicits: [
      { id: '1', text: '+50 最大生命', englishText: '+50 to maximum Life', type: 'explicit', value: 50, enabled: true }
    ]
  }
};

const mockItemB: ClipboardHistoryItem = {
  id: 'hist-2',
  rawText: 'Item B raw text',
  timestamp: 1690000010000,
  priceChaos: 180,
  item: {
    name: '寒冰 之罩',
    baseType: '罪魔邪冠',
    rarity: 'Rare',
    itemLevel: 82,
    language: 'zh',
    rawText: 'Item B raw text',
    implicits: [],
    explicits: [
      { id: '2', text: '+70 最大生命', englishText: '+70 to maximum Life', type: 'explicit', value: 70, enabled: true }
    ]
  }
};

const mockTrayItems: ComparisonItem[] = [
  { id: 'comp-1', item: mockItemA.item, priceChaos: 120, addedAt: 1690000000000 },
  { id: 'comp-2', item: mockItemB.item, priceChaos: 180, addedAt: 1690000010000 }
];

describe('ClipboardHistoryTray', () => {
  it('renders empty history placeholder when no history exists', () => {
    render(
      <ClipboardHistoryTray
        history={[]}
        tray={[]}
        onSelectHistoryItem={vi.fn()}
        onAddToComparison={vi.fn()}
        onRemoveFromComparison={vi.fn()}
        onClearComparison={vi.fn()}
      />
    );

    expect(screen.getByText(/尚無剪貼簿查價紀錄/)).toBeInTheDocument();
  });

  it('renders history items and handles select and add actions', () => {
    const handleSelect = vi.fn();
    const handleAdd = vi.fn();

    render(
      <ClipboardHistoryTray
        history={[mockItemA]}
        tray={[]}
        onSelectHistoryItem={handleSelect}
        onAddToComparison={handleAdd}
        onRemoveFromComparison={vi.fn()}
        onClearComparison={vi.fn()}
      />
    );

    expect(screen.getByText('雷霆 之護')).toBeInTheDocument();
    expect(screen.getByText('~120c')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /載入/ }));
    expect(handleSelect).toHaveBeenCalledWith(mockItemA);

    fireEvent.click(screen.getByTitle('加入比價暫存列'));
    expect(handleAdd).toHaveBeenCalledWith(mockItemA);
  });

  it('switches to comparison tab and displays metrics and items', () => {
    const handleRemove = vi.fn();
    const handleClear = vi.fn();

    render(
      <ClipboardHistoryTray
        history={[mockItemA, mockItemB]}
        tray={mockTrayItems}
        onSelectHistoryItem={vi.fn()}
        onAddToComparison={vi.fn()}
        onRemoveFromComparison={handleRemove}
        onClearComparison={handleClear}
      />
    );

    const compTab = screen.getByRole('button', { name: /比價暫存列/ });
    fireEvent.click(compTab);

    // Metrics should be visible
    expect(screen.getByText(/價格中位數:/)).toBeInTheDocument();
    expect(screen.getByText('150c')).toBeInTheDocument();
    expect(screen.getByText(/平均物等:/)).toBeInTheDocument();

    // Remove buttons
    const removeButtons = screen.getAllByRole('button', { name: '移除此項' });
    expect(removeButtons.length).toBe(2);
    fireEvent.click(removeButtons[0]);
    expect(handleRemove).toHaveBeenCalledWith('comp-1');

    // Clear comparison
    const clearBtn = screen.getByRole('button', { name: /清空暫存/ });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalled();
  });
});
