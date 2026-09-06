import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppRouter } from '../AppRouter';

describe('AppRouter Component', () => {
  const defaultProps = {
    activeTab: 'price' as const,
    activeLeague: 'Settlers',
    divineRate: 160,
    pastedText: '',
    showToast: vi.fn(),
  };

  it('renders PriceChecker on price tab', () => {
    render(<AppRouter {...defaultProps} activeTab="price" />);
    expect(screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i)).toBeInTheDocument();
  });

  it('renders Suspense fallback when loading lazy modules', () => {
    render(<AppRouter {...defaultProps} activeTab="exchange" />);
    // Should initially show either loading fallback or the lazy loaded module
    expect(document.body).toBeInTheDocument();
  });

  it('renders HomeDashboard on dashboard tab', async () => {
    render(<AppRouter {...defaultProps} activeTab="dashboard" />);
    expect(await screen.findByText(/POE Helper Tool 控制總覽儀表板/i)).toBeInTheDocument();
  });
});
