import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AtlasStrategyDetails } from '../atlas/AtlasStrategyDetails';
import type { AtlasStrategy, AtlasStrategyTier } from '../../domain/atlas/types';

// Mock AtlasNativePlanner to isolate AtlasStrategyDetails component tests
vi.mock('../atlas/AtlasNativePlanner', () => ({
  AtlasNativePlanner: () => <div data-testid="mock-native-planner">Native Atlas Planner Canvas</div>
}));

describe('AtlasStrategyDetails Component (Issue #7)', () => {
  const mockTier: AtlasStrategyTier = {
    id: 'tier-1',
    name: '入門小資 (Budget Starter)',
    description: '測試入門描述',
    scarabs: [],
    extraItems: [],
    recommendedMaps: ['劇毒林地', '濱海幽穴'],
    coreKeystones: ['第七道門', '專注單一'],
    mechanicNotes: '測試刷圖技巧與機制要點',
    allocatedNodes: ['29045', 'start_origin']
  };

  const mockStrategy: AtlasStrategy = {
    id: 'strat-1',
    name: '精華收割流',
    category: 'essence',
    description: '快速收集各階精華',
    tags: ['精華', '小資'],
    tiers: [mockTier]
  };

  const mockProps = {
    strategy: mockStrategy,
    currentTier: mockTier,
    onEditStrategy: vi.fn(),
    onDuplicateStrategy: vi.fn(),
    onDeleteStrategy: vi.fn(),
    onSaveAllocatedNodes: vi.fn(),
    onShowToast: vi.fn()
  };

  it('renders strategy header details, maps, and keystones correctly', () => {
    render(<AtlasStrategyDetails {...mockProps} />);

    expect(screen.getByText('精華收割流')).toBeInTheDocument();
    expect(screen.getByText('當前分級：入門小資 (Budget Starter)')).toBeInTheDocument();
    expect(screen.getByText('測試入門描述')).toBeInTheDocument();

    expect(screen.getByText('📍 劇毒林地')).toBeInTheDocument();
    expect(screen.getByText('📍 濱海幽穴')).toBeInTheDocument();
    expect(screen.getByText('⭐ 第七道門')).toBeInTheDocument();
    expect(screen.getByText('⭐ 專注單一')).toBeInTheDocument();
    expect(screen.getByText('測試刷圖技巧與機制要點')).toBeInTheDocument();
  });

  it('does NOT render legacy external browser open or copy URL buttons at strategy top bar', () => {
    render(<AtlasStrategyDetails {...mockProps} />);

    // Issue #7: The legacy top external buttons should be removed
    expect(screen.queryByText('外部瀏覽器開啟')).not.toBeInTheDocument();
    expect(screen.queryByText('複製網址')).not.toBeInTheDocument();
  });

  it('toggles AtlasNativePlanner visibility when collapse/expand button is clicked', () => {
    render(<AtlasStrategyDetails {...mockProps} />);

    // Initially expanded
    expect(screen.getByTestId('mock-native-planner')).toBeInTheDocument();
    const toggleBtn = screen.getByRole('button', { name: /收合天賦規劃畫布/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleBtn);
    expect(screen.queryByTestId('mock-native-planner')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /展開天賦規劃畫布/i })).toBeInTheDocument();

    // Click to expand again
    fireEvent.click(screen.getByRole('button', { name: /展開天賦規劃畫布/i }));
    expect(screen.getByTestId('mock-native-planner')).toBeInTheDocument();
  });

  it('triggers onEditStrategy and onDuplicateStrategy callbacks', () => {
    render(<AtlasStrategyDetails {...mockProps} />);

    const editBtn = screen.getByRole('button', { name: /編輯策略資料/i });
    fireEvent.click(editBtn);
    expect(mockProps.onEditStrategy).toHaveBeenCalledTimes(1);

    const dupBtn = screen.getByTitle('複製此策略');
    fireEvent.click(dupBtn);
    expect(mockProps.onDuplicateStrategy).toHaveBeenCalledTimes(1);
  });

  it('triggers onDeleteStrategy when confirmed', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AtlasStrategyDetails {...mockProps} />);

    const deleteBtn = screen.getByRole('button', { name: /刪除策略/i });
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockProps.onDeleteStrategy).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });
});
