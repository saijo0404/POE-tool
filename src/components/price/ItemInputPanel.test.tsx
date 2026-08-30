import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemInputPanel } from './ItemInputPanel';

describe('ItemInputPanel Component', () => {
  it('renders input area, placeholder, and sample button', () => {
    const onChangeRawText = vi.fn();
    const onInsertSample = vi.fn();

    render(
      <ItemInputPanel
        rawText=""
        onChangeRawText={onChangeRawText}
        onInsertSample={onInsertSample}
      />
    );

    const textarea = screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i);
    expect(textarea).toBeInTheDocument();

    const sampleBtn = screen.getByRole('button', { name: /範例裝備/i });
    expect(sampleBtn).toBeInTheDocument();
    fireEvent.click(sampleBtn);
    expect(onInsertSample).toHaveBeenCalledTimes(1);

    // Verify "讀取剪貼簿" button does NOT exist
    expect(screen.queryByText(/讀取剪貼簿/i)).toBeNull();
  });

  it('updates text when user types into the textarea', () => {
    const onChangeRawText = vi.fn();
    const onInsertSample = vi.fn();

    render(
      <ItemInputPanel
        rawText="Initial Text"
        onChangeRawText={onChangeRawText}
        onInsertSample={onInsertSample}
      />
    );

    const textarea = screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial Text');

    fireEvent.change(textarea, { target: { value: 'New Item Text' } });
    expect(onChangeRawText).toHaveBeenCalledWith('New Item Text');
  });

  it('renders search button and handles searching state and click events', () => {
    const onChangeRawText = vi.fn();
    const onInsertSample = vi.fn();
    const onSearchTrade = vi.fn();

    const { rerender } = render(
      <ItemInputPanel
        rawText="Rarity: Rare\nRing"
        onChangeRawText={onChangeRawText}
        onInsertSample={onInsertSample}
        onSearchTrade={onSearchTrade}
        searching={false}
      />
    );

    const searchBtn = screen.getByRole('button', { name: /立即市集查價/i });
    expect(searchBtn).toBeInTheDocument();
    expect(searchBtn).not.toBeDisabled();

    fireEvent.click(searchBtn);
    expect(onSearchTrade).toHaveBeenCalledTimes(1);

    // When searching is true, button is disabled with searching text
    rerender(
      <ItemInputPanel
        rawText="Rarity: Rare\nRing"
        onChangeRawText={onChangeRawText}
        onInsertSample={onInsertSample}
        onSearchTrade={onSearchTrade}
        searching={true}
      />
    );

    expect(screen.getByRole('button', { name: /查詢中\.\.\./i })).toBeDisabled();
  });

  it('disables search button when rawText is empty or whitespace', () => {
    const onSearchTrade = vi.fn();

    render(
      <ItemInputPanel
        rawText="   "
        onChangeRawText={vi.fn()}
        onInsertSample={vi.fn()}
        onSearchTrade={onSearchTrade}
      />
    );

    const searchBtn = screen.getByRole('button', { name: /立即市集查價/i });
    expect(searchBtn).toBeDisabled();
  });
});
