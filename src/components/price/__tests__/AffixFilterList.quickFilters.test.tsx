import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AffixFilterList } from '../AffixFilterList';
import { createDefaultAffixFilterProps } from './affixFilterTestMocks';

describe('AffixFilterList - Quick Filters & Search Trigger', () => {
  it('renders quick filters and allows changing trade status, links, corruption, and ilvl', () => {
    const defaultProps = createDefaultAffixFilterProps();
    const setTradeStatus = vi.fn();
    const setLinksMin = vi.fn();
    const setCorruptedFilter = vi.fn();
    const setItemLevelMin = vi.fn();

    render(
      <AffixFilterList
        {...defaultProps}
        setTradeStatus={setTradeStatus}
        setLinksMin={setLinksMin}
        setCorruptedFilter={setCorruptedFilter}
        setItemLevelMin={setItemLevelMin}
      />
    );

    // Trade status
    const tradeSelect = screen.getByDisplayValue(/Instant Buyout \(僅即時直購 - 預設\)/i);
    fireEvent.change(tradeSelect, { target: { value: 'any_buyout' } });
    expect(setTradeStatus).toHaveBeenCalledWith('any_buyout');

    // Links min
    const linksSelects = screen.getAllByRole('combobox');
    const linksSelect = linksSelects[1]; // second select
    fireEvent.change(linksSelect, { target: { value: '6' } });
    expect(setLinksMin).toHaveBeenCalledWith(6);
    fireEvent.change(linksSelect, { target: { value: '' } });
    expect(setLinksMin).toHaveBeenCalledWith(undefined);

    // Corrupted filter
    const corruptedSelect = linksSelects[2]; // third select
    fireEvent.change(corruptedSelect, { target: { value: 'yes' } });
    expect(setCorruptedFilter).toHaveBeenCalledWith(true);
    fireEvent.change(corruptedSelect, { target: { value: 'no' } });
    expect(setCorruptedFilter).toHaveBeenCalledWith(false);
    fireEvent.change(corruptedSelect, { target: { value: '' } });
    expect(setCorruptedFilter).toHaveBeenCalledWith(undefined);

    // iLvl min
    const ilvlInput = screen.getByPlaceholderText('無');
    fireEvent.change(ilvlInput, { target: { value: '84' } });
    expect(setItemLevelMin).toHaveBeenCalledWith(84);
  });

  it('triggers search trade and displays searching spinner when searching is true', () => {
    const defaultProps = createDefaultAffixFilterProps();
    const onSearchTrade = vi.fn();

    const { rerender } = render(
      <AffixFilterList {...defaultProps} onSearchTrade={onSearchTrade} searching={false} />
    );

    const searchBtn = screen.getByRole('button', { name: /依選定詞綴查詢市集/i });
    fireEvent.click(searchBtn);
    expect(onSearchTrade).toHaveBeenCalledTimes(1);

    rerender(<AffixFilterList {...defaultProps} onSearchTrade={onSearchTrade} searching={true} />);
    expect(screen.getByRole('button', { name: /查詢中\.\.\./i })).toBeDisabled();
  });
});
