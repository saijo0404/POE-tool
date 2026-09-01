import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverlaySettingsSection } from '../OverlaySettingsSection';

describe('OverlaySettingsSection Component', () => {
  it('renders overlay settings controls properly', () => {
    render(
      <OverlaySettingsSection
        settings={{
          overlayEnabled: true,
          overlayOpacity: 0.85,
          overlayClickThrough: false,
          overlayAutoCloseOnBlur: true,
          overlayScale: 1.0
        }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(/遊戲內懸浮查價卡片/)).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('triggers onChange when checkboxes or sliders change', () => {
    const onChange = vi.fn();
    render(
      <OverlaySettingsSection
        settings={{
          overlayEnabled: true,
          overlayOpacity: 0.85,
          overlayClickThrough: false,
          overlayAutoCloseOnBlur: true,
          overlayScale: 1.0
        }}
        onChange={onChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledWith('overlayEnabled', false);
  });
});
