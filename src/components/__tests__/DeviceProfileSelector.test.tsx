import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeviceProfileSelector } from '../common/DeviceProfileSelector';

describe('DeviceProfileSelector component', () => {
  it('renders all 3 profile options', () => {
    render(<DeviceProfileSelector mode="desktop" onModeChange={vi.fn()} />);

    expect(screen.getByText('標準桌面')).toBeInTheDocument();
    expect(screen.getByText('Steam Deck / 掌機')).toBeInTheDocument();
    expect(screen.getByText('精簡 HUD')).toBeInTheDocument();
    expect(screen.getByText('48px 觸控友善')).toBeInTheDocument();
  });

  it('triggers onModeChange when an option is clicked', () => {
    const onModeChangeMock = vi.fn();
    render(<DeviceProfileSelector mode="desktop" onModeChange={onModeChangeMock} />);

    const steamDeckBtn = screen.getByText('Steam Deck / 掌機');
    fireEvent.click(steamDeckBtn);

    expect(onModeChangeMock).toHaveBeenCalledWith('steam-deck');
  });

  it('displays detection suggestion badge when suggestedMode differs from active mode', () => {
    render(
      <DeviceProfileSelector
        mode="desktop"
        suggestedMode="steam-deck"
        onModeChange={vi.fn()}
      />
    );

    expect(screen.getByText(/偵測建議：Steam Deck/)).toBeInTheDocument();
  });
});
