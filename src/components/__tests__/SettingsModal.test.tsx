import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsModal } from '../SettingsModal';
import axios from 'axios';

vi.mock('axios');

describe('SettingsModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onShowToast: vi.fn(),
    onSettingsUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders settings fields including hotkey setting, test connection, and stash tab selector', async () => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url.includes('/api/settings')) {
        return Promise.resolve({
          data: {
            league: 'Settlers',
            poesessid: 'test_sessid_123',
            accountName: 'TestAcc',
            autoSnapshotEnabled: true,
            autoSnapshotIntervalMinutes: 60,
            hotkey: 'ctrl+c+d'
          }
        });
      }
      if (url.includes('/api/wealth/stash-tabs')) {
        return Promise.resolve({
          data: [
            { i: 0, id: 't0', n: '通貨頁', type: 'CurrencyStash' },
            { i: 1, id: 't1', n: '卡片頁', type: 'DivinationCardStash' },
            { i: 2, id: 't2', n: '四倍頁', type: 'QuadStash' }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<SettingsModal {...defaultProps} />);

    expect(screen.getByText(/系統設定 \(POE Tool Settings\)/i)).toBeInTheDocument();
    expect(screen.getByText(/遊戲內自動查價快捷鍵/i)).toBeInTheDocument();
    expect(screen.getByText(/免設定！在遊戲中只需按下 Ctrl\+C/i)).toBeInTheDocument();
    expect(screen.getByText(/測試官方連線/i)).toBeInTheDocument();
    expect(screen.getByText(/倉庫頁資產追蹤自選/i)).toBeInTheDocument();
  });

  it('handles loading stash tabs and quick action buttons', async () => {
    const mockTabs = [
      { i: 0, id: 't0', n: 'Currency', type: 'CurrencyStash' },
      { i: 1, id: 't1', n: 'Fragments', type: 'FragmentStash' },
      { i: 2, id: 't2', n: 'Dump Tab', type: 'NormalStash' }
    ];

    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url.includes('/api/settings')) {
        return Promise.resolve({
          data: {
            league: 'Settlers',
            poesessid: 'sess123',
            accountName: 'Tester',
            autoSnapshotEnabled: true,
            autoSnapshotIntervalMinutes: 60
          }
        });
      }
      if (url.includes('/api/wealth/stash-tabs')) {
        return Promise.resolve({ data: mockTabs });
      }
      return Promise.resolve({ data: [] });
    });

    render(<SettingsModal {...defaultProps} />);

    // Click load stash tabs button
    const loadBtn = screen.getByRole('button', { name: /載入\/更新倉庫清單/i });
    fireEvent.click(loadBtn);

    await waitFor(() => {
      expect(screen.getByText(/全選 \(3 頁\)/i)).toBeInTheDocument();
    });

    // Click quick select for currency only
    const currencyOnlyBtn = screen.getByText(/僅主要通貨\/碎片頁/i);
    fireEvent.click(currencyOnlyBtn);

    // Click save
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { success: true } });
    const saveBtn = screen.getByText(/儲存變更/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(defaultProps.onSettingsUpdated).toHaveBeenCalled();
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<SettingsModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });
});
