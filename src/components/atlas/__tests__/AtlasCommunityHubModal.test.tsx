import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AtlasCommunityHubModal } from '../AtlasCommunityHubModal';
import { encodeAtlasStrategyShareCode } from '../../../domain/atlas/atlasShareCodec';
import { COMMUNITY_STRATEGIES } from '../../../domain/atlas/communityStrategies';

describe('AtlasCommunityHubModal Component (Issue #93)', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onImportStrategy: vi.fn(),
    currentStrategy: COMMUNITY_STRATEGIES[0]
  };

  it('renders curated strategies list by default', () => {
    render(<AtlasCommunityHubModal {...defaultProps} />);

    expect(screen.getByText('輿圖策略社群雲端分享中心')).toBeInTheDocument();
    expect(screen.getByText(/軍團沙丘極速發家配置/)).toBeInTheDocument();
    expect(screen.getByText(/甲蟲狂歡極致掉落流/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /套用策略/ }).length).toBeGreaterThan(0);
  });

  it('calls onImportStrategy when applying curated strategy', () => {
    const onImportStrategy = vi.fn();
    const onClose = vi.fn();
    render(<AtlasCommunityHubModal {...defaultProps} onImportStrategy={onImportStrategy} onClose={onClose} />);

    const applyBtns = screen.getAllByRole('button', { name: /套用策略/ });
    fireEvent.click(applyBtns[0]);

    expect(onImportStrategy).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches to share code tab and imports valid share code', () => {
    const onImportStrategy = vi.fn();
    render(<AtlasCommunityHubModal {...defaultProps} onImportStrategy={onImportStrategy} />);

    const shareCodeTab = screen.getByText('短代碼匯入/分享');
    fireEvent.click(shareCodeTab);

    expect(screen.getByText(/目前使用中的策略短代碼/)).toBeInTheDocument();

    const sampleCode = encodeAtlasStrategyShareCode(COMMUNITY_STRATEGIES[1]);
    const textarea = screen.getByPlaceholderText(/在此貼上 POEATLAS-v1-\.\.\./);
    fireEvent.change(textarea, { target: { value: sampleCode } });

    const form = screen.getByText('解析並匯入為新策略').closest('form')!;
    fireEvent.submit(form);

    expect(onImportStrategy).toHaveBeenCalledWith(expect.objectContaining({
      name: COMMUNITY_STRATEGIES[1].name,
      category: COMMUNITY_STRATEGIES[1].category
    }));
  });

  it('displays error on invalid share code', () => {
    render(<AtlasCommunityHubModal {...defaultProps} />);

    const shareCodeTab = screen.getByText('短代碼匯入/分享');
    fireEvent.click(shareCodeTab);

    const textarea = screen.getByPlaceholderText(/在此貼上 POEATLAS-v1-\.\.\./);
    fireEvent.change(textarea, { target: { value: 'BAD-CODE-123' } });

    const form = screen.getByText('解析並匯入為新策略').closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/短代碼無效，必須以 POEATLAS-v1- 開頭/)).toBeInTheDocument();
  });

  it('switches to bulk shopping list tab and displays items', () => {
    render(<AtlasCommunityHubModal {...defaultProps} />);

    const shoppingTab = screen.getByText('批量備料採購單');
    fireEvent.click(shoppingTab);

    expect(screen.getByText(/預估備料總成本/)).toBeInTheDocument();
    expect(screen.getByText(/50 場/)).toBeInTheDocument();
  });
});
