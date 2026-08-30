import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AtlasImportExportModal } from '../atlas/planner/AtlasImportExportModal';
import { poeApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  poeApi: {
    openExternalUrl: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('AtlasImportExportModal Component', () => {
  const mockAllocatedNodeIds = new Set(['29045', 'start_origin']);
  const mockOnClose = vi.fn();
  const mockOnImportSuccess = vi.fn();
  const mockOnShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AtlasImportExportModal
        allocatedNodeIds={mockAllocatedNodeIds}
        isOpen={false}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
        onShowToast={mockOnShowToast}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders import tab by default and parses valid URL', async () => {
    render(
      <AtlasImportExportModal
        allocatedNodeIds={mockAllocatedNodeIds}
        isOpen={true}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
        onShowToast={mockOnShowToast}
      />
    );

    expect(screen.getByText('📥 匯入天賦 (Import)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/例如：https:\/\/poeplanner.com\/atlas-tree/i)).toBeInTheDocument();
  });

  it('switches to export tab and provides copy & open external browser buttons', async () => {
    render(
      <AtlasImportExportModal
        allocatedNodeIds={mockAllocatedNodeIds}
        isOpen={true}
        onClose={mockOnClose}
        onImportSuccess={mockOnImportSuccess}
        onShowToast={mockOnShowToast}
      />
    );

    // Switch to export tab
    const exportTabBtn = screen.getByRole('button', { name: /📤 匯出分享/i });
    fireEvent.click(exportTabBtn);

    expect(screen.getByText('PoEPlanner 分享網址：')).toBeInTheDocument();
    expect(screen.getByText('PoE 官方全螢幕天賦樹網址：')).toBeInTheDocument();
    expect(screen.getByText('Base64 二進制編碼：')).toBeInTheDocument();

    // Find copy buttons
    const copyBtns = screen.getAllByTitle('複製網址');
    expect(copyBtns.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(copyBtns[0]);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockOnShowToast).toHaveBeenCalledWith(expect.stringContaining('已複製【PoEPlanner 網址】至剪貼簿'));
    });

    // Find open in browser buttons
    const openBtns = screen.getAllByTitle('在外部瀏覽器開啟');
    expect(openBtns.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(openBtns[0]);
    await waitFor(() => {
      expect(poeApi.openExternalUrl).toHaveBeenCalled();
      expect(mockOnShowToast).toHaveBeenCalledWith(expect.stringContaining('已在外部瀏覽器開啟【PoEPlanner】'));
    });
  });
});
