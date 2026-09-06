import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WaystoneHub } from '../WaystoneHub';

describe('WaystoneHub', () => {
  it('renders defense profile, risk card, rolling card, and mechanics guide', () => {
    render(<WaystoneHub />);

    expect(screen.getByText(/PoE 2 銘刻地圖 \(Waystone\) 詞綴評鑑與洗圖精算/i)).toBeInTheDocument();
    expect(screen.getByText(/機體防禦屬性與弱點配置/i)).toBeInTheDocument();
    expect(screen.getByText(/銘刻地圖即時詞綴評鑑/i)).toBeInTheDocument();
    expect(screen.getByText(/洗圖通貨成本期望精算/i)).toBeInTheDocument();
    expect(screen.getByText(/PoE 2 銘刻地圖機制小指南/i)).toBeInTheDocument();
  });

  it('updates evaluation when changing sample text', () => {
    const onShowToast = vi.fn();
    render(<WaystoneHub onShowToast={onShowToast} />);

    const loadBtn = screen.getByText(/帶入範例銘刻地圖/i);
    fireEvent.click(loadBtn);
    expect(onShowToast).toHaveBeenCalledWith('已載入範例 T15 稀有銘刻地圖');
    expect(screen.getByText(/安全評分：/i)).toBeInTheDocument();
  });
});
