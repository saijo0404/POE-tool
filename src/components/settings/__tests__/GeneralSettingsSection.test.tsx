import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneralSettingsSection } from '../GeneralSettingsSection';
import type { AppSettings } from '../../../domain/settings/types';

describe('GeneralSettingsSection Component', () => {
  const defaultSettings: AppSettings = {
    league: 'Settlers',
    poesessid: '',
    accountName: '',
    autoSnapshotEnabled: true,
    autoSnapshotIntervalMinutes: 60,
    useDemoData: false,
    focusModeEnabled: false
  };

  it('renders settings fields including focusModeEnabled checkbox', () => {
    const setSettings = vi.fn();
    render(<GeneralSettingsSection settings={defaultSettings} setSettings={setSettings} />);

    expect(screen.getByPlaceholderText('例如: Settlers 或 Auto')).toHaveValue('Settlers');
    expect(screen.getByLabelText(/啟用雙版本專注模式/i)).not.toBeChecked();
  });

  it('toggles focusModeEnabled when checkbox clicked', () => {
    const setSettings = vi.fn();
    render(<GeneralSettingsSection settings={defaultSettings} setSettings={setSettings} />);

    fireEvent.click(screen.getByLabelText(/啟用雙版本專注模式/i));
    expect(setSettings).toHaveBeenCalledTimes(1);
  });

  it('opens FeatureCapabilityMatrixModal when clicking matrix button', () => {
    const setSettings = vi.fn();
    render(<GeneralSettingsSection settings={defaultSettings} setSettings={setSettings} />);

    expect(
      screen.queryByText(/PoE 1 vs PoE 2 功能支援與世代能力對照表/i)
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /查看 PoE 1 vs PoE 2 世代能力與功能支援對照表/i })
    );

    expect(
      screen.getByText(/PoE 1 vs PoE 2 功能支援與世代能力對照表/i)
    ).toBeInTheDocument();
  });
});
