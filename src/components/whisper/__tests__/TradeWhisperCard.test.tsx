import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeWhisperCard } from '../TradeWhisperCard';
import type { TradeWhisper } from '../../../domain/tradeWhisper/types';

describe('TradeWhisperCard', () => {
  const dummyWhisper: TradeWhisper = {
    id: 'tw-1',
    sender: 'ProBuyer',
    guildTag: 'VIP',
    itemName: 'Mageblood Heavy Belt',
    price: '200 divine',
    league: 'Settlers',
    stashTab: 'Special',
    position: { left: 4, top: 8 },
    rawMessage: '@From <VIP> ProBuyer: Hi...',
    timestamp: Date.now(),
    status: 'pending'
  };

  it('renders buyer, guild, item, and price correctly', () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();

    render(
      <TradeWhisperCard
        whisper={dummyWhisper}
        onAction={onAction}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText(/ProBuyer/)).toBeDefined();
    expect(screen.getByText(/<VIP>/)).toBeDefined();
    expect(screen.getAllByText(/Mageblood Heavy Belt/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('200 divine')).toBeDefined();
  });

  it('triggers onAction callback for all 5 quick action buttons', () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();

    render(
      <TradeWhisperCard
        whisper={dummyWhisper}
        onAction={onAction}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText('組隊'));
    expect(onAction).toHaveBeenCalledWith(dummyWhisper, 'invite');

    fireEvent.click(screen.getByText('稍候'));
    expect(onAction).toHaveBeenCalledWith(dummyWhisper, 'wait');

    fireEvent.click(screen.getByText('交易'));
    expect(onAction).toHaveBeenCalledWith(dummyWhisper, 'trade');

    fireEvent.click(screen.getByText('謝踢'));
    expect(onAction).toHaveBeenCalledWith(dummyWhisper, 'thanksAndKick');

    fireEvent.click(screen.getByText('藏身處'));
    expect(onAction).toHaveBeenCalledWith(dummyWhisper, 'hideout');
  });

  it('triggers onDismiss when close button is clicked', () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();

    render(
      <TradeWhisperCard
        whisper={dummyWhisper}
        onAction={onAction}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByTitle('關閉此密語卡片'));
    expect(onDismiss).toHaveBeenCalledWith('tw-1');
  });
});
