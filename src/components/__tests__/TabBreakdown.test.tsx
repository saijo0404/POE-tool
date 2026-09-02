import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TabBreakdown } from '../TabBreakdown';
import type { StashItem } from '../../types/poe';

describe('TabBreakdown Component', () => {
  const sampleSummaries = [
    {
      tabName: 'CurrencyTab',
      category: 'Currency',
      itemCount: 15,
      totalValueChaos: 2500,
      totalValueDivine: 15.6
    },
    {
      tabName: 'CardsTab',
      category: 'DivCard',
      itemCount: 8,
      totalValueChaos: 800,
      totalValueDivine: 5.0
    }
  ];

  const sampleItems: StashItem[] = [
    {
      id: 'div_1',
      name: '',
      typeLine: 'Divine Orb',
      stackSize: 5,
      icon: 'divine.png',
      tabName: 'CurrencyTab',
      unitPriceChaos: 150,
      unitPriceDivine: 1,
      totalPriceChaos: 750,
      totalPriceDivine: 5,
      category: 'Currency'
    },
    {
      id: 'chaos_1',
      name: '',
      typeLine: 'Chaos Orb',
      stackSize: 100,
      icon: 'chaos.png',
      tabName: 'CurrencyTab',
      unitPriceChaos: 1,
      unitPriceDivine: 0.0067,
      totalPriceChaos: 100,
      totalPriceDivine: 0.67,
      category: 'Currency'
    }
  ];

  it('renders tab breakdown categories and total chaos value', () => {
    render(<TabBreakdown tabSummaries={sampleSummaries} topItems={[]} totalChaos={3300} allItems={sampleItems} />);

    expect(screen.getByText('CurrencyTab')).toBeInTheDocument();
    expect(screen.getByText('CardsTab')).toBeInTheDocument();
    expect(screen.getByText('Divine Orb')).toBeInTheDocument();
  });

  it('filters items in real-time when searching by keyword', () => {
    render(<TabBreakdown tabSummaries={sampleSummaries} topItems={[]} totalChaos={3300} allItems={sampleItems} />);

    const searchInput = screen.getByPlaceholderText('搜尋物品名稱/種類...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Divine' } });
    expect(screen.getByText('Divine Orb')).toBeInTheDocument();
    expect(screen.queryByText('Chaos Orb')).not.toBeInTheDocument();
  });

  it('triggers onChangeBulkMultiplier when bulk multiplier is selected', () => {
    const onChangeBulkMultiplier = vi.fn();
    render(
      <TabBreakdown
        tabSummaries={sampleSummaries}
        topItems={[]}
        totalChaos={3300}
        allItems={sampleItems}
        bulkMultiplier={1.0}
        onChangeBulkMultiplier={onChangeBulkMultiplier}
      />
    );

    const bulkSelect = screen.getByTitle('大宗出售溢價乘數 (Bulk Multiplier)');
    expect(bulkSelect).toBeInTheDocument();
    fireEvent.change(bulkSelect, { target: { value: '1.2' } });
    expect(onChangeBulkMultiplier).toHaveBeenCalledWith(1.2);
  });
});

