import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OverlayApp } from '../OverlayApp';
import { useOverlayPrice } from '../../hooks/useOverlayPrice';

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

vi.mock('../../hooks/useOverlayPrice', () => ({
  useOverlayPrice: vi.fn()
}));

describe('OverlayApp', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders default ready state when no item and no whisper', () => {
    vi.mocked(useOverlayPrice).mockReturnValue({
      parsedItem: null,
      mods: [],
      tradeResults: null,
      searching: false,
      copiedId: null,
      pinned: false,
      setPinned: vi.fn(),
      opacity: 0.9,
      setOpacity: vi.fn(),
      scale: 1.0,
      setScale: vi.fn(),
      clickThrough: false,
      handleToggleClickThrough: vi.fn(),
      dangerEvaluation: null,
      handleCloseOverlay: vi.fn(),
      handleSearchTrade: vi.fn(),
      toggleMod: vi.fn(),
      handleCopyWhisper: vi.fn(),
      handleTravelToHideout: vi.fn(),
      handleOpenOfficialTrade: vi.fn(),
      rawText: '',
      loadAndParseItem: vi.fn()
    });

    render(<OverlayApp />);
    expect(screen.getByText(/POE Tool 懸浮查價視窗已就緒/)).toBeDefined();
  });

  it('renders WeaponSwapIndicator when parsedItem belongs to poe2 engine', () => {
    const mockPoe2Item = {
      name: '尋路石 (階級 15)',
      baseType: '尋路石 (階級 15)',
      rarity: 'Normal' as const,
      language: 'zh' as const,
      implicits: [],
      explicits: [],
      rawText: 'mock',
      engine: 'poe2' as const
    };

    vi.mocked(useOverlayPrice).mockReturnValue({
      parsedItem: mockPoe2Item,
      mods: [],
      tradeResults: null,
      searching: false,
      copiedId: null,
      pinned: false,
      setPinned: vi.fn(),
      opacity: 0.9,
      setOpacity: vi.fn(),
      scale: 1.0,
      setScale: vi.fn(),
      clickThrough: false,
      handleToggleClickThrough: vi.fn(),
      dangerEvaluation: null,
      handleCloseOverlay: vi.fn(),
      handleSearchTrade: vi.fn(),
      toggleMod: vi.fn(),
      handleCopyWhisper: vi.fn(),
      handleTravelToHideout: vi.fn(),
      handleOpenOfficialTrade: vi.fn(),
      rawText: '',
      loadAndParseItem: vi.fn()
    });

    render(<OverlayApp />);
    expect(screen.getByTestId('weapon-swap-indicator')).toBeInTheDocument();
  });
});
