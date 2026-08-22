import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WealthTracker } from '../WealthTracker';
import axios from 'axios';

vi.mock('axios');

describe('WealthTracker Component', () => {
  const defaultProps = {
    league: 'Settlers',
    onShowToast: vi.fn(),
  };

  it('renders snapshot summary and action buttons', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: [
        {
          timestamp: '2026-08-13T20:00:00Z',
          league: 'Settlers',
          totalChaos: 5000,
          totalDivine: 31.25,
          chaosRate: 160,
          hourlyChangeChaos: 100,
          hourlyChangeDivine: 0.62,
          tabSummaries: [],
          topItems: []
        }
      ]
    });

    render(<WealthTracker {...defaultProps} />);

    expect(screen.getByText(/Hourly Wealth Tracker/i)).toBeInTheDocument();
    expect(screen.getAllByText(/立即計算目前資產快照/i)[0]).toBeInTheDocument();
  });
});
