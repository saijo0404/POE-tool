import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AtlasBulkShoppingCard } from '../atlas/AtlasBulkShoppingCard';
import type { AtlasStrategyTier } from '../../domain/atlas/types';

describe('AtlasBulkShoppingCard', () => {
  const mockTier: AtlasStrategyTier = {
    id: 't-1',
    name: '精華極限速刷',
    recommendedMaps: [],
    coreKeystones: [],
    scarabs: [
      {
        id: 's-1',
        name: '昇華之精髓聖甲蟲',
        count: 2,
        customPriceChaos: 5
      }
    ],
    extraItems: [
      {
        id: 'e-1',
        name: '精華工藝',
        category: 'craft',
        count: 1,
        unitPriceChaos: 4
      }
    ],
    estimatedRevenuePerMapChaos: 50
  };

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('renders bulk shopping card and default 50 runs', () => {
    render(<AtlasBulkShoppingCard tier={mockTier} strategyName="精華流" />);
    expect(screen.getByText('大宗備料清單與成本精算')).toBeInTheDocument();
    expect(screen.getByText('昇華之精髓聖甲蟲')).toBeInTheDocument();
    // 2 * 50 = 100
    expect(screen.getByText('x 100')).toBeInTheDocument();
    // 1 * 50 = 50
    expect(screen.getByText('x 50')).toBeInTheDocument();
  });

  it('changes run count when preset button clicked', () => {
    render(<AtlasBulkShoppingCard tier={mockTier} />);
    const btn10 = screen.getByText('10 場');
    fireEvent.click(btn10);
    // 2 * 10 = 20
    expect(screen.getByText('x 20')).toBeInTheDocument();
  });

  it('copies shopping text to clipboard on button click', async () => {
    const toastMock = vi.fn();
    render(<AtlasBulkShoppingCard tier={mockTier} onShowToast={toastMock} />);

    const copyBtn = screen.getByText('複製採購清單');
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(toastMock).toHaveBeenCalledWith(expect.stringContaining('已複製'));
    });
  });

  it('displays empty state when tier has no scarabs or extra items', () => {
    const emptyTier: AtlasStrategyTier = {
      id: 'empty',
      name: '零成本',
      recommendedMaps: [],
      coreKeystones: [],
      scarabs: [],
      extraItems: []
    };
    render(<AtlasBulkShoppingCard tier={emptyTier} />);
    expect(screen.getByText(/未設定聖甲蟲或工藝消耗/)).toBeInTheDocument();
  });
});
