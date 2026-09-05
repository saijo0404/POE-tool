import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeliriumForecasterCard } from '../DeliriumForecasterCard';

describe('DeliriumForecasterCard', () => {
  it('renders title and default 60% delirium forecaster', () => {
    render(<DeliriumForecasterCard divineRate={150} />);

    expect(screen.getByText(/迷霧瞻妄階層回報與寶珠精算/)).toBeInTheDocument();
    expect(screen.getByText(/預估淨收益/)).toBeInTheDocument();
    expect(screen.getByText(/60% 瞻妄度/)).toBeInTheDocument();
  });

  it('changes delirium percent to 100% when clicking 100% button', () => {
    render(<DeliriumForecasterCard divineRate={150} />);

    const btn100 = screen.getByText('100% (5 顆)');
    fireEvent.click(btn100);

    expect(screen.getByText(/100% 瞻妄度/)).toBeInTheDocument();
    expect(screen.getByText(/怪物減傷: -96%/)).toBeInTheDocument();
  });

  it('updates reward pool when choosing currency from select', () => {
    render(<DeliriumForecasterCard divineRate={150} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'currency' } });

    expect(select).toHaveValue('currency');
  });
});
