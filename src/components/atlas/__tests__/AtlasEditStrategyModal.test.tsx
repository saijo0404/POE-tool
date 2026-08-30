import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtlasEditStrategyModal } from '../AtlasEditStrategyModal';
import type { AtlasStrategy } from '../../../domain/atlas/types';

describe('AtlasEditStrategyModal Component (Issue #13)', () => {
  const mockStrategy: AtlasStrategy = {
    id: 'strat_123',
    name: '莊園作物收割配置',
    category: 'harvest',
    description: '專注黃命能與作物階級提升',
    tags: ['莊園', '命能', '高收益'],
    tiers: [
      {
        id: 'tier_1',
        name: '入門低配',
        recommendedMaps: ['劇毒林地'],
        coreKeystones: ['專注單一'],
        atlasTreeUrl: 'https://poeplanner.com/atlas-tree/sample',
        mechanicNotes: '瓦爾寶珠點黃圖',
        scarabs: [],
        extraItems: []
      }
    ]
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    strategy: mockStrategy,
    onSave: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders pre-filled form fields when open', () => {
    render(<AtlasEditStrategyModal {...defaultProps} />);

    expect(screen.getByDisplayValue('莊園作物收割配置')).toBeInTheDocument();
    expect(screen.getByDisplayValue('專注黃命能與作物階級提升')).toBeInTheDocument();
    expect(screen.getByDisplayValue('莊園, 命能, 高收益')).toBeInTheDocument();
    expect(screen.getByDisplayValue('劇毒林地')).toBeInTheDocument();
    expect(screen.getByDisplayValue('專注單一')).toBeInTheDocument();
  });

  it('submits updated strategy with Chinese and English comma parsing', () => {
    const onSave = vi.fn();
    render(<AtlasEditStrategyModal {...defaultProps} onSave={onSave} />);

    // Change name
    const nameInput = screen.getByDisplayValue('莊園作物收割配置');
    fireEvent.change(nameInput, { target: { value: '莊園極致命能' } });

    // Change category to expedition
    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'expedition' } });

    // Change tags with mixed commas
    const tagsInput = screen.getByDisplayValue('莊園, 命能, 高收益');
    fireEvent.change(tagsInput, { target: { value: '探險，炸墳, 日誌' } });

    // Change maps with mixed commas
    const mapsInput = screen.getByDisplayValue('劇毒林地');
    fireEvent.change(mapsInput, { target: { value: '幽閉墓穴，要塞, 濱海幽穴' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /儲存策略設定/i });
    fireEvent.click(submitBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedStrat: AtlasStrategy = onSave.mock.calls[0][0];
    expect(savedStrat.name).toBe('莊園極致命能');
    expect(savedStrat.category).toBe('expedition');
    expect(savedStrat.tags).toEqual(['探險', '炸墳', '日誌']);
    expect(savedStrat.tiers[0].recommendedMaps).toEqual(['幽閉墓穴', '要塞', '濱海幽穴']);
  });

  it('correctly clears tags, maps, and keystones when input is emptied', () => {
    const onSave = vi.fn();
    render(<AtlasEditStrategyModal {...defaultProps} onSave={onSave} />);

    // Clear maps & keystones & tags
    const tagsInput = screen.getByDisplayValue('莊園, 命能, 高收益');
    fireEvent.change(tagsInput, { target: { value: '' } });

    const mapsInput = screen.getByDisplayValue('劇毒林地');
    fireEvent.change(mapsInput, { target: { value: '' } });

    const keystonesInput = screen.getByDisplayValue('專注單一');
    fireEvent.change(keystonesInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /儲存策略設定/i });
    fireEvent.click(submitBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedStrat: AtlasStrategy = onSave.mock.calls[0][0];
    expect(savedStrat.tags).toEqual([]);
    expect(savedStrat.tiers[0].recommendedMaps).toEqual([]);
    expect(savedStrat.tiers[0].coreKeystones).toEqual([]);
  });

  it('clicking preset tag pills toggles or appends tags', () => {
    render(<AtlasEditStrategyModal {...defaultProps} />);

    // Click preset tag pill "速刷"
    const quickTag = screen.getByRole('button', { name: /\+ 速刷/i });
    fireEvent.click(quickTag);

    const tagsInput = screen.getByPlaceholderText(/例如: 速刷, 高利潤, 命運卡/i) as HTMLInputElement;
    expect(tagsInput.value).toContain('速刷');
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<AtlasEditStrategyModal {...defaultProps} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /刪除策略/i });
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith('strat_123');
  });
});
