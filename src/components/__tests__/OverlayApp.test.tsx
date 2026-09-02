import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverlayApp } from '../OverlayApp';

vi.mock('../../utils/tauri', () => ({
  isTauri: vi.fn(() => false),
  toggleAlwaysOnTop: vi.fn()
}));

vi.mock('../../hooks/useSettings', () => ({
  useSettings: vi.fn(() => ({
    settings: {
      overlayOpacity: 0.9,
      overlayScale: 1.0,
      overlayClickThrough: false,
      overlayAutoCloseOnBlur: true
    },
    activeLeague: 'Settlers'
  }))
}));

describe('OverlayApp', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders default ready state when no item and no whisper', () => {
    render(<OverlayApp />);
    expect(screen.getByText(/POE Tool 懸浮查價視窗已就緒/)).toBeDefined();
  });
});
