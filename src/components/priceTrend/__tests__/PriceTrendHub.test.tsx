import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PriceTrendHub } from '../PriceTrendHub';

describe('PriceTrendHub', () => {
  it('renders correctly with asset list and trend chart', () => {
    const onShowToast = vi.fn();
    render(<PriceTrendHub league="Settlers" divineRate={150} onShowToast={onShowToast} />);

    expect(screen.getByText('高價值資產價格走勢與波動預警')).toBeInTheDocument();
    expect(screen.getAllByText('Mageblood (魔血)').length).toBeGreaterThan(0);
    expect(screen.getByText('7 天走勢分析與歷史行情折線圖')).toBeInTheDocument();
  });

  it('allows opening and closing the price alert modal', () => {
    render(<PriceTrendHub league="Settlers" divineRate={150} />);

    const alertBtn = screen.getByText(/自訂價格警報/);
    fireEvent.click(alertBtn);

    expect(screen.getByText('自訂價格門檻警報通知')).toBeInTheDocument();

    const closeBtn = screen.getByText('關閉');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('自訂價格門檻警報通知')).not.toBeInTheDocument();
  });

  it('triggers manual price alert evaluation', () => {
    const onShowToast = vi.fn();
    render(<PriceTrendHub league="Settlers" divineRate={150} onShowToast={onShowToast} />);

    const checkBtn = screen.getByText('立即檢查價格');
    fireEvent.click(checkBtn);

    expect(onShowToast).toHaveBeenCalled();
  });
});
