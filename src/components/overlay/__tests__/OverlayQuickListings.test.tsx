import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverlayQuickListings } from '../OverlayQuickListings';
import type { TradeListing } from '../../../types/poe';

describe('OverlayQuickListings Component', () => {
  const mockListings: TradeListing[] = [
    {
      id: 'listing_1',
      whisper: '@PlayerA Hi, buy item',
      accountName: 'ExileGod',
      characterName: 'SlayerChad',
      onlineStatus: 'online',
      priceAmount: 20,
      priceCurrency: 'chaos',
      priceInChaos: 20,
      priceInDivine: 0.1,
      indexed: '5m ago',
      item: {
        name: '罪魔邪冠',
        typeLine: '罪魔邪冠',
        icon: 'http://icon.png',
        rarity: 'Rare'
      }
    }
  ];

  it('renders listings with price and account name', () => {
    render(
      <OverlayQuickListings
        listings={mockListings}
        copiedId={null}
        onCopyWhisper={vi.fn()}
        onTravelToHideout={vi.fn()}
      />
    );

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('chaos')).toBeInTheDocument();
    expect(screen.getByText(/ExileGod/)).toBeInTheDocument();
  });

  it('handles copying whisper', () => {
    const onCopy = vi.fn();
    render(
      <OverlayQuickListings
        listings={mockListings}
        copiedId={null}
        onCopyWhisper={onCopy}
        onTravelToHideout={vi.fn()}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /密語/i });
    fireEvent.click(copyBtn);
    expect(onCopy).toHaveBeenCalledWith(mockListings[0]);
  });

  it('handles travel to hideout direct action', () => {
    const onTravel = vi.fn();
    render(
      <OverlayQuickListings
        listings={mockListings}
        copiedId={null}
        onCopyWhisper={vi.fn()}
        onTravelToHideout={onTravel}
      />
    );

    const travelBtn = screen.getByRole('button', { name: /藏身處/i });
    fireEvent.click(travelBtn);
    expect(onTravel).toHaveBeenCalledWith(mockListings[0]);
  });
});
