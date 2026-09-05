import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AffixFilterList } from '../AffixFilterList';
import { createDefaultAffixFilterProps, pseudoMods } from './affixFilterTestMocks';

describe('AffixFilterList - Mod List, Custom Affixes & Pseudo Stats', () => {
  it('renders mod list, toggles mod status, and adjusts min/max values', () => {
    const defaultProps = createDefaultAffixFilterProps();
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
    const defaultProps = createDefaultAffixFilterProps();
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

  it('renders pseudo stats category and roll percentage slider', () => {
    const defaultProps = createDefaultAffixFilterProps();
    const setRollPercentage = vi.fn();

    render(
      <AffixFilterList
        {...defaultProps}
        mods={pseudoMods}
        rollPercentage={80}
        setRollPercentage={setRollPercentage}
      />
    );

    // Pseudo group
    expect(screen.getByText(/偽屬性 \(Pseudo Stats - 總抗\/總生命\)/i)).toBeInTheDocument();
    expect(screen.getByText(/\+#% 總元素抗性 \(Pseudo\)/i)).toBeInTheDocument();

    // Tier badge
    expect(screen.getByText('T1')).toBeInTheDocument();

    // Roll percentage slider and preset button
    expect(screen.getByText(/數值門檻 \(Roll %\):/i)).toBeInTheDocument();
    expect(screen.getAllByText('80%').length).toBeGreaterThanOrEqual(1);

    const preset90Btn = screen.getByRole('button', { name: '90%' });
    fireEvent.click(preset90Btn);
    expect(setRollPercentage).toHaveBeenCalledWith(90);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(setRollPercentage).toHaveBeenCalledWith(75);
  });
});
