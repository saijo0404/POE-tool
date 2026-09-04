import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceSnapshotBadge } from '../PriceSnapshotBadge';
import { createPriceSnapshot } from '../../../domain/price/priceSnapshotEngine';

describe('PriceSnapshotBadge (Issue #100)', () => {
  it('renders snapshot status badge when snapshot is present', () => {
    const snapshot = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: [
        { id: '1', name: 'Divine Orb', nameZh: '神聖石', category: 'Currency', chaosValue: 150 }
      ]
    });

    render(<PriceSnapshotBadge snapshot={snapshot} />);

    expect(screen.getByText(/離線物價容災快照：/)).toBeInTheDocument();
    expect(screen.getByText(/最新快照/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /匯出快照/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /匯入快照/i })).toBeInTheDocument();
  });

  it('renders fallback when no snapshot exists', () => {
    render(<PriceSnapshotBadge snapshot={null} />);

    expect(screen.getByText(/尚未建立快照快取/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /匯出快照/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /匯入快照/i })).toBeInTheDocument();
  });

  it('triggers export button click safely', () => {
    const onShowToast = vi.fn();
    const clickSpy = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });

    const snapshot = createPriceSnapshot({
      league: 'Settlers',
      divinePriceChaos: 150,
      items: []
    });

    render(<PriceSnapshotBadge snapshot={snapshot} onShowToast={onShowToast} />);

    const exportBtn = screen.getByRole('button', { name: /匯出快照/i });
    fireEvent.click(exportBtn);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('已成功匯出'));
    vi.restoreAllMocks();
  });
});
