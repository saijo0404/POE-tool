import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabCategoryFilter } from './TabCategoryFilter';

describe('TabCategoryFilter Component', () => {
  it('should render category tabs and handle category change', () => {
    const onChangeCategory = vi.fn();
    render(
      <TabCategoryFilter
        selectedCategory="ALL"
        onChangeCategory={onChangeCategory}
        minValueChaos={0}
        isFilterActive={false}
      />
    );

    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('通貨 Currency')).toBeInTheDocument();

    fireEvent.click(screen.getByText('通貨 Currency'));
    expect(onChangeCategory).toHaveBeenCalledWith('Currency');
  });

  it('should render price threshold select and bulk multiplier when provided', () => {
    const onChangeMinValueChaos = vi.fn();
    const onChangeBulkMultiplier = vi.fn();

    render(
      <TabCategoryFilter
        selectedCategory="ALL"
        minValueChaos={5}
        onChangeMinValueChaos={onChangeMinValueChaos}
        bulkMultiplier={1.2}
        onChangeBulkMultiplier={onChangeBulkMultiplier}
        isFilterActive={true}
        onResetFilters={vi.fn()}
      />
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);

    fireEvent.change(selects[0], { target: { value: '1.4' } });
    expect(onChangeBulkMultiplier).toHaveBeenCalledWith(1.4);

    fireEvent.change(selects[1], { target: { value: '10' } });
    expect(onChangeMinValueChaos).toHaveBeenCalledWith(10);
  });

  it('should trigger reset filters when reset button clicked', () => {
    const onResetFilters = vi.fn();
    render(
      <TabCategoryFilter
        selectedCategory="Currency"
        minValueChaos={10}
        isFilterActive={true}
        onResetFilters={onResetFilters}
      />
    );

    const resetButton = screen.getByRole('button', { name: /重設過濾/ });
    fireEvent.click(resetButton);
    expect(onResetFilters).toHaveBeenCalled();
  });
});
