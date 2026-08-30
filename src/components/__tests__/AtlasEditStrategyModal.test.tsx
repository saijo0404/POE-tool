import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AtlasEditStrategyModal } from '../atlas/AtlasEditStrategyModal';
import type { AtlasStrategy } from '../../domain/atlas/types';

describe('AtlasEditStrategyModal Component', () => {
  const mockStrategy: AtlasStrategy = {
    id: 'strat-test-1',
    name: '初期精華速刷',
    category: 'essence',
    description: '快速收集各階精華並速刷 T16',
    tags: ['精華', '速刷'],
    tiers: [
      {
        id: 'tier-1',
        name: '入門小資 (Budget Starter)',
        description: '低成本配置',
        recommendedMaps: ['劇毒林地', '濱海幽穴'],
        coreKeystones: ['第七道門', '專注單一'],
        scarabs: [],
        extraItems: [],
        mechanicNotes: '瓦爾寶珠點恐懼/忌妒/傲慢/輕蔑',
        allocatedNodes: ['29045']
      }
    ]
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AtlasEditStrategyModal
        isOpen={false}
        onClose={mockOnClose}
        strategy={mockStrategy}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal form with strategy data when isOpen is true', () => {
    render(
      <AtlasEditStrategyModal
        isOpen={true}
        onClose={mockOnClose}
        strategy={mockStrategy}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByDisplayValue('初期精華速刷')).toBeInTheDocument();
    expect(screen.getByDisplayValue('劇毒林地, 濱海幽穴')).toBeInTheDocument();
    expect(screen.getByDisplayValue('第七道門, 專注單一')).toBeInTheDocument();
    expect(screen.getByDisplayValue('精華, 速刷')).toBeInTheDocument();
    expect(screen.getByText('輿圖天賦樹網址 / 代碼 (PoEPlanner / 官方網址 / Base64)：')).toBeInTheDocument();
  });

  it('submits updated strategy and parses atlas tree URL into allocatedNodes', () => {
    render(
      <AtlasEditStrategyModal
        isOpen={true}
        onClose={mockOnClose}
        strategy={mockStrategy}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    const nameInput = screen.getByDisplayValue('初期精華速刷');
    fireEvent.change(nameInput, { target: { value: '頂級精華收割' } });

    // Enter a valid PoEPlanner/Base64 tree URL
    const urlInput = screen.getByPlaceholderText(/https:\/\/poeplanner\.com\/atlas-tree/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://poeplanner.com/atlas-tree/BAAFABAA' }
    });

    const submitBtn = screen.getByRole('button', { name: /儲存策略設定/i });
    fireEvent.click(submitBtn);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    const savedStrategy: AtlasStrategy = mockOnSave.mock.calls[0][0];
    expect(savedStrategy.name).toBe('頂級精華收割');
    expect(savedStrategy.tiers[0].atlasTreeUrl).toBe('https://poeplanner.com/atlas-tree/BAAFABAA');
    expect(Array.isArray(savedStrategy.tiers[0].allocatedNodes)).toBe(true);
  });
});
