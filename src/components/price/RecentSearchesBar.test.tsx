import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentSearchesBar } from './RecentSearchesBar';
import type { RecentSearchItem } from '../../hooks/usePriceChecker';

describe('RecentSearchesBar Component', () => {
  it('returns null when recentSearches is empty', () => {
    const { container } = render(
      <RecentSearchesBar recentSearches={[]} onSelectSearch={vi.fn()} onClearSearches={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders recent searches list with Divine and Chaos price tags and triggers select/clear', () => {
    const mockSearches: RecentSearchItem[] = [
      {
        id: '1',
        timestamp: 1000,
        name: 'Mageblood',
        baseType: 'Heavy Belt',
        rarity: 'Unique',
        rawText: 'Item 1 Text',
        minPriceDivine: 150,
      },
      {
        id: '2',
        timestamp: 2000,
        name: 'Gloom Circle',
        baseType: 'Two-Stone Ring',
        rarity: 'Rare',
        rawText: 'Item 2 Text',
        minPriceChaos: 80,
      },
      {
        id: '3',
        timestamp: 3000,
        name: 'Tabula Rasa',
        baseType: 'Simple Robe',
        rarity: 'Unique',
        rawText: 'Item 3 Text',
      }
    ];

    const onSelectSearch = vi.fn();
    const onClearSearches = vi.fn();

    render(
      <RecentSearchesBar
        recentSearches={mockSearches}
        onSelectSearch={onSelectSearch}
        onClearSearches={onClearSearches}
      />
    );

    expect(screen.getByText(/最近查價:/i)).toBeInTheDocument();
    expect(screen.getByText('Mageblood')).toBeInTheDocument();
    expect(screen.getByText('150 Div')).toBeInTheDocument();

    expect(screen.getByText('Gloom Circle')).toBeInTheDocument();
    expect(screen.getByText('80 C')).toBeInTheDocument();

    expect(screen.getByText('Tabula Rasa')).toBeInTheDocument();

    // Click item 1
    const magebloodBtn = screen.getByText('Mageblood').closest('button')!;
    fireEvent.click(magebloodBtn);
    expect(onSelectSearch).toHaveBeenCalledWith(mockSearches[0]);

    // Click clear searches
    const clearBtn = screen.getByTitle('清空歷史記錄');
    fireEvent.click(clearBtn);
    expect(onClearSearches).toHaveBeenCalledTimes(1);
  });
});
