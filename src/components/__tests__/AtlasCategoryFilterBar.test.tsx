import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AtlasCategoryFilterBar } from '../atlas/AtlasCategoryFilterBar';
import type { AtlasStrategy } from '../../domain/atlas/types';

describe('AtlasCategoryFilterBar', () => {
  const mockStrategies: AtlasStrategy[] = [
    {
      id: 'strat-1',
      name: '精髓收割流',
      category: 'essence',
      description: '快速收集各階精髓',
      tags: ['精髓'],
      tiers: []
    },
    {
      id: 'strat-2',
      name: '莊園採收流',
      category: 'harvest',
      description: '種田命能賺錢',
      tags: ['莊園'],
      tiers: []
    }
  ];

  it('renders all category tabs including default "all" tab', () => {
    render(
      <AtlasCategoryFilterBar
        strategies={mockStrategies}
        filterCategory="all"
        onFilterCategory={vi.fn()}
      />
    );

    expect(screen.getByText('全部機制')).toBeInTheDocument();
    expect(screen.getByText('精髓')).toBeInTheDocument();
    expect(screen.getByText('莊園收割')).toBeInTheDocument();
  });

  it('triggers onFilterCategory when category tab is clicked', () => {
    const onFilterMock = vi.fn();
    render(
      <AtlasCategoryFilterBar
        strategies={mockStrategies}
        filterCategory="all"
        onFilterCategory={onFilterMock}
      />
    );

    fireEvent.click(screen.getByText('精髓'));
    expect(onFilterMock).toHaveBeenCalledWith('essence');
  });

  it('triggers onDeleteCategory when delete category button is clicked', () => {
    const onDeleteMock = vi.fn();
    render(
      <AtlasCategoryFilterBar
        strategies={mockStrategies}
        filterCategory="all"
        onFilterCategory={vi.fn()}
        onDeleteCategory={onDeleteMock}
      />
    );

    const deleteBtn = screen.getByTitle('刪除【精髓】分類及其下所有策略');
    fireEvent.click(deleteBtn);
    expect(onDeleteMock).toHaveBeenCalledWith('essence');
  });
});
