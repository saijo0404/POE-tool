import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerDefenseProfileCard } from '../PlayerDefenseProfileCard';
import { DEFAULT_PLAYER_PROFILE } from '../../../domain/waystone/waystoneModsCatalog';

describe('PlayerDefenseProfileCard', () => {
  it('renders resistance fields, pools, and preset buttons', () => {
    const onChange = vi.fn();
    render(<PlayerDefenseProfileCard profile={DEFAULT_PLAYER_PROFILE} onChange={onChange} />);

    expect(screen.getByText('火抗')).toBeInTheDocument();
    expect(screen.getByText('冰抗')).toBeInTheDocument();
    expect(screen.getByText('電抗')).toBeInTheDocument();
    expect(screen.getByText('混抗')).toBeInTheDocument();
    expect(screen.getByText(/生命池/i)).toBeInTheDocument();
    expect(screen.getByText(/一般標準流派/i)).toBeInTheDocument();
  });

  it('triggers onChange when clicking a preset button', () => {
    const onChange = vi.fn();
    render(<PlayerDefenseProfileCard profile={DEFAULT_PLAYER_PROFILE} onChange={onChange} />);

    fireEvent.click(screen.getByText('秒回坦克流派'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ recoveryMechanism: 'regen', lifePool: 6500 })
    );
  });

  it('triggers onChange when selecting recovery mechanism', () => {
    const onChange = vi.fn();
    render(<PlayerDefenseProfileCard profile={DEFAULT_PLAYER_PROFILE} onChange={onChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'regen' } });
    expect(onChange).toHaveBeenCalledWith({ recoveryMechanism: 'regen' });
  });
});
