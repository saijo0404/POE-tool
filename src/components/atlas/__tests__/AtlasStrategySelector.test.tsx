import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtlasStrategySelector } from '../AtlasStrategySelector';
import type { AtlasStrategy } from '../../../domain/atlas/types';

describe('AtlasStrategySelector Component (Issue #13)', () => {
  const mockStrategies: AtlasStrategy[] = [
    {
      id: 'strat_essence_1',
      name: 'T16 狂亂精髓速刷',
      category: 'essence',
      description: '全點精髓天賦與狂亂精髓',
      tags: ['精髓', '速刷', '低成本'],
      isCustom: false,
      tiers: [
        {
          id: 'tier_1',
          name: '入門低配',
          recommendedMaps: ['劇毒林地'],
          coreKeystones: ['專注單一'],
          scarabs: [],
          extraItems: []
        }
      ]
    },
    {
      id: 'strat_ambush_1',
      name: 'T17 伏擊保險箱',
      category: 'ambush',
      description: '高投報伏擊開箱配置',
      tags: ['伏擊', '高利潤', 'T17'],
      isCustom: true,
      tiers: [
        {
          id: 'tier_2',
          name: '極限頂配',
          recommendedMaps: ['要塞'],
          coreKeystones: ['命運扭曲'],
          scarabs: [],
          extraItems: []
        }
      ]
    }
  ];

  const defaultProps = {
    strategies: mockStrategies,
    selectedStrategyId: 'strat_essence_1',
    onSelectStrategy: vi.fn(),
    filterCategory: 'all' as const,
    onFilterCategory: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
    onNewStrategy: vi.fn(),
    onEditStrategy: vi.fn(),
    onDeleteStrategy: vi.fn(),
    onDeleteCategory: vi.fn(),
    onClearAllStrategies: vi.fn(),
    onExportJson: vi.fn(),
    onImportJson: vi.fn()
  };

  it('renders strategy cards with edit and delete buttons', () => {
    render(<AtlasStrategySelector {...defaultProps} />);

    expect(screen.getByText('T16 狂亂精髓速刷')).toBeInTheDocument();
    expect(screen.getByText('T17 伏擊保險箱')).toBeInTheDocument();

    const editButtons = screen.getAllByTitle(/編輯策略/i);
    expect(editButtons).toHaveLength(2);

    const deleteButtons = screen.getAllByTitle(/刪除策略/i);
    expect(deleteButtons).toHaveLength(2);
  });

  it('clicking edit button triggers onEditStrategy with correct strategy', () => {
    const onEditStrategy = vi.fn();
    render(<AtlasStrategySelector {...defaultProps} onEditStrategy={onEditStrategy} />);

    const editButtons = screen.getAllByTitle(/編輯策略/i);
    fireEvent.click(editButtons[0]);

    expect(onEditStrategy).toHaveBeenCalledTimes(1);
    expect(onEditStrategy).toHaveBeenCalledWith(mockStrategies[0]);
  });

  it('clicking delete button triggers onDeleteStrategy after confirmation', () => {
    const onDeleteStrategy = vi.fn();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<AtlasStrategySelector {...defaultProps} onDeleteStrategy={onDeleteStrategy} />);

    const deleteButtons = screen.getAllByTitle(/刪除策略/i);
    fireEvent.click(deleteButtons[1]);

    expect(onDeleteStrategy).toHaveBeenCalledTimes(1);
    expect(onDeleteStrategy).toHaveBeenCalledWith('strat_ambush_1');
  });

  it('renders dynamic category tabs based on existing strategies', () => {
    render(<AtlasStrategySelector {...defaultProps} />);

    expect(screen.getByText('全部機制')).toBeInTheDocument();
    expect(screen.getByText('精髓')).toBeInTheDocument();
    expect(screen.getByText('伏擊開箱')).toBeInTheDocument();
  });

  it('clicking category tab calls onFilterCategory', () => {
    const onFilterCategory = vi.fn();
    render(<AtlasStrategySelector {...defaultProps} onFilterCategory={onFilterCategory} />);

    const essenceTab = screen.getByText('精髓');
    fireEvent.click(essenceTab);

    expect(onFilterCategory).toHaveBeenCalledWith('essence');
  });
});
