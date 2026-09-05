import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeviceBreakEvenCard } from '../DeviceBreakEvenCard';

describe('DeviceBreakEvenCard', () => {
  it('renders card title, metrics, and default craft', () => {
    render(<DeviceBreakEvenCard />);

    expect(screen.getByText('地圖儀工藝成本收益損益平衡預測 (Device Craft Break-even)')).toBeInTheDocument();
    expect(screen.getByText('工藝混沌成本')).toBeInTheDocument();
    expect(screen.getByText('預估毛收益')).toBeInTheDocument();
    expect(screen.getByText('最低損益平衡掉落門檻：')).toBeInTheDocument();
    expect(screen.getByText(/尖嘯\/嘯鳴精髓/)).toBeInTheDocument();
  });

  it('switches craft when pill is clicked', () => {
    render(<DeviceBreakEvenCard />);

    const ambushBtn = screen.getByText(/伏擊/);
    fireEvent.click(ambushBtn);

    expect(screen.getByText(/保險箱通貨\/卡片/)).toBeInTheDocument();
  });

  it('calls onApplyCraftCost when apply button is clicked', () => {
    const handleApply = vi.fn();
    render(
      <DeviceBreakEvenCard
        onApplyCraftCost={handleApply}
        currentCraftCost={0}
      />
    );

    const applyBtn = screen.getByText(/套用工藝成本/);
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith(8); // Essence default cost is 8C
  });

  it('updates parameters when sliders change', () => {
    render(<DeviceBreakEvenCard />);

    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);

    fireEvent.change(sliders[0], { target: { value: '120' } });
    expect(screen.getByText('+120%')).toBeInTheDocument();
  });
});
