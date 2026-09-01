import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverlayHeader } from '../OverlayHeader';
import type { ParsedItem } from '../../../types/poe';

describe('OverlayHeader Component', () => {
  const mockItem: ParsedItem = {
    name: '魔血',
    baseType: '重革腰帶',
    rarity: 'Unique',
    itemLevel: 85,
    language: 'zh',
    rawText: 'mock',
    corrupted: false,
    implicits: [],
    explicits: []
  };

  it('renders item name, base type, and unique rarity style correctly', () => {
    render(
      <OverlayHeader
        parsedItem={mockItem}
        onClose={vi.fn()}
        onOpenOfficialTrade={vi.fn()}
      />
    );

    expect(screen.getByText('魔血')).toBeInTheDocument();
    expect(screen.getByText(/重革腰帶/)).toBeInTheDocument();
    expect(screen.getByText('傳奇')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <OverlayHeader
        parsedItem={mockItem}
        onClose={onClose}
        onOpenOfficialTrade={vi.fn()}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /關閉/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenOfficialTrade when trade market icon is clicked', () => {
    const onOpen = vi.fn();
    render(
      <OverlayHeader
        parsedItem={mockItem}
        onClose={vi.fn()}
        onOpenOfficialTrade={onOpen}
      />
    );

    const tradeBtn = screen.getByRole('button', { name: /官方市集/i });
    fireEvent.click(tradeBtn);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
