import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MapModHub } from '../MapModHub';

// Mock SettingsContext and Sound
vi.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {},
    updateSettings: vi.fn()
  })
}));

vi.mock('../../application/audio/alertSound', () => ({
  playDangerAlertSound: vi.fn()
}));

describe('MapModHub Component', () => {
  it('should render headers and sections properly', () => {
    render(<MapModHub />);
    expect(screen.getByText(/地圖危險詞綴警示 & 倉庫 Regex 產生器/i)).toBeDefined();
    expect(screen.getByText(/流派致命詞綴黑名單配置/i)).toBeDefined();
    expect(screen.getByText(/PoE 倉庫\/市集超短 Regex 產生器/i)).toBeDefined();
    expect(screen.getByText(/即時地圖危險詞綴測試區/i)).toBeDefined();
  });

  it('should allow clicking preset buttons and copy button', () => {
    const onShowToast = vi.fn();
    render(<MapModHub onShowToast={onShowToast} />);

    const rfButton = screen.getByText(/正義之火/i);
    expect(rfButton).toBeDefined();
    fireEvent.click(rfButton);

    const copyBtn = screen.getByText(/一鍵複製 Regex/i);
    expect(copyBtn).toBeDefined();
    fireEvent.click(copyBtn);
    expect(onShowToast).toHaveBeenCalled();
  });
});
