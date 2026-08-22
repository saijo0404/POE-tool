import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../Navbar';

describe('Navbar Component', () => {
  const defaultProps = {
    activeTab: 'price' as const,
    setActiveTab: vi.fn(),
    league: 'Settlers',
    divineRate: 160,
    onOpenSettings: vi.fn(),
    accountName: 'TestUser#1234',
  };

  it('renders tab buttons, league name, divine rate and account name', () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getAllByText(/裝備查價/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/每小時資產估算/i)).toBeInTheDocument();
    expect(screen.getByText(/Build 成本/i)).toBeInTheDocument();
    expect(screen.getByText(/Settlers/i)).toBeInTheDocument();
    expect(screen.getByText(/160 Chaos/i)).toBeInTheDocument();
    expect(screen.getByText(/TestUser#1234/i)).toBeInTheDocument();
  });

  it('calls setActiveTab when tabs are clicked', () => {
    render(<Navbar {...defaultProps} />);

    const wealthTab = screen.getByText(/每小時資產估算/i);
    fireEvent.click(wealthTab);
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('wealth');
  });

  it('calls onOpenSettings when settings button is clicked', () => {
    render(<Navbar {...defaultProps} />);

    const settingsBtn = screen.getByText(/TestUser#1234/i).closest('span');
    expect(settingsBtn).toBeInTheDocument();
  });
});
