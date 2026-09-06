import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EngineBadge } from '../EngineBadge';

describe('EngineBadge Component', () => {
  it('renders PoE 1 badge correctly', () => {
    render(<EngineBadge supportedEngines={['poe1']} />);
    const badge = screen.getByTestId('engine-badge-poe1');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('PoE 1');
  });

  it('renders PoE 2 badge correctly', () => {
    render(<EngineBadge supportedEngines={['poe2']} />);
    const badge = screen.getByTestId('engine-badge-poe2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('PoE 2');
  });

  it('does not render both badge by default when showBoth is false', () => {
    const { container } = render(<EngineBadge supportedEngines={['poe1', 'poe2']} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders both badge when showBoth is true', () => {
    render(<EngineBadge supportedEngines={['poe1', 'poe2']} showBoth />);
    const badge = screen.getByTestId('engine-badge-both');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('雙版本');
  });
});
