import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelessJewelCard } from '../TimelessJewelCard';

describe('TimelessJewelCard', () => {
  it('renders title and default Glorious Vanity Doryani evaluation', () => {
    render(<TimelessJewelCard divineRate={150} />);

    expect(screen.getByText(/永恆軍團珠寶種子鑑定/)).toBeInTheDocument();
    expect(screen.getByText(/核心基石：腐化靈魂/)).toBeInTheDocument();
    expect(screen.getByText(/評級 S 階/)).toBeInTheDocument();
    expect(screen.getByText(/血盾混和 \(Hybrid\)/)).toBeInTheDocument();
  });

  it('switches leader when clicking leader button', () => {
    render(<TimelessJewelCard divineRate={150} />);

    const xibaquaBtn = screen.getByText('西巴誇 (Xibaqua)');
    fireEvent.click(xibaquaBtn);

    expect(screen.getByText(/核心基石：神聖血肉/)).toBeInTheDocument();
    expect(screen.getByText(/正義之火 \(RF\)/)).toBeInTheDocument();
  });

  it('switches jewel type when selecting from dropdown', () => {
    render(<TimelessJewelCard divineRate={150} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'lethal_pride' } });

    expect(screen.getByText(/拉基亞塔 \(Rakiata\)/)).toBeInTheDocument();
    expect(screen.getByText(/核心基石：戰爭淬鍊/)).toBeInTheDocument();
  });
});
