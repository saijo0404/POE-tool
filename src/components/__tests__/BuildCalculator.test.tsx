import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BuildCalculator } from '../BuildCalculator';

describe('BuildCalculator Component', () => {
  const defaultProps = {
    league: 'Settlers',
    onShowToast: () => {},
  };

  it('renders input field and calculate cost button', () => {
    render(<BuildCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText(/poe\.ninja/i)).toBeInTheDocument();
    expect(screen.getByText(/計算成本/i)).toBeInTheDocument();
  });
});
