import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HotkeySettingsCard } from '../HotkeySettingsCard';
import type { AppSettings } from '../../../domain/settings/types';

describe('HotkeySettingsCard', () => {
  const dummySettings: Partial<AppSettings> = {
    hotkey: 'ctrl+d',
    overlayPinned: false,
    overlayOpacity: 0.9
  };

  it('renders hotkey actions and presets correctly', () => {
    render(<HotkeySettingsCard settings={dummySettings} onChange={vi.fn()} />);

    expect(screen.getByText(/自訂全域快捷鍵與視窗釘選/)).toBeInTheDocument();
    expect(screen.getByText(/物品即時查價/)).toBeInTheDocument();
    expect(screen.getByText(/地圖致命詞綴檢測/)).toBeInTheDocument();
    expect(screen.getByText(/懸浮視窗自適應釘選/)).toBeInTheDocument();
  });

  it('changes preset and calls onChange with new bindings', () => {
    const handleChange = vi.fn();
    render(<HotkeySettingsCard settings={dummySettings} onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'left_hand' } });

    expect(handleChange).toHaveBeenCalledWith('hotkeyBindings', expect.objectContaining({
      priceCheck: 'ctrl+q',
      overlayPin: 'ctrl+space'
    }));
  });

  it('toggles overlay pinned checkbox', () => {
    const handleChange = vi.fn();
    render(<HotkeySettingsCard settings={dummySettings} onChange={handleChange} />);

    const pinCheckbox = screen.getByRole('checkbox', { name: /懸浮視窗自適應釘選/ });
    fireEvent.click(pinCheckbox);

    expect(handleChange).toHaveBeenCalledWith('overlayPinned', true);
  });
});
