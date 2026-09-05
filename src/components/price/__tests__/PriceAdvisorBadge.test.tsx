import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceAdvisorBadge } from '../PriceAdvisorBadge';
import type { TradeListing } from '../../../types/poe';

function mockListing(amount: number, currency: string = 'chaos'): TradeListing {
  const isDivine = currency.toLowerCase() === 'divine';
  return {
    id: `l-${Math.random()}`,
    whisper: '@whisper',
    onlineStatus: 'online',
    priceAmount: amount,
    priceCurrency: currency,
    priceInChaos: isDivine ? amount * 150 : amount,
    priceInDivine: isDivine ? amount : amount / 150,
    indexed: '2026-09-05T00:00:00Z',
    item: {
      name: 'Item',
      typeLine: 'Base',
      icon: ''
    }
  };
}

describe('PriceAdvisorBadge', () => {
  it('renders nothing when listings array is empty', () => {
    const { container } = render(<PriceAdvisorBadge listings={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders fair price and quick sell price when listings are provided', () => {
    const listings = [
      mockListing(50), mockListing(52), mockListing(55),
      mockListing(58), mockListing(60), mockListing(62)
    ];
    render(<PriceAdvisorBadge listings={listings} />);

    expect(screen.getByText(/市集抗壓價估值/i)).toBeDefined();
    expect(screen.getByText(/建議合理市價/i)).toBeDefined();
    expect(screen.getByText(/56.5c/i)).toBeDefined();
  });

  it('displays price-fixing warning banner when outliers exist', () => {
    const listings = [
      mockListing(5), mockListing(8), mockListing(10),
      mockListing(100), mockListing(105), mockListing(110), mockListing(115),
      mockListing(120), mockListing(125), mockListing(130), mockListing(135)
    ];
    render(<PriceAdvisorBadge listings={listings} />);

    expect(screen.getByText(/疑似壓價掛牌/i)).toBeDefined();
  });
});
