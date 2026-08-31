import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountAuthSection } from '../AccountAuthSection';
import type { AppSettings, SessionHealthInfo } from '../../../domain/settings/types';

describe('AccountAuthSection Component', () => {
  const defaultSettings: AppSettings = {
    league: 'Settlers',
    poesessid: 'test_sess_123',
    accountName: 'Tester#1234',
    autoSnapshotEnabled: true,
    autoSnapshotIntervalMinutes: 60,
    useDemoData: false
  };

  const defaultProps = {
    settings: defaultSettings,
    setSettings: vi.fn(),
    characters: [],
    sessionHealth: null,
    loggingIn: false,
    loginError: null,
    testingConn: false,
    testResult: null,
    onLogin: vi.fn(),
    onLogout: vi.fn(),
    onTestConnection: vi.fn()
  };

  it('renders input fields for POESESSID and account name', () => {
    render(<AccountAuthSection {...defaultProps} />);

    expect(screen.getByPlaceholderText('請貼上 POESESSID...')).toHaveValue('test_sess_123');
    expect(screen.getByPlaceholderText('例如: Exile#1234')).toHaveValue('Tester#1234');
    expect(screen.getByRole('button', { name: /一鍵登入官方帳號/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /測試官方連線/i })).toBeInTheDocument();
  });

  it('renders health badge according to session health state', () => {
    const validHealth: SessionHealthInfo = {
      state: 'valid',
      message: '有效',
      lastCheckedEpochMs: Date.now(),
      hasPoesessid: true,
      hasCfClearance: true
    };
    const { rerender } = render(
      <AccountAuthSection {...defaultProps} sessionHealth={validHealth} />
    );
    expect(screen.getByText(/官方憑證有效/)).toBeInTheDocument();

    const expiredHealth: SessionHealthInfo = {
      state: 'expired',
      message: '過期',
      lastCheckedEpochMs: Date.now(),
      hasPoesessid: true,
      hasCfClearance: false
    };
    rerender(<AccountAuthSection {...defaultProps} sessionHealth={expiredHealth} />);
    expect(screen.getByText(/憑證已過期/)).toBeInTheDocument();

    const cfHealth: SessionHealthInfo = {
      state: 'cloudflareBlocked',
      message: 'WAF',
      lastCheckedEpochMs: Date.now(),
      hasPoesessid: true,
      hasCfClearance: false
    };
    rerender(<AccountAuthSection {...defaultProps} sessionHealth={cfHealth} />);
    expect(screen.getByText(/需 Cloudflare 安全驗證/)).toBeInTheDocument();
  });

  it('triggers login, logout, and test connection callbacks', () => {
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    const onTestConnection = vi.fn();

    render(
      <AccountAuthSection
        {...defaultProps}
        onLogin={onLogin}
        onLogout={onLogout}
        onTestConnection={onTestConnection}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /一鍵登入官方帳號/i }));
    expect(onLogin).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /測試官方連線/i }));
    expect(onTestConnection).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /登出/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
