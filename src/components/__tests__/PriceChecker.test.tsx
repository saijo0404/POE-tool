import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PriceChecker } from '../PriceChecker';
import axios from 'axios';

vi.mock('axios');

describe('PriceChecker Component', () => {
  const defaultProps = {
    league: 'Settlers',
    onShowToast: vi.fn(),
  };

  it('renders input area and clipboard paste button', () => {
    vi.mocked(axios.get).mockResolvedValue({ data: {} });

    render(<PriceChecker {...defaultProps} />);

    expect(screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i)).toBeInTheDocument();
    expect(screen.getAllByText(/讀取剪貼簿/i)[0]).toBeInTheDocument();
  });

  it('handles externalText prop and updates item text', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: {} });
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        name: 'Mageblood',
        baseType: 'Heavy Belt',
        rarity: 'Unique',
        implicits: [],
        explicits: []
      }
    });

    const externalSample = `Rarity: Unique\nMageblood\nHeavy Belt`;
    const { rerender } = render(<PriceChecker {...defaultProps} externalText="" />);

    rerender(<PriceChecker {...defaultProps} externalText={externalSample} />);

    const textarea = screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(externalSample);
  });
});
