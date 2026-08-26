import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActLevelingGuide } from '../ActLevelingGuide';

describe('ActLevelingGuide Component', () => {
  const onShowToast = vi.fn();

  it('renders Act 1 overview and step checklist by default', () => {
    render(<ActLevelingGuide onShowToast={onShowToast} />);

    expect(screen.getByText(/拓荒章節快速攻略助手/i)).toBeInTheDocument();
    expect(screen.getAllByText(/第一章：絕望海灘/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/暮光海灘/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/海潮孤島/i)[0]).toBeInTheDocument();
  });

  it('switches between Acts', () => {
    render(<ActLevelingGuide onShowToast={onShowToast} />);

    const act2Btn = screen.getByRole('button', { name: /ACT 2/i });
    fireEvent.click(act2Btn);

    expect(screen.getAllByText(/第二章：瓦爾森林與盜賊領主/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/罪孽之殿/i)[0]).toBeInTheDocument();
  });

  it('switches starting character class and updates recommended rewards', () => {
    render(<ActLevelingGuide onShowToast={onShowToast} />);

    const rangerBtn = screen.getByText(/遊俠 \(Ranger\)/i);
    fireEvent.click(rangerBtn);

    expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('RANGER'));
  });

  it('toggles step completion state', () => {
    render(<ActLevelingGuide onShowToast={onShowToast} />);

    const firstStepCheckbox = screen.getAllByTitle(/標記為已完成/i)[0];
    fireEvent.click(firstStepCheckbox);

    expect(screen.getByText(/已完成 1 \//i)).toBeInTheDocument();
  });

  it('toggles mini HUD mode', () => {
    render(<ActLevelingGuide onShowToast={onShowToast} />);

    const hudBtn = screen.getByText(/開啟極簡置頂 HUD/i);
    fireEvent.click(hudBtn);

    expect(screen.getByText(/ACT 1 拓荒極簡 HUD/i)).toBeInTheDocument();
  });
});
