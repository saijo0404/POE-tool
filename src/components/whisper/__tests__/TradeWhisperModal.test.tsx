import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TradeWhisperModal } from '../TradeWhisperModal';

vi.mock('../../../utils/tauri', () => ({
  isTauri: vi.fn(() => false)
}));

describe('TradeWhisperModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TradeWhisperModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content when isOpen is true', () => {
    render(
      <TradeWhisperModal isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByText(/交易密語懸浮助理與快捷操作/)).toBeDefined();
    expect(screen.getByText(/點選範例快速模擬買家密語/)).toBeDefined();
  });
});
