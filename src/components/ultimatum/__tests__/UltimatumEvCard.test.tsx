import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UltimatumEvCard } from '../UltimatumEvCard';

describe('UltimatumEvCard', () => {
  it('renders title and initial EV analysis correctly', () => {
    render(<UltimatumEvCard divineRate={150} />);

    expect(screen.getByText(/通牒命運試煉期望回報精算/)).toBeInTheDocument();
    expect(screen.getByText(/挺進期望淨收益/)).toBeInTheDocument();
    expect(screen.getByText(/第 3 \/ 10 輪/)).toBeInTheDocument();
  });

  it('updates round when clicking round selector button', () => {
    render(<UltimatumEvCard divineRate={150} />);

    const r7Button = screen.getByText('R7');
    fireEvent.click(r7Button);

    expect(screen.getByText(/第 7 \/ 10 輪/)).toBeInTheDocument();
  });

  it('toggles weakness and detects conflict with matching active mod', () => {
    render(<UltimatumEvCard divineRate={150} />);

    // Toggle "無法回血/依賴偷取" button
    const noRecoveryBtn = screen.getByText('無法回血/依賴偷取');
    fireEvent.click(noRecoveryBtn);

    // Add blood_offering mod
    const addModBtn = screen.getByText('+ 新增');
    fireEvent.click(addModBtn);

    // Should display warning
    expect(screen.getByText(/致命衝突/)).toBeInTheDocument();
  });
});
