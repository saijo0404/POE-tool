import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AffixFilterList } from './AffixFilterList';
import type { ParsedItemMod } from '../../types/poe';

describe('AffixFilterList Component', () => {
  const mockMods: ParsedItemMod[] = [
    {
      id: 'explicit.stat_1',
      text: '+80 to maximum Life',
      englishText: '+80 to maximum Life',
      type: 'explicit',
      value: 80,
      minValue: 70,
      maxValue: 85,
      enabled: true,
    },
    {
      id: 'explicit.stat_2',
      text: '+40% to Fire Resistance',
      englishText: '+40% to Fire Resistance',
      type: 'explicit',
      value: 40,
      minValue: 35,
      enabled: false,
    },
    {
      id: 'custom_123',
      text: '+30 to Strength',
      englishText: '+30 to Strength',
      type: 'explicit',
      value: 30,
      minValue: 25,
      enabled: true,
    }
  ];

  const defaultProps = {
    mods: mockMods,
    tradeStatus: 'instant' as const,
    setTradeStatus: vi.fn(),
    linksMin: undefined,
    setLinksMin: vi.fn(),
    corruptedFilter: undefined,
    setCorruptedFilter: vi.fn(),
    itemLevelMin: undefined,
    setItemLevelMin: vi.fn(),
    onToggleMod: vi.fn(),
    onChangeMinValue: vi.fn(),
    onChangeMaxValue: vi.fn(),
    formatModText: (m: ParsedItemMod) => m.text,
    onAddCustomMod: vi.fn(),
    onRemoveMod: vi.fn(),
    onSearchTrade: vi.fn(),
    searching: false,
  };

  it('renders quick filters and allows changing trade status, links, corruption, and ilvl', () => {
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

  it('renders mod list, toggles mod status, and adjusts min/max values', () => {
    const onToggleMod = vi.fn();
    const onChangeMinValue = vi.fn();
    const onChangeMaxValue = vi.fn();
    const onRemoveMod = vi.fn();

    render(
      <AffixFilterList
        {...defaultProps}
        onToggleMod={onToggleMod}
        onChangeMinValue={onChangeMinValue}
        onChangeMaxValue={onChangeMaxValue}
        onRemoveMod={onRemoveMod}
      />
    );

    expect(screen.getByText('+80 to maximum Life')).toBeInTheDocument();
    expect(screen.getByText('+40% to Fire Resistance')).toBeInTheDocument();
    expect(screen.getByText('自訂詞綴')).toBeInTheDocument();

    // Toggle mod checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onToggleMod).toHaveBeenCalledWith(0);

    // Change Min / Max values
    const inputs = screen.getAllByRole('spinbutton');
    // mod 0 has Min input (value: 70) and Max input (value: 85)
    fireEvent.change(inputs[1], { target: { value: '75' } });
    expect(onChangeMinValue).toHaveBeenCalledWith(0, 75);

    fireEvent.change(inputs[1], { target: { value: '' } });
    expect(onChangeMinValue).toHaveBeenCalledWith(0, undefined);

    fireEvent.change(inputs[2], { target: { value: '90' } });
    expect(onChangeMaxValue).toHaveBeenCalledWith(0, 90);

    // Remove custom mod
    const deleteBtn = screen.getByTitle('刪除此自訂詞綴');
    fireEvent.click(deleteBtn);
    expect(onRemoveMod).toHaveBeenCalledWith(2);
  });

  it('adds custom preset mod and manual custom mod', () => {
    const onAddCustomMod = vi.fn();

    render(<AffixFilterList {...defaultProps} onAddCustomMod={onAddCustomMod} />);

    // Open add custom modal
    const openBtn = screen.getByText(/➕ 新增額外篩選詞綴/i);
    fireEvent.click(openBtn);

    expect(screen.getByText(/選擇常用熱門詞綴或手動輸入：/i)).toBeInTheDocument();

    // Click a preset (e.g. Life)
    const presetBtn = screen.getByText(/\+ \+# 最大生命 \(70\)/i);
    fireEvent.click(presetBtn);

    expect(onAddCustomMod).toHaveBeenCalledWith({
      text: '+# 最大生命',
      englishText: '+# to Maximum Life',
      value: 70,
      minValue: 70,
    });

    // Reopen and test manual addition
    fireEvent.click(screen.getByText(/➕ 新增額外篩選詞綴/i));

    const textInput = screen.getByPlaceholderText(/自訂詞綴名稱/i);
    const minInput = screen.getByPlaceholderText('Min');

    fireEvent.change(textInput, { target: { value: '+20% Spell Damage' } });
    fireEvent.change(minInput, { target: { value: '18' } });

    const confirmBtn = screen.getByRole('button', { name: /確認新增/i });
    fireEvent.click(confirmBtn);

    expect(onAddCustomMod).toHaveBeenCalledWith({
      text: '+20% Spell Damage',
      englishText: '+20% Spell Damage',
      value: 18,
      minValue: 18,
    });
  });

  it('triggers search trade and displays searching spinner when searching is true', () => {
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
