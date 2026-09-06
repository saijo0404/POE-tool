import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogDiagnosticsSection } from '../LogDiagnosticsSection';
import poeApi from '../../../services/api';
import type { DiagnosticBundle } from '../../../domain/logger/types';

vi.mock('../../../services/api', () => ({
  default: {
    getDiagnosticBundle: vi.fn(),
    clearLogs: vi.fn(),
    openLogDirectory: vi.fn()
  }
}));

describe('LogDiagnosticsSection Component', () => {
  const mockBundle: DiagnosticBundle = {
    app_version: '3.3.0',
    os: 'linux',
    timestamp: '2026-09-06T08:00:00Z',
    log_file_path: '/home/user/.local/share/poe-tool/logs/poe-tool.log',
    log_file_size_bytes: 2048,
    total_lines: 42,
    recent_logs: '[2026-09-06 08:00:00] [INFO] [System] Application initialized'
  };

  const onShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
    vi.mocked(poeApi.getDiagnosticBundle).mockResolvedValue(mockBundle);
    vi.mocked(poeApi.clearLogs).mockResolvedValue({ success: true });
    vi.mocked(poeApi.openLogDirectory).mockResolvedValue({ success: true });
  });

  it('fetches and displays diagnostic information on load', async () => {
    render(<LogDiagnosticsSection onShowToast={onShowToast} />);

    await waitFor(() => {
      expect(poeApi.getDiagnosticBundle).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('/home/user/.local/share/poe-tool/logs/poe-tool.log')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('toggles log viewer when clicking expand button', async () => {
    render(<LogDiagnosticsSection onShowToast={onShowToast} />);

    await waitFor(() => {
      expect(screen.getByText(/檢視最近脫敏日誌內容/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/檢視最近脫敏日誌內容/i));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue(
      '[2026-09-06 08:00:00] [INFO] [System] Application initialized'
    );

    fireEvent.click(screen.getByText(/檢視最近脫敏日誌內容/i));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('copies diagnostic markdown bundle to clipboard', async () => {
    render(<LogDiagnosticsSection onShowToast={onShowToast} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /複製診斷/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /複製診斷/i }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('### 系統診斷報告 (Diagnostic Bundle)')
      );
    });
    expect(onShowToast).toHaveBeenCalledWith('診斷報告已複製至剪貼簿');
  });

  it('clears logs and refreshes bundle', async () => {
    render(<LogDiagnosticsSection onShowToast={onShowToast} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /清空日誌/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /清空日誌/i }));

    await waitFor(() => {
      expect(poeApi.clearLogs).toHaveBeenCalledTimes(1);
      expect(poeApi.getDiagnosticBundle).toHaveBeenCalledTimes(2);
    });
    expect(onShowToast).toHaveBeenCalledWith('日誌已清空');
  });

  it('calls openLogDirectory when open directory button is clicked', async () => {
    render(<LogDiagnosticsSection onShowToast={onShowToast} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /開啟目錄/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /開啟目錄/i }));

    await waitFor(() => {
      expect(poeApi.openLogDirectory).toHaveBeenCalledTimes(1);
    });
    expect(onShowToast).toHaveBeenCalledWith('已請求開啟日誌目錄');
  });

  it('handles load error gracefully', async () => {
    vi.mocked(poeApi.getDiagnosticBundle).mockRejectedValueOnce(new Error('IPC Failure'));
    render(<LogDiagnosticsSection onShowToast={onShowToast} />);

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalledWith('無法取得日誌診斷資訊');
    });
  });
});
