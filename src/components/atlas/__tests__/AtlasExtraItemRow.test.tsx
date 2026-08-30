import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtlasExtraItemRow } from '../AtlasExtraItemRow';
import type { AtlasTierExtraItem } from '../../../domain/atlas/types';

describe('AtlasExtraItemRow Component (Issue #16)', () => {
  const craftAmbush: AtlasTierExtraItem = {
    id: 'craft_ambush',
    name: '地圖工藝：伏擊 (Ambush)',
    nameEn: 'Ambush Craft',
    category: 'craft',
    count: 1,
    unitPriceChaos: 7
  };

  const defaultProps = {
    item: craftAmbush,
    ninjaRates: {},
    divineRate: 150,
    onUpdate: vi.fn(),
    onRemove: vi.fn()
  };

  it('renders item name, category badge and unit price', () => {
    render(<AtlasExtraItemRow {...defaultProps} />);
    expect(screen.getByText('地圖工藝：伏擊 (Ambush)')).toBeInTheDocument();
    expect(screen.getByText('地圖工藝')).toBeInTheDocument();
    const priceInput = screen.getByRole('spinbutton');
    expect(priceInput).toHaveValue(7);
  });

  it('calls onUpdate immediately when unit price is changed', () => {
    const onUpdate = vi.fn();
    render(<AtlasExtraItemRow {...defaultProps} onUpdate={onUpdate} />);
    const priceInput = screen.getByRole('spinbutton');

    fireEvent.change(priceInput, { target: { value: '10' } });
    expect(onUpdate).toHaveBeenCalledWith('craft_ambush', { unitPriceChaos: 10 });
  });

  it('supports updating unit price to 0', () => {
    const onUpdate = vi.fn();
    render(<AtlasExtraItemRow {...defaultProps} onUpdate={onUpdate} />);
    const priceInput = screen.getByRole('spinbutton');

    fireEvent.change(priceInput, { target: { value: '0' } });
    expect(onUpdate).toHaveBeenCalledWith('craft_ambush', { unitPriceChaos: 0 });
  });

  it('allows renaming item by clicking the edit button and saving with check button', () => {
    const onUpdate = vi.fn();
    render(<AtlasExtraItemRow {...defaultProps} onUpdate={onUpdate} />);

    // Click edit button
    const editBtn = screen.getByRole('button', { name: '修改名稱' });
    fireEvent.click(editBtn);

    // Should display text input for name
    const nameInput = screen.getByDisplayValue('地圖工藝：伏擊 (Ambush)');
    expect(nameInput).toBeInTheDocument();

    // Type new name
    fireEvent.change(nameInput, { target: { value: '伏擊 (6分產出)' } });

    // Click save button
    const saveBtn = screen.getByTitle(/確認|儲存/i);
    fireEvent.click(saveBtn);

    expect(onUpdate).toHaveBeenCalledWith('craft_ambush', { name: '伏擊 (6分產出)' });
  });

  it('allows renaming item and saving with Enter key', () => {
    const onUpdate = vi.fn();
    render(<AtlasExtraItemRow {...defaultProps} onUpdate={onUpdate} />);

    const editBtn = screen.getByRole('button', { name: '修改名稱' });
    fireEvent.click(editBtn);

    const nameInput = screen.getByDisplayValue('地圖工藝：伏擊 (Ambush)');
    fireEvent.change(nameInput, { target: { value: '自訂伏擊' } });
    fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

    expect(onUpdate).toHaveBeenCalledWith('craft_ambush', { name: '自訂伏擊' });
  });

  it('cancels renaming when clicking cancel button or pressing Escape key', () => {
    const onUpdate = vi.fn();
    render(<AtlasExtraItemRow {...defaultProps} onUpdate={onUpdate} />);

    const editBtn = screen.getByRole('button', { name: '修改名稱' });
    fireEvent.click(editBtn);

    const nameInput = screen.getByDisplayValue('地圖工藝：伏擊 (Ambush)');
    fireEvent.change(nameInput, { target: { value: '放棄的名稱' } });

    // Press Escape
    fireEvent.keyDown(nameInput, { key: 'Escape', code: 'Escape' });

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('地圖工藝：伏擊 (Ambush)')).toBeInTheDocument();
  });

  it('enters edit mode on double click on the item name', () => {
    render(<AtlasExtraItemRow {...defaultProps} />);
    const nameElem = screen.getByText('地圖工藝：伏擊 (Ambush)');
    fireEvent.doubleClick(nameElem);

    expect(screen.getByDisplayValue('地圖工藝：伏擊 (Ambush)')).toBeInTheDocument();
  });
});
