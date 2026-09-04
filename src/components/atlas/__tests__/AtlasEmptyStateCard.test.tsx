import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AtlasEmptyStateCard } from '../AtlasEmptyStateCard';

describe('AtlasEmptyStateCard', () => {
  it('renders correctly and triggers onCreateStrategy', () => {
    const handleCreate = vi.fn();
    const handleOpenCommunity = vi.fn();

    render(
      <AtlasEmptyStateCard
        onCreateStrategy={handleCreate}
        onOpenCommunityHub={handleOpenCommunity}
      />
    );

    expect(screen.getByText(/目前尚未建立任何輿圖策略/)).toBeInTheDocument();
    
    const createBtn = screen.getByText(/新增自訂策略/);
    fireEvent.click(createBtn);
    expect(handleCreate).toHaveBeenCalledTimes(1);

    const communityBtn = screen.getByText(/瀏覽社群精選策略/);
    fireEvent.click(communityBtn);
    expect(handleOpenCommunity).toHaveBeenCalledTimes(1);
  });
});
