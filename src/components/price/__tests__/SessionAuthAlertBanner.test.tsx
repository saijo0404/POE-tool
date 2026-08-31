import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionAuthAlertBanner } from '../SessionAuthAlertBanner';
import { SettingsContext } from '../../../context/settingsContextDef';
import type { SettingsContextType } from '../../../context/settingsContextDef';

describe('SessionAuthAlertBanner Component', () => {
  const mockLogin = vi.fn();
  const mockContextValue: SettingsContextType = {
    settings: {
      league: 'Settlers',
      poesessid: 'test_sess',
      accountName: 'TestExile',
      autoSnapshotEnabled: true,
      autoSnapshotIntervalMinutes: 60,
      useDemoData: false
    },
    characters: [],
    sessionHealth: {
      state: 'expired',
      message: '憑證已過期',
      lastCheckedEpochMs: Date.now(),
      hasPoesessid: true,
      hasCfClearance: false
    },
    isLoading: false,
    activeLeague: 'Settlers',
    divineRate: 150,
    isRateRefreshing: false,
    updateSettings: vi.fn(),
    refreshSettings: vi.fn(),
    refreshCharacters: vi.fn(),
    refreshDivineRate: vi.fn(),
    checkSessionHealth: vi.fn(),
    login: mockLogin,
    logout: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderBanner = (props?: {
    errorMessage?: string;
    onDismiss?: () => void;
    onReauthorized?: () => void;
  }) => {
    return render(
      <SettingsContext.Provider value={mockContextValue}>
        <SessionAuthAlertBanner {...props} />
      </SettingsContext.Provider>
    );
  };

  it('renders session expired title and message when error is standard expired', () => {
    renderBanner({
      errorMessage: '[AUTH_SESSION_EXPIRED] 官方 POESESSID 憑證已過期或失效 (403)'
    });

    expect(screen.getByText('官方 POESESSID 憑證已過期或失效 (403)')).toBeInTheDocument();
    expect(screen.getByText('一鍵重新授權登入')).toBeInTheDocument();
  });

  it('renders Cloudflare challenge title when error mentions Cloudflare / Turnstile', () => {
    renderBanner({
      errorMessage: '[CLOUDFLARE_CHALLENGE] 遭遇官方 Cloudflare WAF / Turnstile 安全驗證 (403)'
    });

    expect(screen.getByText('遭遇 Cloudflare WAF / Turnstile 安全驗證 (403)')).toBeInTheDocument();
    expect(screen.getByText(/官方市集啟用了安全人機驗證/)).toBeInTheDocument();
  });

  it('calls login when reauthorize button is clicked and triggers onReauthorized on success', async () => {
    mockLogin.mockResolvedValueOnce({ success: true, accountName: 'TestExile' });
    const onReauthorized = vi.fn();

    renderBanner({
      errorMessage: '403 Forbidden',
      onReauthorized
    });

    const button = screen.getByRole('button', { name: /一鍵重新授權登入/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(onReauthorized).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    renderBanner({
      errorMessage: '403 Forbidden',
      onDismiss
    });

    const closeBtn = screen.getByTitle('關閉提示');
    fireEvent.click(closeBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
