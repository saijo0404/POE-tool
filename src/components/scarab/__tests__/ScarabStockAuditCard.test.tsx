import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScarabStockAuditCard } from '../ScarabStockAuditCard';

describe('ScarabStockAuditCard', () => {
  it('renders title, strategy buttons, and initial stock status', () => {
    render(<ScarabStockAuditCard onShowToast={vi.fn()} />);
    expect(screen.getByText(/聖甲蟲庫存自動盤點與成套率精算/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /50 場伏擊保險箱策略/ })).toBeInTheDocument();
    expect(screen.getByText(/當前倉庫甲蟲庫存/)).toBeInTheDocument();
  });

  it('updates stock count via input and recalculates playable runs', () => {
    render(<ScarabStockAuditCard onShowToast={vi.fn()} />);
    const ambushInput = screen.getByLabelText('伏擊聖甲蟲 庫存');
    fireEvent.change(ambushInput, { target: { value: '10' } });

    // 10 / 2 = 5 runs
    expect(screen.getByText(/5 \/ 50 場/)).toBeInTheDocument();
  });

  it('copies bulk whisper message when button is clicked', () => {
    const handleToast = vi.fn();
    render(<ScarabStockAuditCard onShowToast={handleToast} />);

    const copyBtn = screen.getByRole('button', { name: /複製大宗採購指令/ });
    fireEvent.click(copyBtn);

    expect(handleToast).toHaveBeenCalledWith('已複製大宗採購密語指令！');
  });

  it('switches strategy when another strategy button is clicked', () => {
    render(<ScarabStockAuditCard onShowToast={vi.fn()} />);
    const harvestBtn = screen.getByRole('button', { name: /30 場莊園命運種植策略/ });
    fireEvent.click(harvestBtn);

    expect(screen.getAllByText(/加倍收割聖甲蟲/).length).toBeGreaterThan(0);
  });
});
