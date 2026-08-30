import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtlasExtraItemsConfig } from '../AtlasExtraItemsConfig';
import type { AtlasTierExtraItem } from '../../../domain/atlas/types';

describe('AtlasExtraItemsConfig Component (Issue #12)', () => {
  const craftAmbush: AtlasTierExtraItem = {
    id: 'craft_ambush',
    name: '地圖工藝：伏擊 (Ambush)',
    nameEn: 'Ambush Craft',
    category: 'craft',
    count: 1,
    unitPriceChaos: 7
  };

  const t16Map: AtlasTierExtraItem = {
    id: 'map_t16',
    name: 'T16 地圖 (Tier 16 Map)',
    nameEn: 'Tier 16 Map',
    category: 'map',
    count: 1,
    unitPriceChaos: 4
  };

  const defaultProps = {
    extraItems: [],
    onAddExtraItem: vi.fn(),
    onRemoveExtraItem: vi.fn(),
    onUpdateExtraItem: vi.fn(),
    ninjaRates: {},
    divineRate: 150
  };

  it('renders empty state placeholder when extraItems is empty', () => {
    render(<AtlasExtraItemsConfig {...defaultProps} extraItems={[]} />);
    expect(screen.getByText(/尚無額外物品或地圖工藝支出/i)).toBeInTheDocument();
  });

  it('locks count stepper to 1 for craft items and displays lock badge', () => {
    render(<AtlasExtraItemsConfig {...defaultProps} extraItems={[craftAmbush]} />);
    expect(screen.getByText('地圖工藝：伏擊 (Ambush)')).toBeInTheDocument();
    expect(screen.getByText(/1 次 \(固定\)/i)).toBeInTheDocument();
    // Stepper + / - buttons should not exist for craft item
    expect(screen.queryByRole('button', { name: '+' })).not.toBeInTheDocument();
  });

  it('renders normal count stepper for non-craft items', () => {
    render(<AtlasExtraItemsConfig {...defaultProps} extraItems={[t16Map]} />);
    expect(screen.getByText('T16 地圖 (Tier 16 Map)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '-' })).toBeInTheDocument();
  });

  it('calls onAddExtraItem when clicking a preset craft pill', () => {
    const onAdd = vi.fn();
    render(<AtlasExtraItemsConfig {...defaultProps} onAddExtraItem={onAdd} />);
    const essencePill = screen.getByRole('button', { name: /\+ 地圖工藝：精髓/i });
    fireEvent.click(essencePill);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.stringContaining('地圖工藝：精髓'),
        category: 'craft',
        count: 1
      })
    );
  });

  it('highlights active craft preset and clicking active craft calls onRemoveExtraItem', () => {
    const onRemove = vi.fn();
    render(
      <AtlasExtraItemsConfig
        {...defaultProps}
        extraItems={[craftAmbush]}
        onRemoveExtraItem={onRemove}
      />
    );

    // Active craft preset should show without '+' and with checkmark
    const activePill = screen.getByRole('button', { name: /地圖工藝：伏擊/i });
    expect(activePill).toBeInTheDocument();
    fireEvent.click(activePill);
    expect(onRemove).toHaveBeenCalledWith('craft_ambush');
  });

  it('shows replacement warning and locks count in custom form when craft is selected', () => {
    render(
      <AtlasExtraItemsConfig
        {...defaultProps}
        extraItems={[craftAmbush]}
      />
    );

    // Open custom form
    const openBtn = screen.getByRole('button', { name: /自訂新增項目/i });
    fireEvent.click(openBtn);

    expect(screen.getByText(/將自動替換現有工藝【地圖工藝：伏擊】/i)).toBeInTheDocument();
    expect(screen.getByText(/\(工藝固定為 1\)/i)).toBeInTheDocument();
  });

  it('calls onUpdateExtraItem when modifying unit price in item row (Issue #16)', () => {
    const onUpdate = vi.fn();
    render(
      <AtlasExtraItemsConfig
        {...defaultProps}
        extraItems={[craftAmbush]}
        onUpdateExtraItem={onUpdate}
      />
    );

    const priceInput = screen.getByRole('spinbutton');
    fireEvent.change(priceInput, { target: { value: '10' } });
    expect(onUpdate).toHaveBeenCalledWith('craft_ambush', { unitPriceChaos: 10 });
  });

  it('calls onUpdateExtraItem when editing item name in item row (Issue #16)', () => {
    const onUpdate = vi.fn();
    render(
      <AtlasExtraItemsConfig
        {...defaultProps}
        extraItems={[craftAmbush]}
        onUpdateExtraItem={onUpdate}
      />
    );

    const editBtn = screen.getByRole('button', { name: '修改名稱' });
    fireEvent.click(editBtn);

    const nameInput = screen.getByDisplayValue('地圖工藝：伏擊 (Ambush)');
    fireEvent.change(nameInput, { target: { value: '伏擊 (6分產出)' } });

    const saveBtn = screen.getByTitle(/確認|儲存/i);
    fireEvent.click(saveBtn);

    expect(onUpdate).toHaveBeenCalledWith('craft_ambush', { name: '伏擊 (6分產出)' });
  });

  it('remembers custom craft price when re-selecting preset after price modification (Issue #16)', () => {
    localStorage.clear();
    const onAdd = vi.fn();
    const onUpdate = vi.fn();

    const { rerender } = render(
      <AtlasExtraItemsConfig
        {...defaultProps}
        extraItems={[craftAmbush]}
        onAddExtraItem={onAdd}
        onUpdateExtraItem={onUpdate}
      />
    );

    // Modify ambush craft price to 10
    const priceInput = screen.getByRole('spinbutton');
    fireEvent.change(priceInput, { target: { value: '10' } });
    expect(onUpdate).toHaveBeenCalledWith('craft_ambush', { unitPriceChaos: 10 });

    // Preset pill should now reflect 10c
    expect(screen.getByRole('button', { name: /地圖工藝：伏擊 \(10c\)/i })).toBeInTheDocument();

    // Rerender with essence craft (simulate user switching to essence)
    const craftEssence: AtlasTierExtraItem = {
      id: 'craft_essence',
      name: '地圖工藝：精髓 (Essence)',
      nameEn: 'Essence Craft',
      category: 'craft',
      count: 1,
      unitPriceChaos: 8
    };

    rerender(
      <AtlasExtraItemsConfig
        {...defaultProps}
        extraItems={[craftEssence]}
        onAddExtraItem={onAdd}
        onUpdateExtraItem={onUpdate}
      />
    );

    // Click ambush preset to switch back
    const ambushPill = screen.getByRole('button', { name: /\+ 地圖工藝：伏擊 \(10c\)/i });
    fireEvent.click(ambushPill);

    // Should add ambush with the preserved 10c price!
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        nameEn: 'Ambush Craft',
        unitPriceChaos: 10
      })
    );
  });
});
